import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs/index';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor  {
  constructor(private cacheService: CacheService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Verificando si es el método es diferente a GET
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    // Busco la solicitud actual
    const cachedResponse: HttpResponse<any> = this.cacheService.search(req.url);
    if (cachedResponse) { // Cache
      return of(new HttpResponse(cachedResponse));
    } else { // Servidor
      return next.handle(req).pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            this.cacheService.add(req.url, event);
          }
        })
      );
    }
  }
}
