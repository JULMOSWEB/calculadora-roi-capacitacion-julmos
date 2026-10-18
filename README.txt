CALCULADORA DE ROI DE CAPACITACIÓN — JULMOS CONSULTORES

Contenido:
- index.html: calculadora responsive, funciona localmente sin dependencias.
- api/analizar.js: análisis opcional con IA para Vercel.

Publicación:
1. Crear un repositorio nuevo en GitHub y subir index.html y la carpeta api.
2. Importar el repositorio en Vercel como proyecto nuevo (Framework Preset: Other).
3. En Vercel > Settings > Environment Variables agregar OPENAI_API_KEY con una clave privada propia. Nunca colocar la clave dentro de index.html ni subirla a GitHub.
4. Hacer redeploy después de configurar la variable.
5. Vincular la URL de Vercel a la tarjeta ROI de Capacitación de Readymag.

La calculadora funciona sin configurar la IA; únicamente el botón de recomendaciones requiere la variable.
Monedas locales: USD, CRC, GTQ, HNL, NIO, COP, DOP. No realiza conversiones.
Los números precargados son ejemplos y pueden modificarse.
