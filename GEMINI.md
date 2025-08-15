# Resumen del Proyecto: Threads Mini-App

## 1. Descripción General

Esta es una aplicación web de una sola página (SPA) que emula una funcionalidad básica de red social similar a Threads o Twitter. Es una aplicación puramente *frontend*, sin necesidad de un servidor backend. Toda la información, incluyendo los "pensamientos" (publicaciones) y los datos del perfil del usuario, se almacena localmente en el `localStorage` del navegador.

La aplicación permite a los usuarios:
- Ver un feed de publicaciones con una tarjeta inicial para crear un nuevo post.
- Crear nuevas publicaciones a través de un modal rediseñado y más atractivo.
- Responder a publicaciones existentes, creando hilos que aparecen colapsados por defecto.
- Colapsar y expandir hilos de respuestas.
- Ocultar/mostrar el contenido de una publicación, con cambios reflejados en tiempo real.
- Buscar publicaciones por contenido en una página con UI mejorada.
- Editar su perfil (nombre, nombre de usuario y avatar).
- Reiniciar todos los datos al estado inicial.

## 2. Estructura de Archivos

El proyecto se compone de los siguientes archivos principales:

- `index.html`: La página principal que muestra el feed de publicaciones. Es el punto de entrada de la aplicación.
- `search.html`: Página dedicada a la búsqueda de publicaciones, con una layout mejorado.
- `profile.html`: Página para que el usuario edite su información de perfil.
- `styles.css`: Hoja de estilos que define la apariencia visual de toda la aplicación.
- `app.js`: Contiene toda la lógica de la interfaz de usuario (UI). Se encarga de renderizar las publicaciones, manejar eventos y coordinar con la capa de almacenamiento.
- `storage.js`: Actúa como una capa de acceso a datos. Abstrae la lógica de `localStorage`.
- `GEMINI.md`: Este mismo archivo, que contiene la documentación técnica y el resumen del proyecto.

## 3. Flujo de Datos y Lógica

### Almacenamiento (`storage.js`)
- **Claves en `localStorage`**: `thoughts.v1` (array de publicaciones) y `profile.v1` (objeto de perfil).
- **Interfaz `Storage`**: Expone un objeto global `window.Storage` con métodos para interactuar con los datos.
- **Siembra de Datos (Seeding)**: Crea datos iniciales si el almacenamiento está vacío.

### Lógica de la Aplicación (`app.js`)
- **Inicialización**: Carga los datos del `Storage` y renderiza la página correspondiente.
- **Renderizado del Feed (`index.html`)**:
  1.  Limpia el feed existente.
  2.  Inserta una tarjeta "composer prompt" al inicio que, al hacer clic, abre el modal de creación.
  3.  Carga las publicaciones de `Storage`, construye un índice y renderiza los hilos en la página.
  4.  Los hilos con respuestas (`children`) se renderizan colapsados por defecto.
- **Interacciones del Usuario**:
  - **Crear Publicación**: Un modal (`<dialog>`) rediseñado se abre para escribir un nuevo "pensamiento". Al publicar, se actualiza el `Storage` y se re-renderiza el feed.
  - **Responder**: Similar a crear una publicación, pero pasando el `parentId`.
  - **Ocultar/Mostrar y Colapsar/Expandir**: Llama a funciones que actualizan directamente los nodos del DOM afectados para reflejar el cambio de estado (contenido oculto o hilo colapsado) sin recargar la página.
  - **Búsqueda (`search.html`)**: La UI ahora presenta el buscador y los resultados dentro de una sección centrada. La lógica de búsqueda es `case-insensitive` y resalta las coincidencias.
  - **Perfil (`profile.html`)**: Permite al usuario cambiar sus datos y subir un avatar (guardado como `base64`).

## 4. Características Notables

- **Vanilla JS**: Toda la lógica está escrita en JavaScript puro, sin frameworks.
- **Diseño Modular**: Clara separación entre la lógica de UI (`app.js`) y la de datos (`storage.js`).
- **UI Reactiva (sin framework)**: Las acciones del usuario (ocultar, colapsar, etc.) actualizan la UI de forma instantánea manipulando directamente el DOM, simulando un comportamiento reactivo.
- **Component-Like Structure**: `app.js` simula la creación de componentes con funciones que generan nodos de DOM (ej. `thoughtNode`).
- **Accesibilidad (a11y)**: El HTML semántico y los atributos ARIA (`role`, `aria-label`, `aria-expanded`) se utilizan para mejorar la accesibilidad.
- **Diseño Responsivo**: La UI se adapta a dispositivos móviles y de escritorio.