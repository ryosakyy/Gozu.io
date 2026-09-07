# Publicación de GOZU

## Antes de abrir al público

- Crear un repositorio privado en GitHub y revisar `git diff --cached` antes de subir. Nunca subir `.env`, bases de datos ni credenciales.
- Usar un hosting con Docker (VPS o plataforma de contenedores). GitHub Pages solo no ejecuta el backend Java ni PostgreSQL.
- Configurar dominio y HTTPS en el proxy del hosting. La sesión de producción exige HTTPS.
- Copiar `.env.example` a `.env` y sustituir las claves por valores únicos generados con un gestor de contraseñas. Definir `GOZU_CORS_ORIGINS=https://tu-dominio.pe`.
- Ejecutar `docker compose up -d --build` en el servidor. Docker no ha sido validado en esta máquina.
- Revisar datos de ejemplo del administrador: no son ingresos ni clientes reales. No presentar cifras de muestra como resultados de la empresa.
- Probar login, cierre de sesión, envío de propuesta y persistencia después de reiniciar. Revisar correos/WhatsApp y textos legales con los datos reales del titular.
- Configurar copias de PostgreSQL, probar restauración, monitoreo, límites de solicitudes en el proxy y actualización de dependencias.

## Controles implementados

Contraseñas con BCrypt, rutas administrativas autenticadas, cookies HttpOnly/SameSite y Secure en producción, token CSRF de sesión para cambios administrativos y login. Las solicitudes públicas requieren además protección contra abuso en el hosting; no constituyen autenticación.

No es una certificación ISO ni una auditoría de penetración. La publicación definitiva requiere repositorio, proveedor, dominio y secretos del titular.
