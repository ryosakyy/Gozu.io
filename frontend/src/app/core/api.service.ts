import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Client, Dashboard, FinanceTransaction, Lead, ProjectShowcase, ServiceOffering } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = '/api';
  constructor(private http: HttpClient) {}
  private adminOptions() { return { withCredentials: true }; }
  login(username: string, password: string): Observable<void> {
    const body = new HttpParams().set('username', username).set('password', password);
    return this.http.post<void>(`${this.baseUrl}/auth/login`, body.toString(), {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }), withCredentials: true,
    });
  }
  logout(): Observable<void> { return this.http.post<void>(`${this.baseUrl}/auth/logout`, {}, this.adminOptions()); }
  publicServices(): Observable<ServiceOffering[]> { return this.http.get<ServiceOffering[]>(`${this.baseUrl}/public/services`); }
  publicProjects(): Observable<ProjectShowcase[]> { return this.http.get<ProjectShowcase[]>(`${this.baseUrl}/public/projects`); }
  createLead(lead: Lead): Observable<Lead> { return this.http.post<Lead>(`${this.baseUrl}/public/leads`, lead); }
  trackDemo(slug: string): Observable<void> { return this.http.post<void>(`${this.baseUrl}/public/demo-views/${slug}`, {}); }
  trackSiteEvent(type: 'PAGE_VIEW' | 'CTA_CLICK' | 'PLAN_SELECT' | 'WHATSAPP_CLICK', label: string, path = window.location.pathname): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/public/events`, { type, label, path });
  }
  dashboard(): Observable<Dashboard> { return this.http.get<Dashboard>(`${this.baseUrl}/admin/dashboard`, this.adminOptions()); }
  leads(): Observable<Lead[]> { return this.http.get<Lead[]>(`${this.baseUrl}/admin/leads`, this.adminOptions()); }
  updateLead(id: number, status: string): Observable<Lead> { return this.http.patch<Lead>(`${this.baseUrl}/admin/leads/${id}/status`, { status }, this.adminOptions()); }
  clients(): Observable<Client[]> { return this.http.get<Client[]>(`${this.baseUrl}/admin/clients`, this.adminOptions()); }
  createClient(client: Client): Observable<Client> { return this.http.post<Client>(`${this.baseUrl}/admin/clients`, client, this.adminOptions()); }
  adminServices(): Observable<ServiceOffering[]> { return this.http.get<ServiceOffering[]>(`${this.baseUrl}/admin/services`, this.adminOptions()); }
  createService(service: ServiceOffering): Observable<ServiceOffering> { return this.http.post<ServiceOffering>(`${this.baseUrl}/admin/services`, service, this.adminOptions()); }
  transactions(): Observable<FinanceTransaction[]> { return this.http.get<FinanceTransaction[]>(`${this.baseUrl}/admin/transactions`, this.adminOptions()); }
  createTransaction(tx: FinanceTransaction): Observable<FinanceTransaction> { return this.http.post<FinanceTransaction>(`${this.baseUrl}/admin/transactions`, tx, this.adminOptions()); }
}
