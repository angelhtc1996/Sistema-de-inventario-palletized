import { Injectable } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Obteniendo los datos de localStorage
    const security = this.authenticationService.getSecurity();
    const currentUser = this.authenticationService.getCurrentUser();

    // Validando la información
    if (security?.token && currentUser) {
      this.router.navigate(['app']);
    } else {
      // Cierro sesión del usuario
      this.authenticationService.logout();
    }

    return true;
  }
}
