import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const withToken = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(withToken).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
       try {
          const u = new URL(req.url, location.origin);
          const isAuthEndpoint = u.pathname.startsWith('/api/auth/');
          if (isAuthEndpoint) {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            router.navigate(['/login']);
          }
        } catch {
          /* sin redirección para endpoints no-auth */
        }

        // Removed redundant mustLogout check and logout logic
      }
      return throwError(() => err);
    })
  );
};
