import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { BackendStatusService } from '../services/backend-status.service';

/**
 * Watches /api/ traffic and flips BackendStatusService to "down" when the
 * Railway backend is unreachable or restarting (status 0 = connection refused,
 * 502/503/504 = gateway errors during redeploy). A successful response flips
 * us back to "up" so the maintenance banner clears as soon as the backend
 * answers again.
 *
 * The error is still re-thrown so individual call sites keep their existing
 * error handling.
 */
export const backendErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const status = inject(BackendStatusService);
  const isApiCall = req.url.includes('/api/');

  return next(req).pipe(
    tap(event => {
      if (isApiCall && event instanceof HttpResponse) {
        status.markUp();
      }
    }),
    catchError((err: unknown) => {
      if (isApiCall && err instanceof HttpErrorResponse) {
        const isTransport = err.status === 0;
        const isGateway = err.status === 502 || err.status === 503 || err.status === 504;
        if (isTransport || isGateway) {
          status.markDown();
        }
      }
      return throwError(() => err);
    })
  );
};
