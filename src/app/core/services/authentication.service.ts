import { Injectable } from '@angular/core';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { environment  } from '../../../environments/environment';
import { LoggedDataModel } from 'src/app/shared/models/logged-data.model';
import { Observable } from 'rxjs';
import { SecurityModel } from 'src/app/shared/models/security.model';

@Injectable()
export class AuthenticationService {
  constructor(
    private http: HttpClient,
    private socialAuthService: SocialAuthService) {}

  public getCurrentUser(): LoggedDataModel {
    return JSON.parse(localStorage.getItem('user'));
  }

  public setCurrentUser(user: LoggedDataModel): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getSecurity(): SecurityModel {
    return JSON.parse(localStorage.getItem('security'));
  }

  public setSecurity(security: SecurityModel): void {
    localStorage.setItem('security', JSON.stringify(security));
  }

  public login(User: SocialUser): Observable<any> {
    return this.http.post(`${ environment.pal_app }/login`, { User });
  }

  public logout(): void {
    // Limpiando localStorage
    localStorage.removeItem('security');
    localStorage.removeItem('user');

    // Cerrar sesión en Google
    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user) {
        this.socialAuthService.signOut();
      }
    });
  }
}
