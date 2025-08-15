Thoughts - “pensamientos nuevos, con vista en pensamientos viejos”

Una app estática (sin frameworks ni bundlers) para publicar pensamientos con respuestas anidadas, búsqueda con contexto y un perfil básico. La persistencia inicial es en localStorage, pero la UI está desacoplada mediante una capa de almacenamiento (storage.js) para poder migrar a un backend sin tocar la interfaz.


🧭 Filosofía del producto

La app incentiva traer a la vista lo ya pensado para re-combinar, reflexionar y aprender del pasado. Revisitar pensamientos viejos favorece a:

Creatividad combinatoria (reusar piezas conocidas en formas nuevas).

Reflexión y práctica de recuperación (consolidación de memoria).

Auto-distanciamiento (mirar el pensamiento pasado con más objetividad).


✨ Funcionalidades

Crear pensamiento desde:

Caja de composición en el main (Home)

Botón + (FAB)

Botón + en la sidebar

Respuestas anidadas (multi-nivel) y colapsar/expandir hilos.

Ocultar/mostrar contenido sin recargar la página.

Búsqueda (con debounce 250 ms), resultados con resaltado y resumen de conteo.

Perfil: nombre, usuario y avatar (recomendado 128×128), persistentes.

Menú hamburguesa (abajo-izquierda): Perfil y Reiniciar datos (borra datos locales y re-siembra).


🧱 Tech & arquitectura

Stack: HTML + CSS + JS “vanilla”.

UI desacoplada de datos a través de window.Storage.

Persistencia local (clave thoughts.v1 y profile.v1 en localStorage).

Semillas iniciales si no hay datos (3 raíces + 2 respuestas).

.
├─ index.html        # Home (feed + composer inline)
├─ search.html       # Búsqueda
├─ profile.html      # Perfil (nombre/usuario/avatar)
├─ styles.css        # Estilos (layout, cards, accesibilidad)
├─ app.js            # Lógica de UI (render, eventos, toasts)
└─ storage.js        # Capa de datos (localStorage) — reemplazable por REST


🚀 Cómo correr

Descargá el proyecto y abrí index.html en tu navegador.

No requiere servidor. Es 100% estático.

(Opcional) Deploy:

Netlify Drop: arrastrá la carpeta y te da una URL.

GitHub Pages: Settings → Pages → Deploy from branch → root.

Vercel: Import Project → Framework “Other/None”.



🧭 Roadmap

Adaptar storage.api.js (REST o Supabase).

IDs estables (UUID) y normalización por colecciones.

Paginación y carga perezosa.

Menciones/etiquetas y resurfacing (“Hace 6 meses pensaste…”).

Autenticación Oauth y multi-usuario.

Tests de integración (Playwright) y CI.