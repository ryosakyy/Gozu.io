import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.HomePage) },
  { path: 'gestion-interna-gozu', loadComponent: () => import('./pages/admin/admin').then((m) => m.AdminPage) },
  { path: 'demo/:slug', loadComponent: () => import('./pages/demo/demo').then((m) => m.DemoPage) },
  { path: '**', redirectTo: '' },
];
