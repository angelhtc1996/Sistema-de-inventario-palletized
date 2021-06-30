import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';
import { timeout } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): any {
    const timeoutValueNumeric = Number(environment.timeout);
    return next.handle(request).pipe(timeout(timeoutValueNumeric));
  }
}
