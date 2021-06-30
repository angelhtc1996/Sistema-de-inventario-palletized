import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/index';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor  {
  constructor(private authenticationService: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get token
    const security = this.authenticationService.getSecurity();
    const token = security?.token;

    // Set Headers
    request = request.clone({
      setHeaders: {
        Accept: 'application/json; charset=utf-8',
        Authorization: `${ token }`,
      },
      body: request.body
    });

    // Next interceptor
    return next.handle(request);
  }
}
