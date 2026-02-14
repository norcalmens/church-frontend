import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * In production (Hostinger), relative /api/ requests would hit the static server
 * and return index.html instead of reaching the Railway backend. This interceptor
 * prepends the Railway backend URL to any relative /api/ request in production builds.
 *
 * In dev, the Angular proxy handles /api/ routing, so no transformation is needed.
 */
export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.production && req.url.startsWith('/api/')) {
    const apiReq = req.clone({
      url: `${environment.apiUrl}${req.url}`
    });
    return next(apiReq);
  }

  return next(req);
};
