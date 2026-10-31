<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Grading, points, stars and level unlocking run only in Postgres SECURITY DEFINER functions (`check_answer`, `submit_level`); results tables have SELECT-only policies — why: students must not be able to tamper with progress from the browser.
- Answer keys live in `question_keys` with no client policies — why: correct answers must never be readable before answering.
- Questions are versioned and `attempt_answers` stores version + text snapshots — why: historical results stay intact if content changes.
- Data access lives in `src/services/game.ts`; game UI pieces in `src/components/game/` — why: one place to change queries and visuals.
