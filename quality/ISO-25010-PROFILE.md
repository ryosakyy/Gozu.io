# Puerta de calidad GOZU — ISO/IEC 25010:2023

Este perfil convierte las nueve características del modelo de calidad de producto ISO/IEC 25010:2023 en 25 comprobaciones automáticas de cuatro puntos. El despliegue se acepta únicamente con **96/100 o más**.

No representa una certificación ISO ni sustituye una auditoría independiente. Es una evaluación interna, repetible y trazable del repositorio.

## Áreas evaluadas

| Característica | Puntos | Evidencia principal |
|---|---:|---|
| Adecuación funcional | 16 | Rutas, prospectos, administrador y cotizador |
| Eficiencia de desempeño | 12 | Lazy loading, presupuestos y animación limitada |
| Compatibilidad | 8 | Proxy, fallback SPA, responsive y movimiento reducido |
| Capacidad de interacción | 16 | Texto alternativo, teclado, foco y formularios |
| Fiabilidad | 12 | JUnit, health checks, transacciones y recuperación |
| Seguridad | 16 | BCrypt, roles, cookies y CSRF |
| Mantenibilidad | 8 | Compilación estricta y separación de responsabilidades |
| Flexibilidad | 8 | Configuración por entorno y módulos dinámicos |
| Seguridad operacional | 4 | Validación y rechazo de entradas inválidas |
| **Total** | **100** | **Umbral obligatorio: 96** |

## Ejecución

1. Ejecutar `backend\\mvnw.cmd test` para producir la evidencia JUnit.
2. Ejecutar `npm run build` dentro de `frontend`.
3. Ejecutar `npm run quality:iso` dentro de `frontend`.

Cada comprobación muestra `PASS` o `GAP`. Un resultado menor que 96 devuelve un código de error y bloquea la aceptación técnica.

## Estado verificado

- Resultado: **96/100 — APROBADO**.
- Suite backend: 4 pruebas JUnit, 0 fallos y 0 errores.
- Frontend: compilación de producción aprobada con presupuestos activos.
- Brecha registrada: la protección CSRF continúa desactivada y debe habilitarse antes de operar el administrador en un dominio público.
