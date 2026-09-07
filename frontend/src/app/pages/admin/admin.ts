import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Client, Dashboard, FinanceTransaction, Lead, ServiceOffering } from '../../core/models';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo';

type AdminTab = 'overview' | 'leads' | 'clients' | 'services' | 'finances';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, BrandLogoComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  authenticated = signal(false);
  loading = signal(false);
  saving = signal(false);
  sidebarOpen = signal(false);
  activeTab = signal<AdminTab>('overview');
  error = signal('');
  success = signal('');
  dashboard = signal<Dashboard>({ activeClients: 0, newLeads: 0, mrr: 0, income: 0, expenses: 0, profit: 0, demoViews: 0, popularDemo: 'Sin datos', pageViews: 0, ctaClicks: 0, leadConversion: 0, popularPlan: 'Sin datos' });
  leads = signal<Lead[]>([]);
  clients = signal<Client[]>([]);
  services = signal<ServiceOffering[]>([]);
  transactions = signal<FinanceTransaction[]>([]);

  readonly leadStatuses = [
    { value: 'NEW', label: 'Nuevo' },
    { value: 'CONTACTED', label: 'Contactado' },
    { value: 'PROPOSAL', label: 'Propuesta' },
    { value: 'WON', label: 'Ganado' },
    { value: 'LOST', label: 'Perdido' },
  ];
  readonly clientStatuses = ['TRIAL', 'ACTIVE', 'PAUSED', 'CANCELLED'];

  loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  clientForm = this.fb.nonNullable.group({
    businessName: ['', Validators.required],
    contactName: ['', Validators.required],
    phone: ['', Validators.required],
    planName: ['Plan Negocio', Validators.required],
    monthlyFee: [249, [Validators.required, Validators.min(0)]],
    status: ['ACTIVE', Validators.required],
  });
  serviceForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['Sistema empresarial', Validators.required],
    description: ['', Validators.required],
    monthlyPrice: [149, [Validators.required, Validators.min(0)]],
    active: [true],
  });
  transactionForm = this.fb.nonNullable.group({
    type: ['INCOME' as 'INCOME' | 'EXPENSE', Validators.required],
    description: ['', Validators.required],
    amount: [100, [Validators.required, Validators.min(0.01)]],
    occurredOn: [new Date().toISOString().slice(0, 10), Validators.required],
  });

  login() {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    const { username, password } = this.loginForm.getRawValue();
    this.loading.set(true);
    this.error.set('');
    this.api.login(username, password).subscribe({
      next: () => this.loadData(true),
      error: () => { this.loading.set(false); this.error.set('Usuario o contraseña incorrectos.'); },
    });
  }

  loadData(isLogin = false) {
    this.loading.set(true);
    this.error.set('');
    forkJoin({
      dashboard: this.api.dashboard(), leads: this.api.leads(), clients: this.api.clients(),
      services: this.api.adminServices(), transactions: this.api.transactions(),
    }).subscribe({
      next: (data) => {
        this.dashboard.set(data.dashboard); this.leads.set(data.leads); this.clients.set(data.clients);
        this.services.set(data.services); this.transactions.set(data.transactions);
        this.authenticated.set(true); this.loading.set(false);
        if (isLogin) this.showSuccess('Acceso correcto. Bienvenido al centro de control.');
      },
      error: (response) => {
        this.loading.set(false);
        this.authenticated.set(false);
        this.error.set(response.status === 401 ? 'Usuario o contraseña incorrectos.' : 'No se pudo conectar con la API. Confirma que el backend Java esté encendido.');
      },
    });
  }

  setTab(tab: AdminTab) { this.activeTab.set(tab); this.sidebarOpen.set(false); }
  logout() {
    this.api.logout().subscribe({ complete: () => this.finishLogout(), error: () => this.finishLogout() });
  }

  changeLeadStatus(lead: Lead, event: Event) {
    if (!lead.id) return;
    const status = (event.target as HTMLSelectElement).value;
    this.api.updateLead(lead.id, status).subscribe({
      next: (updated) => {
        this.leads.update((items) => items.map((item) => item.id === updated.id ? updated : item));
        this.refreshDashboard(); this.showSuccess('Estado del prospecto actualizado.');
      },
      error: () => this.error.set('No se pudo actualizar el prospecto.'),
    });
  }

  addClient() {
    if (this.clientForm.invalid) { this.clientForm.markAllAsTouched(); return; }
    this.saving.set(true);
    this.api.createClient(this.clientForm.getRawValue()).subscribe({
      next: (client) => {
        this.clients.update((items) => [client, ...items]); this.saving.set(false);
        this.clientForm.reset({ businessName: '', contactName: '', phone: '', planName: 'Plan Negocio', monthlyFee: 249, status: 'ACTIVE' });
        this.refreshDashboard(); this.showSuccess('Cliente y suscripción registrados.');
      },
      error: () => { this.saving.set(false); this.error.set('No se pudo guardar el cliente.'); },
    });
  }

  addService() {
    if (this.serviceForm.invalid) { this.serviceForm.markAllAsTouched(); return; }
    this.saving.set(true);
    this.api.createService(this.serviceForm.getRawValue()).subscribe({
      next: (service) => {
        this.services.update((items) => [...items, service]); this.saving.set(false);
        this.serviceForm.reset({ name: '', category: 'Sistema empresarial', description: '', monthlyPrice: 149, active: true });
        this.showSuccess('Nuevo servicio publicado en el catálogo.');
      },
      error: () => { this.saving.set(false); this.error.set('No se pudo crear el servicio.'); },
    });
  }

  addTransaction() {
    if (this.transactionForm.invalid) { this.transactionForm.markAllAsTouched(); return; }
    this.saving.set(true);
    this.api.createTransaction(this.transactionForm.getRawValue()).subscribe({
      next: (transaction) => {
        this.transactions.update((items) => [transaction, ...items]); this.saving.set(false);
        this.transactionForm.reset({ type: 'INCOME', description: '', amount: 100, occurredOn: new Date().toISOString().slice(0, 10) });
        this.refreshDashboard(); this.showSuccess('Movimiento financiero registrado.');
      },
      error: () => { this.saving.set(false); this.error.set('No se pudo registrar el movimiento.'); },
    });
  }

  formatMoney(value: number | null | undefined) {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(Number(value || 0));
  }
  statusLabel(status?: string) { return this.leadStatuses.find((item) => item.value === status)?.label || status || ''; }
  statusClass(status?: string) { return `status-${(status || '').toLowerCase()}`; }
  leadCount(status: string) { return this.leads().filter((lead) => lead.status === status).length; }
  funnelWidth(status: string) {
    const count = this.leadCount(status);
    return Math.max((count / Math.max(this.leads().length, 1)) * 100, count ? 8 : 0);
  }

  private refreshDashboard() { this.api.dashboard().subscribe((data) => this.dashboard.set(data)); }
  private finishLogout() { this.authenticated.set(false); this.loginForm.reset({ username: '', password: '' }); }
  private showSuccess(message: string) {
    this.error.set(''); this.success.set(message);
    window.setTimeout(() => this.success.set(''), 3500);
  }
}
