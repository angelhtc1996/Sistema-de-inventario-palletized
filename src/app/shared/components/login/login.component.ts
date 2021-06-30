import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocialAuthService } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { translations } from '../../../../assets/langs/translations.js';
import { SecurityModel } from '../../models/security.model';
import { LoggedDataModel } from '../../models/logged-data.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public isBusy = false;
  public translations: object = translations;

  constructor(
    private socialAuthService: SocialAuthService,
    private authenticationService: AuthenticationService,
    private router: Router,
    public toastrService: ToastrService) {}

  public signInWithGoogle(): void {
    // Habilitar el botón ocupado
    this.isBusy = true;

    // Iniciar sesión con Google
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user: SocialUser) => {
      // Iniciar sesión con backend
      this.authenticationService.login(user).subscribe((res: any): void => {
        // Validando que el usuario viene en la respuesta
        if (res.data.user.length === 1) {
          // Estableciendo la seguridad
          const security: SecurityModel = {
            token: res.data.token,
            exp: res.data.exp,
            iat: res.data.iat
          };

          // Estableciendo el usuario actual
          const currentUser: LoggedDataModel = res.data.user[0];

          // Estableciendo el localStorage
          this.authenticationService.setSecurity(security);
          this.authenticationService.setCurrentUser(currentUser);

          // Borrar las variables anteriores en la sesión
          sessionStorage.removeItem('showError401');
          sessionStorage.removeItem('showError500');

          // Navegar al módulo principal
          this.router.navigate(['app']);
        } else {
          this.authenticationService.logout();
          this.toastrService.error('', translations.LANG.EN.AUTH.ERROR_LOGIN);
        }
      }, (err: any) => {
        this.isBusy = false;
        this.authenticationService.logout();
        this.toastrService.error('', translations.LANG.EN.AUTH.ERROR_LOGIN);
      }, () => this.isBusy = false);
    })
    .catch(() => this.isBusy = false);
  }
}
