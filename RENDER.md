# Publicar GOZU en Render desde GitHub

1. En Render selecciona **New → Blueprint** y conecta `ryosakyy/Gozu.io`.
2. Elige la rama `main` y confirma `render.yaml`. Se crearán `gozu-api`, `gozu-web` y `gozu-db`.
3. En el servicio `gozu-api`, completa las variables secretas:
   - `GOZU_ADMIN_USER`: tu usuario administrativo.
   - `GOZU_ADMIN_PASSWORD`: una clave larga y única.
   - `GOZU_CORS_ORIGINS`: `https://gozu-web.onrender.com` (cámbialo por tu dominio final cuando lo conectes).
4. Espera a que `gozu-api` responda en `/actuator/health` y que `gozu-web` termine el build.
5. Abre `https://gozu-web.onrender.com`, prueba navegación, formulario de contacto y acceso administrativo.
6. Cuando tengas dominio propio, añádelo en **Settings → Custom Domains** y actualiza `GOZU_CORS_ORIGINS` con `https://tu-dominio.pe`.

El plan gratuito de Render sirve para la prueba de 30 días, pero el servicio web se duerme con inactividad y la base PostgreSQL gratuita caduca a los 30 días. Antes de recibir clientes reales configura un plan persistente o migra la base de datos y verifica una copia de respaldo.

Render no acepta `docker-compose.yml` como despliegue único; el Blueprint separa correctamente frontend, API y base de datos.
