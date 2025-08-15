# Resumen del Proyecto: Threads Mini-App

## 1. Descripción General

Esta es una aplicación web de una sola página (SPA) que emula una funcionalidad básica de red social similar a Threads o Twitter. Es una aplicación puramente *frontend*, sin necesidad de un servidor backend. Toda la información, incluyendo los "pensamientos" (publicaciones) y los datos del perfil del usuario, se almacena localmente en el `localStorage` del navegador.

La aplicación permite a los usuarios:
- Ver un feed de publicaciones.
- Crear nuevas publicaciones (llamadas "thoughts").
- Responder a publicaciones existentes, creando hilos anidados.
- Ocultar/mostrar el contenido de una publicación.
- Buscar publicaciones por contenido.
- Editar su perfil (nombre, nombre de usuario y avatar).
- Reiniciar todos los datos al estado inicial.

## 2. Estructura de Archivos

El proyecto se compone de los siguientes archivos principales:

- `index.html`: La página principal que muestra el feed de publicaciones. Es el punto de entrada de la aplicación.
- `search.html`: Página dedicada a la búsqueda de publicaciones.
- `profile.html`: Página para que el usuario edite su información de perfil.
- `styles.css`: Hoja de estilos que define la apariencia visual de toda la aplicación. Utiliza un diseño responsive que se adapta a pantallas de escritorio y móviles.
- `app.js`: Contiene toda la lógica de la interfaz de usuario (UI). Se encarga de renderizar las publicaciones, manejar eventos (clics, envíos de formularios) y coordinar con la capa de almacenamiento. No utiliza ningún framework externo (vanilla JavaScript).
- `storage.js`: Actúa como una capa de acceso a datos. Abstrae la lógica de lectura y escritura en `localStorage`. Si los datos no existen, este script los siembra con información inicial de ejemplo.

## 3. Flujo de Datos y Lógica

### Almacenamiento (`storage.js`)
- **Claves en `localStorage`**:
  - `thoughts.v1`: Almacena un array de objetos, donde cada objeto es una publicación (`Thought`).
  - `profile.v1`: Almacena un objeto con los datos del perfil del usuario (`fullName`, `username`, `avatar`).
- **Interfaz `Storage`**: Expone un objeto global `window.Storage` con métodos como `loadAll()`, `create()`, `search()`, `getProfile()`, etc.
- **Siembra de Datos (Seeding)**: Si no hay datos en `localStorage` al iniciar, `storage.js` crea un conjunto de publicaciones y un perfil de usuario por defecto.

### Lógica de la Aplicación (`app.js`)
- **Inicialización**: Al cargar el DOM, `app.js` llama a `Storage.init()` para asegurar que los datos existan. Luego, obtiene los datos del perfil y renderiza el contenido según la página actual (`index`, `search`, o `profile`).
- **Renderizado del Feed (`index.html`)**:
  1. Carga todas las publicaciones usando `Storage.loadAll()`.
  2. Construye un índice en memoria para acceder rápidamente a las publicaciones por `id` y agruparlas por `parentId`.
  3. Renderiza las publicaciones raíz (aquellas sin `parentId`) en el feed. Las respuestas se anidan recursivamente.
- **Interacciones del Usuario**:
  - **Crear Publicación**: Un modal (`<dialog>`) se abre para escribir un nuevo "pensamiento". Al enviarlo, se llama a `Storage.create()` y se vuelve a renderizar el feed.
  - **Responder**: Similar a crear una publicación, pero se pasa el `parentId` de la publicación original.
  - **Ocultar/Mostrar**: Llama a `Storage.toggleHidden(id)` y actualiza solo el nodo del DOM afectado para evitar un re-renderizado completo de la página.
  - **Búsqueda (`search.html`)**: Utiliza una función `debounce` para no ejecutar la búsqueda en cada pulsación de tecla, mejorando el rendimiento. Llama a `Storage.search(query)` y muestra los resultados.
  - **Perfil (`profile.html`)**: Permite al usuario cambiar su nombre y subir un avatar. El avatar se convierte a una URL de `base64` y se guarda en `localStorage` junto con los otros datos del perfil.

## 4. Características Notables

- **Vanilla JS**: Toda la lógica está escrita en JavaScript puro, sin dependencias de frameworks como React, Vue o Angular.
- **Diseño Modular**: La lógica está separada en dos capas claras: la UI (`app.js`) y el almacenamiento (`storage.js`). Esto facilita futuras modificaciones, como cambiar `localStorage` por una API REST sin tener que alterar el código de la UI.
- **Component-Like Structure**: Aunque no usa un framework, `app.js` simula la creación de componentes a través de funciones que generan nodos del DOM (ej. `thoughtNode`).
- **Optimización**: Se utilizan técnicas como la delegación de eventos y actualizaciones parciales del DOM (`toggleOne`) para mejorar la eficiencia.
- **Accesibilidad (a11y)**: El HTML utiliza atributos ARIA (`role`, `aria-label`, etc.) para mejorar la accesibilidad para lectores de pantalla.
