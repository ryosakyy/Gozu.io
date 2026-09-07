# GOZU Sistemas Perú

Plataforma comercial full stack para vender páginas web y sistemas empresariales por implementación y suscripción mensual. Incluye web pública, cotizador conectado a WhatsApp y un centro administrativo privado.

## Qué incluye

- Web comercial responsive con fotografías reales, GSAP ScrollTrigger, parallax, revelados por scroll y movimiento respetando `prefers-reduced-motion`.
- Línea GOZU Web Studio con landing, web corporativa, ecommerce y mantenimiento Web Care.
- Tres demos especializados con 15 áreas operables: flujos de punta a punta, variables del rubro, búsqueda, filtros, altas simuladas, detalle y avance de estados.
- Cotizador por módulos que guarda el prospecto y prepara el mensaje para WhatsApp `+51 967 953 115`.
- Administrador con prospectos, embudo de ventas, clientes, planes y mensualidades.
- Control financiero de ingresos, gastos, utilidad mensual e ingreso recurrente mensual (MRR).
- Analítica comercial propia: visitas, clics de intención, WhatsApp, planes, demos, conversión y solución más consultada, sin registrar navegación personal.
- Catálogo de integraciones priorizadas para Perú: pagos recurrentes, comprobantes SUNAT, WhatsApp, portal de cliente y multisucursal.
- Comparador de tres planes con implementación, mensualidad, ahorro anual y selección conectada al cotizador.
- Catálogo administrable: un servicio creado en el panel aparece en la web pública.
- API REST protegida, validación, persistencia y endpoint de salud.
- Login mediante sesión del servidor y cookie `HttpOnly`; las credenciales no se guardan en `sessionStorage`.
- Entorno local con H2 y despliegue con PostgreSQL, Docker Compose y Nginx.

## Tecnologías

- Frontend: Angular 21, TypeScript, Bootstrap 5.3 y Bootstrap Icons.
- Backend: Java 21, Spring Boot 4.1, Spring Security, Spring Data JPA y Bean Validation.
- Datos: H2 para desarrollo y PostgreSQL 17 para producción.
- Operación: Docker multi-stage, Nginx, health checks y variables de entorno.

Angular es la base de esta plataforma. React puede ofrecerse a clientes cuando el producto lo necesite, pero mezclar ambos frameworks dentro del mismo frontend aumentaría el peso y el mantenimiento sin dar una ventaja real.

## Ejecutar en desarrollo

Requisitos: Node.js 22, npm y Java 21 o superior.

1. Backend:

   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```

2. En otra terminal, frontend:

   ```powershell
   cd frontend
   npm install
   npm start
   ```

3. Abrir `http://localhost:4200`. El panel privado está en `http://localhost:4200/gestion-interna-gozu` y no se enlaza desde la web pública.

Credenciales únicamente para desarrollo:

- Usuario: `admin@gozu.pe`
- La contraseña se configura mediante `GOZU_ADMIN_PASSWORD` en el entorno local; nunca la guardes en Git.

Antes de publicar, configura obligatoriamente `GOZU_ADMIN_PASSWORD` con una contraseña larga y única. No compartas la cuenta administrativa con clientes. La ruta privada no sustituye la autenticación: la protección real es la sesión del servidor, BCrypt y HTTPS.

## Ejecutar con Docker y PostgreSQL

```powershell
Copy-Item .env.example .env
# Edita .env y reemplaza las dos contraseñas.
docker compose up --build -d
```

La aplicación quedará en `http://localhost` o en el puerto definido por `WEB_PORT`.

## Comprobaciones realizadas

```powershell
cd frontend
npm run build

cd ..\backend
.\mvnw.cmd test

cd ..\frontend
npm run quality:iso
```

La puerta interna de calidad está alineada con las nueve características de ISO/IEC 25010:2023 y exige al menos 96/100. No equivale a una certificación ISO. Para un despliegue público, agrega dominio, HTTPS, `COOKIE_SECURE=true`, protección CSRF, copias de seguridad de PostgreSQL, correo corporativo y pasarela de pago; las credenciales y secretos deben vivir solo en variables de entorno.

## Estructura

```text
gozu-platform/
├── frontend/   Angular, Bootstrap, web pública y administrador
├── backend/    Spring Boot, seguridad, API y persistencia
├── docker-compose.yml
└── .env.example
```

Las fotografías de demostración se descargaron localmente desde Unsplash y se acreditan en el pie de la web.

La estrategia comercial, precios de referencia, complementos, embudo, métricas y plan de 90 días están documentados en [`NEGOCIO-GOZU.md`](./NEGOCIO-GOZU.md).
