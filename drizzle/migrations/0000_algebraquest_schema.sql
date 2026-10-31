-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Aventurero',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (display_name) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''), 'Aventurero'));
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- LEVELS
CREATE TABLE public.levels (
  id int PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  topics text[] NOT NULL DEFAULT '{}'
);
GRANT SELECT ON public.levels TO authenticated;
GRANT ALL ON public.levels TO service_role;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "levels readable" ON public.levels FOR SELECT TO authenticated USING (true);

-- QUESTIONS (versioned)
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id int NOT NULL REFERENCES public.levels(id),
  position int NOT NULL,
  version int NOT NULL DEFAULT 1,
  prompt text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX questions_active_pos ON public.questions(level_id, position) WHERE active;
GRANT SELECT ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions readable" ON public.questions FOR SELECT TO authenticated USING (true);

CREATE TABLE public.question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  position int NOT NULL,
  label text NOT NULL
);
GRANT SELECT ON public.question_options TO authenticated;
GRANT ALL ON public.question_options TO service_role;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "options readable" ON public.question_options FOR SELECT TO authenticated USING (true);

-- Answer keys: never readable from the browser
CREATE TABLE public.question_keys (
  question_id uuid PRIMARY KEY REFERENCES public.questions(id) ON DELETE CASCADE,
  correct_option_id uuid NOT NULL REFERENCES public.question_options(id),
  explanation text NOT NULL
);
GRANT ALL ON public.question_keys TO service_role;
ALTER TABLE public.question_keys ENABLE ROW LEVEL SECURITY;

-- RESULTS (read-only for students; written only by submit_level)
CREATE TABLE public.level_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  level_id int NOT NULL REFERENCES public.levels(id),
  correct_count int NOT NULL,
  total_questions int NOT NULL,
  points int NOT NULL,
  stars int NOT NULL,
  percentage int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX level_attempts_user ON public.level_attempts(user_id, created_at DESC);
GRANT SELECT ON public.level_attempts TO authenticated;
GRANT ALL ON public.level_attempts TO service_role;
ALTER TABLE public.level_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attempts" ON public.level_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.attempt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.level_attempts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.questions(id),
  question_version int NOT NULL,
  prompt_snapshot text NOT NULL,
  option_id uuid NOT NULL REFERENCES public.question_options(id),
  option_snapshot text NOT NULL,
  is_correct boolean NOT NULL
);
GRANT SELECT ON public.attempt_answers TO authenticated;
GRANT ALL ON public.attempt_answers TO service_role;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own answers" ON public.attempt_answers FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.level_progress (
  user_id uuid NOT NULL,
  level_id int NOT NULL REFERENCES public.levels(id),
  best_correct int NOT NULL DEFAULT 0,
  best_points int NOT NULL DEFAULT 0,
  best_stars int NOT NULL DEFAULT 0,
  attempts int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, level_id)
);
GRANT SELECT ON public.level_progress TO authenticated;
GRANT ALL ON public.level_progress TO service_role;
ALTER TABLE public.level_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress" ON public.level_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Level unlocked? level 1 always; others need previous level completed
CREATE OR REPLACE FUNCTION public.is_level_unlocked(_user uuid, _level int) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _level = (SELECT min(id) FROM public.levels)
    OR EXISTS (SELECT 1 FROM public.level_progress p
               WHERE p.user_id = _user AND p.level_id = _level - 1 AND p.completed);
$$;

-- Immediate feedback for one question (reveals key only after an answer is chosen)
CREATE OR REPLACE FUNCTION public.check_answer(_question_id uuid, _option_id uuid)
RETURNS TABLE(is_correct boolean, correct_option_id uuid, explanation text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _lvl int;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'No autenticado'; END IF;
  SELECT q.level_id INTO _lvl FROM public.questions q WHERE q.id = _question_id AND q.active;
  IF _lvl IS NULL THEN RAISE EXCEPTION 'Pregunta no válida'; END IF;
  IF NOT public.is_level_unlocked(auth.uid(), _lvl) THEN RAISE EXCEPTION 'Nivel bloqueado'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.question_options o WHERE o.id = _option_id AND o.question_id = _question_id) THEN
    RAISE EXCEPTION 'Opción no válida';
  END IF;
  RETURN QUERY SELECT k.correct_option_id = _option_id, k.correct_option_id, k.explanation
    FROM public.question_keys k WHERE k.question_id = _question_id;
END $$;

