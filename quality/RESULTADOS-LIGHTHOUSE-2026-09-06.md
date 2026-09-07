# Verificación de rendimiento y accesibilidad

Fecha: 6 de septiembre de 2026. Compilación de producción servida localmente en http://127.0.0.1:4300/.

| Auditoría | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---:|---:|---:|---:|
| Móvil, última ejecución | 70 | 100 | 100 | 100 |
| Escritorio, última ejecución | 97 | 100 | 100 | 100 |

Móvil: LCP 4,5 s, bloqueo total 480 ms, CLS 0. La primera medición local de producción realizada durante este trabajo fue 40/99/100/92, con LCP 8,6 s y CLS 0,167. No se equipara esa medición con el 36 de la captura del usuario: la captura corresponde al servidor de desarrollo y no conserva la configuración completa del ensayo.

## Cambios comprobados

- Colores específicos para texto en fondos claros y oscuros; corrección de etiquetas, precios, enlaces, botones y textos secundarios. Las auditorías finales no reportan fallos automáticos de contraste.
- Carrusel con contenedor compatible con su rol ARIA.
- Fotos WebP: 3.595.062 bytes originales frente a 1.032.008 bytes optimizados (71 % menos en conjunto). Se conservan los JPG originales.
- 77 iconos SVG locales utilizados por la aplicación; eliminada la descarga de la fuente completa de Bootstrap Icons.
- GSAP, ScrollTrigger y ScrollSmoother se cargan dinámicamente para escritorio; móvil conserva navegación nativa y logo estático.
- Fuentes principales precargadas, estilos de producción sin aplicación tardía y hero visible sin esperar un fundido de opacidad.
- Compresión gzip en la vista de producción y configurada también en nginx.
- robots.txt real; archivos inexistentes dejan de devolver HTML en la vista de auditoría.
- Navegación portada → formulario revisada visualmente en el navegador.

## Límites y siguiente prioridad

El rendimiento móvil sigue en 70: LCP y tiempo de bloqueo requieren más trabajo. La siguiente mejora de arquitectura a evaluar es prerenderizado/SSR del contenido comercial y división de la página en componentes con carga diferida. No está implementada en este cambio. Lighthouse es una prueba de laboratorio, no certificación WCAG/ISO ni garantía de rendimiento en todos los dispositivos. Tampoco equivale a repetir exactamente el escaneo de la extensión axe del usuario.

La compilación tiene una advertencia por home.scss (30,23 kB frente a 29 kB recomendados); no se aumentó el presupuesto para ocultarla. No se modificaron credenciales, cobros ni registros comerciales para estas pruebas.

## Evidencia

- lighthouse-mobile-optimized.report.html / .json
- lighthouse-desktop.report.html / .json

La vista 4300 es para auditar el frontend de producción. La aplicación de desarrollo sigue en 4200. No se ha validado el flujo de escritura/autenticación del proxy 4300.
