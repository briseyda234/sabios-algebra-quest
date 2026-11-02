# Sabios Algebra Quest

Actúa como un desarrollador Full Stack Senior, arquitecto de software, diseñador UI/UX especializado en aplicaciones educativas y experto en gamificación.
Quiero que construyas desde cero una aplicación web educativa llamada AlgebraQuest, cuyo objetivo es enseñar álgebra básica a estudiantes de secundaria mediante ejercicios interactivos con temática de aventura fantástica medieval.
Eslogan: "Resuelve, avanza y conquista".
IMPORTANTE: Este proyecto debe crearse completamente desde cero. No debes depender de archivos, componentes, tablas, diseños ni funcionalidades de proyectos anteriores. Diseña una arquitectura nueva, limpia, organizada y funcional.
La aplicación tendrá un único rol de usuario: ESTUDIANTE. No debe existir ningún rol de profesor ni administrador dentro de la aplicación.
1. IDENTIDAD VISUAL
Crea una interfaz atractiva, moderna, amigable y divertida, con temática de videojuego de fantasía medieval.
Paleta de colores obligatoria
Morado: #6555DB
Amarillo: #FFCF4A
Verde: #39C99A
Lavanda: #F4F5FF
Azul oscuro: #1E1B4B
Tipografías
Cinzel para títulos.
Nunito para textos, descripciones y botones.
Ambientación
Incorpora:
Castillos mágicos.
Islas flotantes.
Montañas fantásticas.
Bosques encantados.
Cascadas.
Estrellas brillantes.
Nubes suaves.
Libros mágicos.
Pergaminos.
Símbolos matemáticos flotantes.
Partículas de luz.
Utiliza degradados morados, azul oscuro y lavanda.
Las tarjetas deben parecer pergaminos mágicos, con bordes redondeados y sombras suaves.
Los botones deben tener efectos 3D ligeros, esquinas redondeadas y animaciones suaves.
El diseño debe ser responsivo para computadoras, tabletas y celulares.
2. MASCOTA: SABIO X
Crea un personaje original: un búho mago llamado Sabio X.
Características:
Sombrero morado.
Detalles dorados.
Apariencia amigable.
Estilo de fantasía medieval.
Personalidad de guía educativo.
Debe contar con cinco expresiones:
Feliz: respuestas correctas.
Pensativo: presentación de preguntas.
Sorprendido: situaciones inesperadas.
Celebrando: al completar niveles.
Motivando: respuestas incorrectas.
Agrega mensajes como:
¡Excelente! ¡Has dominado este desafío!
¡Vamos, tú puedes lograrlo!
No te preocupes, equivocarse también es aprender.
¡Estás cada vez más cerca de conquistar el álgebra!
¡Felicidades, has completado este nivel!
Utiliza a Sabio X como acompañante en los ejercicios y resultados.
3. PÁGINAS PRINCIPALES
Página de inicio
Debe incluir:
Logotipo de AlgebraQuest.
Eslogan.
Ilustración de Sabio X.
Descripción breve del proyecto.
Botón "Comenzar aventura".
Botón "Iniciar sesión".
Registro e inicio de sesión
Implementa autenticación con correo electrónico y contraseña.
El registro debe solicitar:
Nombre.
Correo electrónico.
Contraseña.
El registro público solamente permitirá crear cuentas de estudiantes.
No agregar:
Inicio de sesión con Google.
Confirmación por correo.
Recuperación de contraseña.
Panel del estudiante
Mostrar:
Nombre del estudiante.
Avatar sencillo.
Puntos acumulados.
Porcentaje de progreso.
Nivel actual.
Niveles completos.
Últimos resultados.
Botón "Continuar aventura".
Mapa de aventura
Crea un mundo llamado Isla de las Variables.
Representa los siete niveles mediante un mapa fantástico con caminos, islas y elementos medievales.
Cada nivel debe mostrar:
Número.
Nombre.
Ilustración propia.
Estado: bloqueado, disponible o completado.
Indicador de progreso.
El estudiante debe desbloquear los niveles progresivamente.
4. LOS CUATRO NIVELES DE ÁLGEBRA
Crea siete niveles oficiales, cada uno con cinco preguntas iniciales.
Total: 20 preguntas interactivas.
Nivel 1. Conceptos básicos de álgebra
Variables.
Constantes.
Coeficientes.
Identificación de elementos algebraicos.
Nivel 2. Expresiones algebraicas
Identificación de expresiones.
Lenguaje algebraico.
Traducción de frases a expresiones.
Nivel 3. Términos semejantes
Identificación de términos semejantes.
Reducción de términos.
Coeficientes y variables.
Nivel 4. Operaciones algebraicas
Suma de expresiones algebraicas.
Resta de expresiones algebraicas.
Cada nivel debe incluir cinco preguntas diferentes, adecuadas para estudiantes de secundaria y con dificultad progresiva.
5. SISTEMA DE EJERCICIOS
Cada pregunta debe incluir:
Enunciado claro.
Cuatro opciones de respuesta.
Una sola respuesta correcta.
Retroalimentación inmediata.
Explicación sencilla.
Sabio X con mensajes de apoyo.
Barra de progreso.
Botón "Continuar".
No permitir avanzar sin seleccionar una respuesta.
Sistema de puntuación
20 puntos por respuesta correcta.
3 estrellas por cinco respuestas correctas.
2 estrellas por tres o cuatro respuestas correctas.
1 estrella por menos de tres respuestas correctas.
Pantalla de resultados
Al finalizar cada nivel mostrar:
Respuestas correctas.
Puntos obtenidos.
Porcentaje de aciertos.
Estrellas obtenidas.
Mensaje motivador de Sabio X.
Botón para repetir el nivel.
Botón para regresar al panel.
Conservar los mejores resultados y el progreso histórico.
6. BASE DE DATOS Y SUPABASE
Utiliza Supabase para:
Autenticación de estudiantes.
Perfiles de estudiantes.
Niveles.
Preguntas.
Opciones de respuesta.
Respuestas correctas.
Explicaciones.
Resultados.
Puntos.
Estrellas.
Progreso.
Diseña una estructura de base de datos limpia y organizada.
Configura políticas RLS para proteger la información.
Seguridad obligatoria
Todos los usuarios registrados serán estudiantes.
No debe existir ningún rol de profesor.
No debe existir ningún panel de administración.
Cada estudiante solamente podrá consultar su propio perfil y progreso.
Ningún estudiante podrá modificar directamente sus resultados históricos.
Las respuestas correctas no deben quedar expuestas innecesariamente al navegador.
Los puntos y resultados deben validarse de forma segura en el servidor.
No permitir que los usuarios manipulen su progreso desde el navegador.
No confíes únicamente en las validaciones del frontend.
Conserva referencias a las versiones de preguntas utilizadas para mantener intactos los resultados históricos.
Si todavía no hay credenciales de Supabase, implementa inicialmente un modo de demostración con datos de prueba y deja preparada la conexión real.
7. TECNOLOGÍAS
Utiliza:
React.
TypeScript.
Tailwind CSS.
React Router.
Supabase.
Organiza el proyecto en componentes reutilizables, páginas, servicios, tipos y funciones.
Mantén el código limpio y fácil de modificar.
8. DISEÑO RESPONSIVO
La aplicación debe funcionar correctamente en:
Computadoras.
Laptops.
Tabletas.
Celulares.
Adapta los mapas, tarjetas, menús, botones y paneles.
Evita textos cortados, botones pequeños y desplazamientos horizontales.
9. RESTRICCIONES
No agregar funcionalidades innecesarias.
No implementar:
Rol de profesor.
Rol de administrador.
Panel de profesores.
Panel de administración.
Administración de estudiantes.
Administración de preguntas por profesores.
Tienda de avatares.
Monedas.
Vidas.
Tabla de clasificación.
Pagos.
Funciones sociales.
Inteligencia artificial.
Inicio de sesión con Google.
Confirmación por correo.
Recuperación de contraseña.
Prioriza una aplicación funcional, visualmente atractiva y sencilla.
10. ORDEN DE CONSTRUCCIÓN
Construye la aplicación siguiendo este orden:
Crear la estructura general del proyecto.
Diseñar la identidad visual y los fondos.
Crear a Sabio X y sus expresiones.
Construir la página de inicio.
Implementar registro e inicio de sesión.
Construir el panel del estudiante.
Crear el mapa de los siete niveles.
Crear las 20 preguntas.
Implementar ejercicios, puntuación y resultados.
Configurar Supabase y políticas RLS.
Comprobar navegación, autenticación, progreso y diseño responsivo.
11. ENTREGA FINAL
Al terminar, proporciona:
Resumen de la aplicación creada.
Archivos principales.
Tablas de Supabase.
Políticas de seguridad.
Configuraciones pendientes.
Instrucciones para ejecutar.
Pruebas realizadas.
Errores pendientes.
No afirmes que algo funciona si no ha sido comprobado.
RESULTADO FINAL ESPERADO:
Crear desde cero AlgebraQuest, una plataforma educativa de fantasía medieval, con diseño profesional, Sabio X como mascota, siete niveles de álgebra, 20 ejercicios interactivos, sistema de puntos y estrellas, registro e inicio de sesión de estudiantes, panel del estudiante y almacenamiento del progreso mediante Supabase.
La aplicación tendrá exclusivamente el rol de ESTUDIANTE.
La prioridad es entregar una aplicación completa, funcional, sencilla, atractiva y fácil de utilizar.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sabios-algebra-quest.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/23e24268-0044-4d10-aa43-7dc097969650).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
