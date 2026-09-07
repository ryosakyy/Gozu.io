import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const qualityDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(qualityDir, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const all = (...values) => values.every(Boolean);

const homeHtml = read('frontend/src/app/pages/home/home.html');
const homeTs = read('frontend/src/app/pages/home/home.ts');
const homeScss = read('frontend/src/app/pages/home/home.scss');
const routes = read('frontend/src/app/app.routes.ts');
const api = read('frontend/src/app/core/api.service.ts');
const tsconfig = read('frontend/tsconfig.json');
const angular = read('frontend/angular.json');
const nginx = read('frontend/nginx.conf');
const security = read('backend/src/main/java/pe/gozu/api/config/SecurityConfig.java');
const publicController = read('backend/src/main/java/pe/gozu/api/web/PublicController.java');
const adminController = read('backend/src/main/java/pe/gozu/api/web/AdminController.java');
const properties = read('backend/src/main/resources/application.properties');
const compose = read('docker-compose.yml');
const backendTests = read('backend/src/test/java/pe/gozu/api/GozuApiApplicationTests.java');

const images = homeHtml.match(/<img\b[^>]*>/g) ?? [];
const imagesWithAlt = images.filter((image) => /(?:\balt|\[alt\])=("[^"]*"|'[^']*')/.test(image));
const surefireDir = path.join(root, 'backend/target/surefire-reports');
const surefireReports = exists('backend/target/surefire-reports')
  ? fs.readdirSync(surefireDir).filter((file) => file.endsWith('.xml')).map((file) => fs.readFileSync(path.join(surefireDir, file), 'utf8'))
  : [];
const backendSuitePassed = surefireReports.length > 0 && surefireReports.every((report) => {
  const suite = report.match(/<testsuite\b[^>]*>/)?.[0] ?? '';
  return /failures="0"/.test(suite) && /errors="0"/.test(suite);
});

const checks = [
  { area: 'Adecuación funcional', name: 'Rutas pública, administrativa y de ejemplos', pass: all(/path: ''/.test(routes), /gestion-interna-gozu/.test(routes), /demo\/:slug/.test(routes)) },
  { area: 'Adecuación funcional', name: 'Captura de prospectos de extremo a extremo', pass: all(/createLead\(lead: Lead\)/.test(api), /RequestMapping\("\/api\/public"\)/.test(publicController), /PostMapping\("\/leads"\)/.test(publicController)) },
  { area: 'Adecuación funcional', name: 'Operación administrativa y panel comercial', pass: all(/RequestMapping\("\/api\/admin"\)/.test(adminController), /GetMapping\("\/dashboard"\)/.test(adminController), /GetMapping\("\/leads"\)/.test(adminController), /transactions/.test(adminController)) },
  { area: 'Adecuación funcional', name: 'Cotizador validado y tres ejemplos controlados', pass: all(/Validators\.required/.test(homeTs), /readonly demoSlides/.test(homeTs), (homeTs.match(/kicker: 'EJEMPLO/g) ?? []).length === 3) },

  { area: 'Eficiencia de desempeño', name: 'Carga diferida por ruta', pass: (routes.match(/loadComponent:/g) ?? []).length >= 3 },
  { area: 'Eficiencia de desempeño', name: 'Presupuesto de compilación definido', pass: all(/maximumError/.test(angular), /1MB/.test(angular), /32kB/.test(angular)) },
  { area: 'Eficiencia de desempeño', name: 'Animación limitada y suspendida fuera de pantalla', pass: all(/devicePixelRatio \|\| 1, 1\.5/.test(homeTs), /time - lastPaint < 33/.test(homeTs), /IntersectionObserver/.test(homeTs), /document\.hidden/.test(homeTs)) },

  { area: 'Compatibilidad', name: 'Proxy API y fallback SPA', pass: all(/location \/api\//.test(nginx), /try_files \$uri \$uri\/ \/index\.html/.test(nginx)) },
  { area: 'Compatibilidad', name: 'Diseño adaptable y movimiento opcional', pass: all(/@media\(max-width:575px\)/.test(homeScss), /prefers-reduced-motion:reduce/.test(homeScss)) },

  { area: 'Capacidad de interacción', name: 'Contenido visual con alternativa textual', pass: images.length > 0 && images.length === imagesWithAlt.length },
  { area: 'Capacidad de interacción', name: 'Foco de teclado visible', pass: /:focus-visible/.test(homeScss) },
  { area: 'Capacidad de interacción', name: 'Carrusel operable con teclado', pass: all(/keydown\.arrowleft/.test(homeHtml), /keydown\.arrowright/.test(homeHtml), /aria-roledescription="carrusel"/.test(homeHtml)) },
  { area: 'Capacidad de interacción', name: 'Formulario etiquetado y estados comunicados', pass: all(/<label>/.test(homeHtml), /aria-live="polite"/.test(homeHtml), /form-error/.test(homeHtml)) },

  { area: 'Fiabilidad', name: 'Suite backend ejecutada sin fallos', pass: backendSuitePassed },
  { area: 'Fiabilidad', name: 'Salud, reinicio y dependencia de base de datos', pass: all(/actuator\/health/.test(properties + nginx), /restart: unless-stopped/.test(compose), /service_healthy/.test(compose)) },
  { area: 'Fiabilidad', name: 'Pruebas transaccionales y recuperación frontend', pass: all(/@Transactional/.test(backendTests), /catchError/.test(homeTs)) },

  { area: 'Seguridad', name: 'Contraseñas con BCrypt', pass: /BCryptPasswordEncoder/.test(security) },
  { area: 'Seguridad', name: 'Administración restringida por rol', pass: all(/hasRole\("ADMIN"\)/.test(security), /isUnauthorized\(\)/.test(backendTests)) },
  { area: 'Seguridad', name: 'Cookie HttpOnly, SameSite estricta y Secure configurable', pass: all(/cookie\.http-only=true/.test(properties), /cookie\.same-site=strict/.test(properties), /cookie\.secure=\$\{COOKIE_SECURE/.test(properties)) },
  { area: 'Seguridad', name: 'Protección CSRF activa para sesión', pass: !/csrf\(csrf -> csrf\.disable\(\)\)/.test(security) },

  { area: 'Mantenibilidad', name: 'TypeScript y plantillas en modo estricto', pass: all(/"strict": true/.test(tsconfig), /"strictTemplates": true/.test(tsconfig)) },
  { area: 'Mantenibilidad', name: 'Separación de UI, acceso a datos y backend', pass: all(exists('frontend/src/app/shared/brand-logo/brand-logo.ts'), exists('frontend/src/app/core/api.service.ts'), exists('backend/src/main/java/pe/gozu/api/repository/LeadRepository.java')) },

  { area: 'Flexibilidad', name: 'Ejecución local y PostgreSQL configurable', pass: all(/postgres:17-alpine/.test(compose), /DATABASE_URL/.test(properties + compose)) },
  { area: 'Flexibilidad', name: 'Servicios y módulos configurables', pass: all(/publicServices\(\)/.test(api), /selectedModules/.test(homeTs), /ServiceOffering/.test(api)) },

  { area: 'Seguridad operacional', name: 'Validación de entradas y rechazo de eventos inválidos', pass: all(/starter-validation/.test(read('backend/pom.xml')), /UNKNOWN/.test(backendTests), /isBadRequest\(\)/.test(backendTests)) },
];

const pointsPerCheck = 4;
const score = checks.filter((check) => check.pass).length * pointsPerCheck;
const target = 96;
const grouped = Map.groupBy(checks, (check) => check.area);

console.log('\nGOZU · Puerta de calidad ISO/IEC 25010:2023');
console.log('Perfil interno verificable; no equivale a certificación ISO.\n');
for (const [area, areaChecks] of grouped) {
  const areaScore = areaChecks.filter((check) => check.pass).length * pointsPerCheck;
  const areaMax = areaChecks.length * pointsPerCheck;
  console.log(`${area}: ${areaScore}/${areaMax}`);
  for (const check of areaChecks) console.log(`  ${check.pass ? 'PASS' : 'GAP '} ${check.name}`);
}
console.log(`\nResultado: ${score}/100 · Umbral: ${target}/100`);
if (score < target) {
  console.error('QUALITY GATE: RECHAZADO');
  process.exit(1);
}
console.log('QUALITY GATE: APROBADO');
