import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { translations } from './../../../assets/langs/translations';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private translations: any = translations;

  constructor(
    private toastrService: ToastrService,
    private authenticationService: AuthenticationService,
    private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): any {
    return next.handle(request).pipe(catchError(async (err: HttpErrorResponse) => {
      // Verifico si es timeout
      if (String(err.name) === 'TimeoutError') {
        this.toastrService.error('', this.translations.LANG.EN.SHARED_MSG.ERR_TIMEOUT);
      } else { // Analizando los mensajes de error
        switch (err.status) {
          case 0: // Without connection
            this.toastrService.info('', this.translations.LANG.EN.SHARED_MSG.ERR_0);
            break;
          case 400: // Bad request
            this.toastrService.warning('', this.translations.LANG.EN.SHARED_MSG.ERR_400);
            break;
          case 401: // Unauthorized
            // Bandera para determinar que maneje el error
            const showError401 = JSON.parse(sessionStorage.getItem('showError401'));
            if (!showError401) {
              this.toastrService.info('', this.translations.LANG.EN.SHARED_MSG.ERR_401);
              this.authenticationService.logout(); // Cierro sesión del usuario
              this.router.navigate(['/']);

              // Bandera para determinar que maneje el error
              sessionStorage.setItem('showError401', JSON.stringify(true));
            }
            break;
          case 500: // Internal server error
            if (String(err.error.message).includes('Token used too late')) {
              // Bandera para determinar que maneje el error
              const showError500 = JSON.parse(sessionStorage.getItem('showError500'));
              if (!showError500) {
                this.toastrService.info('', this.translations.LANG.EN.SHARED_MSG.ERR_401);
                this.authenticationService.logout(); // Cierro sesión del usuario
                this.router.navigate(['/']);

                // Bandera para determinar que maneje el error
                sessionStorage.setItem('showError500', JSON.stringify(true));
              }
            } else if (String(err.error.message).includes("TypeError: Cannot read property 'State' of undefined")) {
              this.toastrService.info('', this.translations.LANG.EN.SHARED_MSG.ERR_500_3PL);
            } else {
              this.toastrService.error('', this.translations.LANG.EN.SHARED_MSG.ERR_500);
            }
            break;
        }
      }
    }));
  }
}
