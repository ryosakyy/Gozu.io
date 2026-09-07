import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo';

interface DemoMetric { label: string; value: string; trend: string; icon: string; }
interface DemoActivity { title: string; detail: string; value: string; state: string; }
interface WorkflowStep { title: string; detail: string; }
interface DemoModule { description: string; action: string; columns: string[]; rows: string[][]; statusFlow: string[]; }
interface DemoConfig {
  slug: string; product: string; industry: string; image: string; headline: string; description: string;
  accent: string; soft: string; navigation: string[]; metrics: DemoMetric[]; activities: DemoActivity[];
  chart: number[]; chartLabels: string[]; workflow: WorkflowStep[]; controls: string[]; outcome: string;
}

@Component({
  selector: 'app-demo',
  imports: [CommonModule, FormsModule, RouterLink, BrandLogoComponent],
  templateUrl: './demo.html',
  styleUrl: './demo.scss',
})
export class DemoPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  activeView = signal('Resumen');
  notice = signal('');
  sidebarOpen = signal(false);
  search = signal('');
  statusFilter = signal('Todos');
  selectedRow = signal<string[] | null>(null);
  modalOpen = signal(false);
  newReference = '';
  newName = '';
  newAmount = '';
  newStatus = 'Pendiente';
  private readonly createdRows = signal<Record<string, string[][]>>({});
  private readonly rowOverrides = signal<Record<string, string[]>>({});
  private readonly routeParams = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  private readonly demos: Record<string, DemoConfig> = {
    inventario: {
      slug: 'inventario', product: 'GOZU Venta', industry: 'Ventas e inventario', image: '/images/inventory.jpg',
      headline: 'Compra, vende y repone con cantidades que sí cuadran.',
      description: 'POS, productos, compras, almacenes, caja y alertas conectados para tiendas y distribuidores.',
      accent: '#4169e1', soft: '#e8eeff',
      navigation: ['Resumen', 'Ventas', 'Productos', 'Compras', 'Almacenes', 'Reportes'],
      chart: [38, 52, 47, 69, 63, 81, 74], chartLabels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      metrics: [
        { label: 'Venta de hoy', value: 'S/ 6,842', trend: '+12.4% vs. ayer', icon: 'bi-cash-stack' },
        { label: 'Stock disponible', value: '3,184', trend: '12 requieren reposición', icon: 'bi-box-seam' },
        { label: 'Margen estimado', value: '34.8%', trend: '+2.1 puntos', icon: 'bi-graph-up-arrow' },
        { label: 'Caja esperada', value: 'S/ 6,840', trend: 'Diferencia S/ 2', icon: 'bi-wallet2' },
      ],
      activities: [
        { title: 'Venta V-10482', detail: 'POS Lima · Tarjeta', value: 'S/ 289', state: 'Pagada' },
        { title: 'Compra OC-0841', detail: 'Distribuidora Andina', value: 'S/ 1,840', state: 'Por recibir' },
        { title: 'Zapatilla Urban 02', detail: 'Disponible 12 · mínimo 20', value: 'Reponer 48', state: 'Alerta' },
      ],
      workflow: [
        { title: 'Configura', detail: 'Productos, variantes, SKU, código de barras, costo, precio e impuestos.' },
        { title: 'Compra', detail: 'Orden al proveedor, recepción parcial o total y costo actualizado.' },
        { title: 'Vende', detail: 'POS, cliente, descuentos, medios de pago y comprobante.' },
        { title: 'Repone', detail: 'Disponible, comprometido, mínimo, máximo y días del proveedor.' },
        { title: 'Decide', detail: 'Margen, rotación, quiebres, valorización y diferencia de caja.' },
      ],
      controls: ['SKU único y código de barras', 'Costo, precio y margen', 'Disponible vs. comprometido', 'Mínimo, máximo y proveedor', 'Lotes y vencimiento opcionales', 'Roles para descuentos y anulaciones'],
      outcome: 'Ideal para tiendas, minimarkets y distribuidores con uno o varios almacenes.',
    },
    polleria: {
      slug: 'polleria', product: 'GOZU Restaurante', industry: 'Restaurantes y pollerías', image: '/images/restaurant.jpg',
      headline: 'Del pedido a cocina, caja e inventario sin doble digitación.',
      description: 'Salón, QR, recojo y delivery alimentan la misma cocina, caja y control de insumos.',
      accent: '#e85d36', soft: '#fff0ea',
      navigation: ['Resumen', 'Pedidos', 'Mesas', 'Cocina', 'Inventario', 'Caja'],
      chart: [44, 61, 57, 73, 89, 96, 82], chartLabels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      metrics: [
        { label: 'Venta de hoy', value: 'S/ 4,860', trend: '+14.2% vs. ayer', icon: 'bi-receipt' },
        { label: 'Pedidos activos', value: '18', trend: '7 en cocina', icon: 'bi-bag-check' },
        { label: 'Tiempo cocina', value: '13 min', trend: 'Meta: menos de 15', icon: 'bi-stopwatch' },
        { label: 'Food cost', value: '31.6%', trend: 'Dentro del objetivo', icon: 'bi-pie-chart' },
      ],
      activities: [
        { title: 'Pedido BR-1084', detail: 'Mesa 12 · Brasas y bebidas', value: 'S/ 98', state: 'En cocina' },
        { title: 'Pedido BR-1083', detail: 'Delivery · Los Olivos', value: 'S/ 74.50', state: 'En ruta' },
        { title: 'Papas prefritas', detail: 'Stock 8 kg · mínimo 12 kg', value: 'Reponer', state: 'Alerta' },
      ],
      workflow: [
        { title: 'Abre pedido', detail: 'Mesa, llevar, QR o delivery; cliente, comensales y responsable.' },
        { title: 'Personaliza', detail: 'Tamaños, términos, extras, notas, cortesías y descuentos autorizados.' },
        { title: 'Produce', detail: 'Comanda por estación, prioridad, tiempo y estado en pantalla de cocina.' },
        { title: 'Cobra', detail: 'Cuenta unida o dividida, Yape, efectivo, tarjeta y comprobante.' },
        { title: 'Descuenta', detail: 'Recetas, insumos, mermas, compras y costo real de cada plato.' },
      ],
      controls: ['Canal y tipo de atención', 'Mesa, mozo y número de personas', 'Modificadores y notas de cocina', 'Estación, prioridad y tiempo', 'Receta, rendimiento y merma', 'Turno, caja y permisos de anulación'],
      outcome: 'Ideal para pollerías, restaurantes, cafeterías y fast food con salón y delivery.',
    },
    barberia: {
      slug: 'barberia', product: 'GOZU Agenda', industry: 'Barberías, salones y servicios', image: '/images/barber.jpg',
      headline: 'Reservas reales, menos huecos y cada profesional bajo control.',
      description: 'Página de reservas, agenda, clientes, anticipos, recordatorios, caja y comisiones.',
      accent: '#8b5a2b', soft: '#f7eee5',
      navigation: ['Resumen', 'Agenda', 'Clientes', 'Servicios', 'Equipo', 'Caja'],
      chart: [38, 55, 49, 68, 76, 95, 88], chartLabels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      metrics: [
        { label: 'Reservas de hoy', value: '22', trend: '4 espacios libres', icon: 'bi-calendar-heart' },
        { label: 'Ocupación', value: '82%', trend: '+11% semanal', icon: 'bi-pie-chart' },
        { label: 'Inasistencias', value: '4.5%', trend: '2 anticipos protegidos', icon: 'bi-person-x' },
        { label: 'Ticket promedio', value: 'S/ 48', trend: '+S/ 6 este mes', icon: 'bi-stars' },
      ],
      activities: [
        { title: '10:00 · Diego Salazar', detail: 'Corte clásico · Andrés', value: 'S/ 40', state: 'Confirmada' },
        { title: '10:45 · José Ríos', detail: 'Corte + barba · Mateo', value: 'S/ 65', state: 'En atención' },
        { title: '12:30 · Espacio libre', detail: 'Lista de espera: 3 clientes', value: '45 min', state: 'Disponible' },
      ],
      workflow: [
        { title: 'Publica', detail: 'Servicios, fotos, variantes, duración, precio, profesional y horarios.' },
        { title: 'Reserva', detail: 'El cliente elige servicio, profesional, fecha y un horario compatible.' },
        { title: 'Protege', detail: 'Anticipo, política de cancelación, confirmación y recordatorios.' },
        { title: 'Atiende', detail: 'Llegada, notas, historial, extras, productos usados y próxima cita.' },
        { title: 'Liquida', detail: 'Pago, propina, comisión, cierre de caja y rendimiento por profesional.' },
      ],
      controls: ['Duración, descanso y simultaneidad', 'Profesionales habilitados por servicio', 'Anticipación y ventana de cancelación', 'Anticipo y estado del pago', 'Sala o recurso requerido', 'Comisión por servicio y producto'],
      outcome: 'Ideal para barberías, salones, spas y otros negocios que trabajan por cita.',
    },
  };

  private readonly moduleLibrary: Record<string, Record<string, DemoModule>> = {
    inventario: {
      Ventas: { description: 'Del borrador al pago y entrega con stock reservado.', action: 'Nueva venta', columns: ['Venta', 'Cliente', 'Canal', 'Medio de pago', 'Total', 'Estado'], statusFlow: ['Borrador', 'Confirmada', 'Pagada', 'Entregada'], rows: [['V-10482', 'Andrea Mendoza', 'POS Lima', 'Tarjeta', 'S/ 289.00', 'Pagada'], ['V-10481', 'Bodega Central', 'Mayorista', 'Transferencia', 'S/ 1,240.00', 'Confirmada'], ['V-10480', 'Renzo Pérez', 'Tienda web', 'Yape', 'S/ 145.00', 'Entregada']] },
      Productos: { description: 'Identidad, costo, precio, disponibilidad y reposición por variante.', action: 'Nuevo producto', columns: ['SKU', 'Producto', 'Costo / Precio', 'Disponible', 'Comprometido', 'Estado'], statusFlow: ['Borrador', 'Activo', 'Stock bajo', 'Agotado'], rows: [['ROP-POL-BLK-M', 'Polo premium · negro M', 'S/ 28 / S/ 59', '184 und.', '12 und.', 'Activo'], ['CAL-URB-WHT-42', 'Zapatilla Urban · 42', 'S/ 110 / S/ 189', '12 und.', '8 und.', 'Stock bajo'], ['ACC-MOC-BLU', 'Mochila Travel · azul', 'S/ 54 / S/ 109', '76 und.', '4 und.', 'Activo']] },
      Compras: { description: 'Orden, aprobación, recepción parcial o total y saldo al proveedor.', action: 'Nueva orden de compra', columns: ['Orden', 'Proveedor', 'Entrega esperada', 'Productos', 'Total', 'Estado'], statusFlow: ['Borrador', 'Aprobada', 'Por recibir', 'Recibida'], rows: [['OC-0841', 'Distribuidora Andina', '14 Ago', '8 productos', 'S/ 1,840', 'Por recibir'], ['OC-0840', 'Textiles Lima', '12 Ago', '3 productos', 'S/ 920', 'Recibida'], ['OC-0839', 'Importadora Sur', '18 Ago', '12 productos', 'S/ 4,680', 'Aprobada']] },
      Almacenes: { description: 'Existencia separada, transferencias y conteos por ubicación.', action: 'Nueva transferencia', columns: ['Movimiento', 'Origen', 'Destino', 'Productos', 'Cantidad', 'Estado'], statusFlow: ['Borrador', 'Preparando', 'En tránsito', 'Recibida'], rows: [['TR-0442', 'Lima Centro', 'Arequipa', 'Mochila Travel', '12 und.', 'En tránsito'], ['AJ-0318', 'Lima Centro', 'Ajuste de conteo', 'Zapatilla Urban', '−2 und.', 'Recibida'], ['TR-0441', 'Trujillo', 'Lima Centro', 'Polo premium', '40 und.', 'Recibida']] },
      Reportes: { description: 'Margen, rotación, quiebres, valorización y caja por periodo.', action: 'Generar reporte', columns: ['Reporte', 'Periodo', 'Indicador', 'Resultado', 'Variación', 'Estado'], statusFlow: ['Procesando', 'Disponible'], rows: [['Margen por categoría', 'Agosto', 'Margen bruto', '34.8%', '+2.1 pts', 'Disponible'], ['Reposición sugerida', 'Próximos 14 días', 'Productos', '12', '−18%', 'Disponible'], ['Cierre por medio de pago', 'Hoy', 'Diferencia', 'S/ 2.00', '−S/ 6', 'Disponible']] },
    },
    polleria: {
      Pedidos: { description: 'Todos los canales pasan por una sola cola operativa.', action: 'Nuevo pedido', columns: ['Pedido', 'Canal', 'Cliente / Mesa', 'Detalle', 'Total', 'Estado'], statusFlow: ['Abierto', 'Enviado a cocina', 'Listo', 'Entregado', 'Pagado'], rows: [['BR-1084', 'Salón', 'Mesa 12', '1 pollo + bebidas', 'S/ 98.00', 'Enviado a cocina'], ['BR-1083', 'Delivery', 'Rosa M.', 'Combo familiar', 'S/ 74.50', 'Entregado'], ['BR-1082', 'QR', 'Mesa 04', 'Parrilla familiar', 'S/ 132.00', 'Pagado']] },
      Mesas: { description: 'Ocupación, responsable, duración y cuenta abierta por mesa.', action: 'Abrir mesa', columns: ['Mesa', 'Zona', 'Mozo', 'Personas', 'Consumo', 'Estado'], statusFlow: ['Libre', 'Ocupada', 'Por cobrar', 'Cerrada'], rows: [['Mesa 04', 'Salón', 'Lucía', '4', 'S/ 132.00', 'Ocupada'], ['Mesa 08', 'Terraza', 'Pedro', '2', 'S/ 46.00', 'Ocupada'], ['Mesa 12', 'Salón', 'Lucía', '6', 'S/ 198.00', 'Por cobrar']] },
      Cocina: { description: 'Cada estación recibe solo sus ítems y actualiza el pedido.', action: 'Nueva comanda', columns: ['Comanda', 'Estación', 'Pedido', 'Tiempo', 'Prioridad', 'Estado'], statusFlow: ['En cola', 'En preparación', 'Listo', 'Entregado'], rows: [['KDS-442', 'Brasas', 'BR-1084', '08:32', 'Normal', 'En preparación'], ['KDS-441', 'Frituras', 'BR-1085', '12:10', 'Alta', 'En cola'], ['KDS-440', 'Bebidas', 'BR-1086', '03:18', 'Normal', 'Listo']] },
      Inventario: { description: 'Recetas descuentan insumos; compras, mermas y conteos explican diferencias.', action: 'Registrar movimiento', columns: ['Insumo', 'Disponible', 'Mínimo', 'Consumo hoy', 'Costo', 'Estado'], statusFlow: ['Disponible', 'Por reponer', 'Agotado'], rows: [['Pollo entero', '42 und.', '24 und.', '31 und.', 'S/ 16.20', 'Disponible'], ['Papas prefritas', '8 kg', '12 kg', '18 kg', 'S/ 4.80/kg', 'Por reponer'], ['Carbón vegetal', '68 kg', '30 kg', '22 kg', 'S/ 2.40/kg', 'Disponible']] },
      Caja: { description: 'Apertura, pagos, retiros, anulaciones autorizadas y cierre por turno.', action: 'Abrir turno', columns: ['Turno', 'Cajero', 'Apertura', 'Venta esperada', 'Diferencia', 'Estado'], statusFlow: ['Abierto', 'En revisión', 'Cerrado'], rows: [['CJ-082', 'Ana Rojas', 'S/ 300', 'S/ 2,640', 'S/ 0.00', 'Abierto'], ['CJ-081', 'Luis Díaz', 'S/ 300', 'S/ 4,218', '+S/ 2.50', 'Cerrado'], ['CJ-080', 'María Paz', 'S/ 250', 'S/ 3,904', '−S/ 1.00', 'Cerrado']] },
    },
    barberia: {
      Agenda: { description: 'Disponibilidad por profesional, duración, descanso y recurso.', action: 'Nueva reserva', columns: ['Hora', 'Cliente', 'Servicio', 'Profesional', 'Anticipo', 'Estado'], statusFlow: ['Reservada', 'Confirmada', 'En atención', 'Completada', 'Pagada'], rows: [['10:00', 'Diego Salazar', 'Corte clásico', 'Andrés', 'S/ 0', 'Confirmada'], ['10:45', 'José Ríos', 'Corte + barba', 'Mateo', 'S/ 20', 'En atención'], ['11:30', 'Carlos Luna', 'Barba premium', 'Andrés', 'S/ 10', 'Reservada']] },
      Clientes: { description: 'Contacto, historial, preferencias, ausencias y próxima acción.', action: 'Nuevo cliente', columns: ['Cliente', 'Contacto', 'Visitas', 'Última visita', 'Inasistencias', 'Estado'], statusFlow: ['Nuevo', 'Activo', 'Frecuente', 'VIP'], rows: [['Diego Salazar', '999 244 186', '14', 'Hoy', '0', 'Frecuente'], ['José Ríos', '988 633 402', '8', 'Hoy', '1', 'Activo'], ['Carlos Luna', '977 104 558', '22', 'Hoy', '0', 'VIP']] },
      Servicios: { description: 'Precio, duración, descanso, anticipo y profesionales habilitados.', action: 'Nuevo servicio', columns: ['Servicio', 'Duración / descanso', 'Precio', 'Anticipo', 'Profesionales', 'Estado'], statusFlow: ['Borrador', 'Activo', 'Oculto'], rows: [['Corte clásico', '40 / 5 min', 'S/ 40', 'Opcional', '3', 'Activo'], ['Corte + barba', '60 / 10 min', 'S/ 65', 'S/ 20', '2', 'Activo'], ['Barba premium', '30 / 5 min', 'S/ 35', 'S/ 10', '3', 'Activo']] },
      Equipo: { description: 'Turnos, permisos, servicios, ocupación y comisión por profesional.', action: 'Nuevo profesional', columns: ['Profesional', 'Horario', 'Citas hoy', 'Ocupación', 'Comisión', 'Estado'], statusFlow: ['Invitado', 'Disponible', 'En atención', 'Ausente'], rows: [['Andrés Rojas', '09:00–18:00', '9', '88%', '35%', 'Disponible'], ['Mateo Silva', '10:00–20:00', '8', '82%', '35%', 'En atención'], ['Sergio Paz', '12:00–20:00', '6', '70%', '30%', 'Disponible']] },
      Caja: { description: 'Cobros, propinas, productos, comisiones y cierre del día.', action: 'Registrar cobro', columns: ['Cobro', 'Cliente', 'Servicio / producto', 'Medio', 'Total', 'Estado'], statusFlow: ['Pendiente', 'Pagado', 'Anulado'], rows: [['CB-2044', 'José Ríos', 'Corte + barba', 'Yape', 'S/ 65', 'Pendiente'], ['CB-2043', 'Diego Salazar', 'Corte clásico', 'Tarjeta', 'S/ 40', 'Pagado'], ['CB-2042', 'Ana Ruiz', 'Color + shampoo', 'Efectivo', 'S/ 145', 'Pagado']] },
    },
  };

  private readonly demoOrder = ['inventario', 'polleria', 'barberia'];
  readonly demo = computed(() => {
    const slug = this.routeParams().get('slug') || 'inventario';
    return this.demos[slug] || this.demos['inventario'];
  });
  private lastTrackedSlug = '';
  private readonly demoTracking = effect(() => {
    const slug = this.demo().slug;
    if (slug === this.lastTrackedSlug) return;
    this.lastTrackedSlug = slug;
    this.api.trackDemo(slug).subscribe({ error: () => undefined });
  });
  readonly module = computed<DemoModule | null>(() => this.moduleLibrary[this.demo().slug]?.[this.activeView()] || null);
  readonly rowKey = computed(() => `${this.demo().slug}:${this.activeView()}`);
  readonly allRows = computed(() => [...(this.createdRows()[this.rowKey()] || []), ...(this.module()?.rows || [])]
    .map((row) => this.rowOverrides()[`${this.rowKey()}:${row[0]}`] || row));
  readonly statuses = computed(() => ['Todos', ...Array.from(new Set(this.allRows().map((row) => row[row.length - 1])))]);
  readonly filteredRows = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.allRows().filter((row) => (!query || row.some((cell) => cell.toLowerCase().includes(query))) &&
      (this.statusFilter() === 'Todos' || row[row.length - 1] === this.statusFilter()));
  });
  readonly selectedStatus = computed(() => {
    const row = this.selectedRow();
    return row?.[row.length - 1] || '';
  });
  readonly previousDemo = computed(() => {
    const index = this.demoOrder.indexOf(this.demo().slug);
    return this.demos[this.demoOrder[(index - 1 + this.demoOrder.length) % this.demoOrder.length]];
  });
  readonly nextDemo = computed(() => {
    const index = this.demoOrder.indexOf(this.demo().slug);
    return this.demos[this.demoOrder[(index + 1) % this.demoOrder.length]];
  });

  selectView(view: string) { this.activeView.set(view); this.sidebarOpen.set(false); this.search.set(''); this.statusFilter.set('Todos'); this.selectedRow.set(null); }
  prepareDemoSwitch() { this.selectView('Resumen'); }
  updateSearch(value: string) { this.search.set(value); }
  updateStatus(value: string) { this.statusFilter.set(value); }
  openCreate() { this.modalOpen.set(true); this.newReference = ''; this.newName = ''; this.newAmount = ''; this.newStatus = this.module()?.statusFlow[0] || 'Pendiente'; }
  createOperation() {
    if (!this.newName.trim() || !this.module()) return;
    const row = this.module()!.columns.map((column, index) => this.valueForColumn(column, index));
    this.createdRows.update((current) => ({ ...current, [this.rowKey()]: [row, ...(current[this.rowKey()] || [])] }));
    this.modalOpen.set(false); this.showNotice(`${this.module()!.action} creada correctamente.`);
  }
  openDetail(row: string[]) { this.selectedRow.set(row); }
  advanceSelected() {
    const row = this.selectedRow(); const currentModule = this.module();
    if (!row || !currentModule) return;
    const current = row[row.length - 1]; const index = currentModule.statusFlow.indexOf(current);
    const next = currentModule.statusFlow[Math.min(Math.max(index, 0) + 1, currentModule.statusFlow.length - 1)];
    if (next === current) { this.showNotice('El registro ya llegó a su estado final.'); return; }
    const updated = [...row]; updated[updated.length - 1] = next;
    this.rowOverrides.update((items) => ({ ...items, [`${this.rowKey()}:${row[0]}`]: updated }));
    this.selectedRow.set(updated); this.showNotice(`Estado actualizado a “${next}”.`);
  }
  simulateAction() { this.showNotice(`Acción de ${this.demo().product} ejecutada correctamente.`); }

  private showNotice(message: string) { this.notice.set(message); window.setTimeout(() => this.notice.set(''), 2800); }
  private valueForColumn(column: string, index: number) {
    const key = column.toLowerCase();
    if (/sku|venta|orden|pedido|comanda|turno|cobro|movimiento|reporte|mesa/.test(key)) return this.newReference || `NUE-${Date.now().toString().slice(-4)}`;
    if (/producto|cliente|insumo|profesional|servicio/.test(key)) return this.newName;
    if (/total|precio|venta|anticipo|costo/.test(key)) return this.newAmount ? `S/ ${this.newAmount}` : 'S/ 0.00';
    if (/estado/.test(key)) return this.newStatus;
    if (/fecha|hora|entrega|visita/.test(key)) return 'Hoy · 14:30';
    if (/stock|cantidad|productos|personas|citas|visitas/.test(key)) return '1';
    return index === 0 ? (this.newReference || 'NUEVO') : index === 1 ? this.newName : 'Por definir';
  }
}
