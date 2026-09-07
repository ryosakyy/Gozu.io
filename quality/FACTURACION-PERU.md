# GOZU: cobros y comprobantes

Investigación: 6 de septiembre de 2026.

## Estado comprobado del proyecto

El backend tiene clientes, suscripciones de referencia y movimientos de ingresos/gastos. No se encontró un emisor de comprobantes electrónicos, integración SUNAT, pasarela de cobro ni conciliación automática. El seeder incluye movimientos ilustrativos: no deben interpretarse como ventas reales.

## Flujo comercial propuesto

Consulta → diagnóstico → propuesta aceptada → implementación por hitos → entrega → mantenimiento mensual contratado.

Separar el importe de implementación, los servicios recurrentes y cualquier ampliación. Un clic a WhatsApp es una consulta, no una venta. Una propuesta aceptada no es un cobro. Medir solicitudes calificadas, propuestas aceptadas, pagos recibidos y margen después de costos y horas de trabajo.

## Emisión en Perú

SUNAT ofrece emisión desde SEE-SOL. Para iniciar con pocas operaciones puede evaluarse ese canal antes de automatizar. Se necesita comprobar la situación del RUC, el tipo de actividad y el comprobante aplicable; un servicio independiente puede requerir un tratamiento distinto al de una empresa. La factura se emite a adquirentes con RUC; la boleta corresponde normalmente al consumidor final.

Para integrar un sistema propio, SUNAT describe la habilitación del emisor y el uso de certificado digital o vinculación con un PSE. El envío devuelve una CDR con aceptación, observación o rechazo. Debe conservarse la documentación y ofrecer acceso al cliente conforme al sistema de emisión elegido. Un PDF generado por GOZU, por sí solo, no acredita aceptación tributaria.

## Diseño pendiente para automatizar

- Cliente fiscal: documento, razón social, dirección y correo.
- Contrato: concepto, moneda, importe, frecuencia, vencimiento y tratamiento tributario validado.
- Cobro: pendiente, parcial, pagado o reembolsado, con referencia verificable.
- Comprobante: serie, correlativo, detalle, impuestos, estado de envío, XML, representación PDF y CDR.
- Reintentos sin duplicar emisiones, registro de errores, notas de crédito y conciliación.
- Credenciales exclusivamente en backend; pruebas del proveedor antes de habilitar emisión real.

El momento de emisión, IGV, detracciones y régimen deben definirse con el contador según la operación. No se han configurado impuestos ni emitido comprobantes en esta revisión.

## Fuentes

- [SUNAT: SEE del contribuyente](https://cpe.sunat.gob.pe/sistema_emision/see_contribuyente)
- [SUNAT: orientación de comprobantes](https://centrovirtual.sunat.gob.pe/informate-aqui)
- [SUNAT: SEE-SOL](https://www.gob.pe/institucion/sunat/pages/7332-sistema-de-emision-electronica-see-sol)
- [Nielsen Norman Group: contenido breve y fácil de recorrer](https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/)
