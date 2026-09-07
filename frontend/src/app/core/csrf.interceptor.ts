import { inject } from '@angular/core';
import { HttpBackend, HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { switchMap } from 'rxjs';

// Fetch a session-bound token for each mutation, including after login rotation.
export const csrfInterceptor: HttpInterceptorFn = (request, next) => {
  if (!/^\/api\/(admin|auth)\//.test(request.url) || /^(GET|HEAD|OPTIONS)$/.test(request.method)) {
    return next(request);
  }
  const client = new HttpClient(inject(HttpBackend));
  return client.get<{ headerName: string; token: string }>('/api/auth/csrf', { withCredentials: true }).pipe(
    switchMap(csrf => next(request.clone({
      withCredentials: true,
      setHeaders: { [csrf.headerName]: csrf.token },
    }))),
  );
};