-- Grade a whole level on the server and store results
CREATE OR REPLACE FUNCTION public.submit_level(_level_id int, _answers jsonb)
RETURNS TABLE(attempt_id uuid, correct_count int, total_questions int, points int, stars int, percentage int, completed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _total int; _given int; _correct int; _pts int; _stars int; _pct int; _att uuid; _done boolean;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'No autenticado'; END IF;
  IF NOT public.is_level_unlocked(_uid, _level_id) THEN RAISE EXCEPTION 'Nivel bloqueado'; END IF;
  IF jsonb_typeof(_answers) <> 'array' THEN RAISE EXCEPTION 'Formato inválido'; END IF;

  CREATE TEMP TABLE _ans ON COMMIT DROP AS
    SELECT DISTINCT ON ((a->>'question_id')::uuid) (a->>'question_id')::uuid AS qid, (a->>'option_id')::uuid AS oid
    FROM jsonb_array_elements(_answers) a;

  SELECT count(*) INTO _total FROM public.questions q WHERE q.level_id = _level_id AND q.active;
  SELECT count(*) INTO _given FROM _ans x
    JOIN public.questions q ON q.id = x.qid AND q.level_id = _level_id AND q.active
    JOIN public.question_options o ON o.id = x.oid AND o.question_id = q.id;
  IF _total = 0 OR _given <> _total OR (SELECT count(*) FROM _ans) <> _total THEN
    RAISE EXCEPTION 'Debes responder todas las preguntas del nivel';
  END IF;

  SELECT count(*) INTO _correct FROM _ans x JOIN public.question_keys k ON k.question_id = x.qid AND k.correct_option_id = x.oid;
  _pts := _correct * 20;
  _pct := round(_correct * 100.0 / _total);
  _stars := CASE WHEN _correct = _total THEN 3 WHEN _correct >= 3 THEN 2 ELSE 1 END;
  _done := _correct >= 3;

  INSERT INTO public.level_attempts(user_id, level_id, correct_count, total_questions, points, stars, percentage)
  VALUES (_uid, _level_id, _correct, _total, _pts, _stars, _pct) RETURNING id INTO _att;

  INSERT INTO public.attempt_answers(attempt_id, user_id, question_id, question_version, prompt_snapshot, option_id, option_snapshot, is_correct)
  SELECT _att, _uid, q.id, q.version, q.prompt, o.id, o.label, k.correct_option_id = o.id
  FROM _ans x JOIN public.questions q ON q.id = x.qid
  JOIN public.question_options o ON o.id = x.oid
  JOIN public.question_keys k ON k.question_id = q.id;

  INSERT INTO public.level_progress AS p(user_id, level_id, best_correct, best_points, best_stars, attempts, completed, updated_at)
  VALUES (_uid, _level_id, _correct, _pts, _stars, 1, _done, now())
  ON CONFLICT (user_id, level_id) DO UPDATE SET
    best_correct = greatest(p.best_correct, EXCLUDED.best_correct),
    best_points = greatest(p.best_points, EXCLUDED.best_points),
    best_stars = greatest(p.best_stars, EXCLUDED.best_stars),
    attempts = p.attempts + 1,
    completed = p.completed OR EXCLUDED.completed,
    updated_at = now();

  RETURN QUERY SELECT _att, _correct, _total, _pts, _stars, _pct, _done;
END $$;

REVOKE ALL ON FUNCTION public.check_answer(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_level(int, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_level_unlocked(uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_answer(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_level(int, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_level_unlocked(uuid, int) TO authenticated;

-- SEED CONTENT
INSERT INTO public.levels(id, title, description, topics) VALUES
 (1, 'Conceptos básicos de álgebra', 'Descubre variables, constantes y coeficientes en el Bosque de las Letras.', ARRAY['Variables','Constantes','Coeficientes','Elementos algebraicos']),
 (2, 'Expresiones algebraicas', 'Traduce el lenguaje común al idioma mágico del álgebra en la Torre de los Pergaminos.', ARRAY['Identificación de expresiones','Lenguaje algebraico','Traducción de frases']),
 (3, 'Términos semejantes', 'Agrupa términos gemelos junto a la Cascada de los Reflejos.', ARRAY['Términos semejantes','Reducción de términos','Coeficientes y variables']),
 (4, 'Operaciones algebraicas', 'Suma y resta expresiones para conquistar el Castillo del Álgebra.', ARRAY['Suma de expresiones','Resta de expresiones']);

CREATE FUNCTION public._seed_q(_lvl int, _pos int, _prompt text, _opts text[], _correct int, _expl text) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE _q uuid; _o uuid; _c uuid; i int;
BEGIN
  INSERT INTO public.questions(level_id, position, prompt) VALUES (_lvl, _pos, _prompt) RETURNING id INTO _q;
  FOR i IN 1..array_length(_opts, 1) LOOP
    INSERT INTO public.question_options(question_id, position, label) VALUES (_q, i, _opts[i]) RETURNING id INTO _o;
    IF i = _correct THEN _c := _o; END IF;
  END LOOP;
  INSERT INTO public.question_keys(question_id, correct_option_id, explanation) VALUES (_q, _c, _expl);
END $$;

SELECT public._seed_q(1,1,'En la expresión 5x + 3, ¿cuál es la variable?', ARRAY['5','x','3','+'],2,'La variable es la letra x: representa un valor desconocido que puede cambiar.');
SELECT public._seed_q(1,2,'En la expresión 7y − 4, ¿cuál es la constante?', ARRAY['7','y','−4','7y'],3,'La constante es el número que no acompaña a ninguna letra: −4. Su valor nunca cambia.');
SELECT public._seed_q(1,3,'En el término −9m², ¿cuál es el coeficiente?', ARRAY['9','−9','m','2'],2,'El coeficiente es el número (con su signo) que multiplica a la variable: −9.');
SELECT public._seed_q(1,4,'En el término 3a⁴, ¿cuál es el exponente?', ARRAY['3','a','4','12'],3,'El exponente es el número pequeño arriba de la variable: 4. Indica cuántas veces se multiplica a por sí misma.');
SELECT public._seed_q(1,5,'¿Cuántos términos tiene la expresión 2x² − 6x + 8?', ARRAY['1','2','3','4'],3,'Los términos se separan con signos + o −: 2x², −6x y 8. Son 3 términos.');

SELECT public._seed_q(2,1,'¿Cuál de las siguientes es una expresión algebraica?', ARRAY['3 + 5','4x − 2','12','7 × 8'],2,'Una expresión algebraica combina números y letras con operaciones. Solo 4x − 2 contiene una variable.');
SELECT public._seed_q(2,2,'¿Cómo se escribe "el doble de un número"?', ARRAY['x + 2','2x','x²','x ÷ 2'],2,'"El doble" significa multiplicar por 2, así que se escribe 2x.');
SELECT public._seed_q(2,3,'¿Cómo se escribe "un número aumentado en 7"?', ARRAY['7x','x − 7','x + 7','7 ÷ x'],3,'"Aumentado en" significa sumar: x + 7.');
SELECT public._seed_q(2,4,'¿Cómo se escribe "el triple de un número disminuido en 5"?', ARRAY['3(x − 5)','3x − 5','5 − 3x','3 + x − 5'],2,'Primero el triple del número (3x) y luego se le restan 5: 3x − 5.');
SELECT public._seed_q(2,5,'¿Cómo se escribe "la mitad de la suma de dos números"?', ARRAY['(a + b) ÷ 2','a + b ÷ 2','2(a + b)','a ÷ 2 + b'],1,'Primero se suman los números (a + b) y después se divide todo entre 2: (a + b) ÷ 2.');

SELECT public._seed_q(3,1,'¿Cuál término es semejante a 4x?', ARRAY['4y','x²','−7x','4'],3,'Los términos semejantes tienen la misma variable con el mismo exponente. −7x tiene x, igual que 4x.');
SELECT public._seed_q(3,2,'¿Qué par de términos son semejantes?', ARRAY['3a² y 3a','5xy y −2xy','2m y 2n','6 y 6p'],2,'5xy y −2xy tienen exactamente la misma parte literal: xy.');
SELECT public._seed_q(3,3,'Reduce: 3x + 5x', ARRAY['8x','8x²','15x','2x'],1,'Se suman los coeficientes y se conserva la variable: 3 + 5 = 8, resultado 8x.');
SELECT public._seed_q(3,4,'Reduce: 7a − 2a + a', ARRAY['5a','6a','4a','10a'],2,'Recuerda que a vale 1a: 7 − 2 + 1 = 6, resultado 6a.');
SELECT public._seed_q(3,5,'Reduce: 4x + 3y − x + 2y', ARRAY['3x + 5y','5x + 5y','3x + y','8xy'],1,'Agrupa los semejantes: 4x − x = 3x y 3y + 2y = 5y. Resultado: 3x + 5y.');

SELECT public._seed_q(4,1,'Resuelve: (2x + 3) + (4x + 1)', ARRAY['6x + 4','6x + 3','8x + 4','6x² + 4'],1,'Suma términos semejantes: 2x + 4x = 6x y 3 + 1 = 4. Resultado: 6x + 4.');
SELECT public._seed_q(4,2,'Resuelve: (5a − 2) + (−3a + 6)', ARRAY['2a + 4','8a + 4','2a − 8','2a + 8'],1,'5a − 3a = 2a y −2 + 6 = 4. Resultado: 2a + 4.');
SELECT public._seed_q(4,3,'Resuelve: (7m + 4) − (2m + 1)', ARRAY['5m + 3','5m + 5','9m + 5','5m − 3'],1,'Al restar, cambia los signos del segundo paréntesis: 7m + 4 − 2m − 1 = 5m + 3.');
SELECT public._seed_q(4,4,'Resuelve: (3x² + 2x) − (x² − 4x)', ARRAY['2x² − 2x','2x² + 6x','4x² + 6x','2x² + 2x'],2,'Cambia signos: 3x² + 2x − x² + 4x. Agrupa: 2x² + 6x.');
SELECT public._seed_q(4,5,'Resuelve: (4a + 3b − 2) − (a − b + 5)', ARRAY['3a + 2b + 3','3a + 4b − 7','5a + 4b + 3','3a + 2b − 7'],2,'Cambia signos: 4a + 3b − 2 − a + b − 5. Agrupa: 3a + 4b − 7.');

DROP FUNCTION public._seed_q(int, int, text, text[], int, text);