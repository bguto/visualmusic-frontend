PASOS PARA SUBIR A NETLIFY:

1. Ve a https://netlify.com y crea una cuenta (puedes usar tu email o GitHub).
2. Crea una nueva página: "Add new site > Deploy manually"
3. Arrastra la carpeta completa que contiene estos archivos.
4. Espera unos segundos y Netlify te dará una URL pública como:

   https://visualmusic.netlify.app

IMPORTANTE:
Antes de subir, asegúrate de que el archivo script.js tenga la línea:
const BACKEND_URL = "https://visualmusic-backend.onrender.com";
(o la URL real de tu backend en Render)

¡Y ya puedes usar tu web desde cualquier navegador!
