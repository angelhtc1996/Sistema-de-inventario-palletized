import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class AdministratorGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Obteniendo los datos de localStorage
    const currentUser = this.authenticationService.getCurrentUser();

    // Validando la información
    if (currentUser.role === 'Administrator') {
      return true;
    } else {
      this.router.navigate(['app']);
      return false;
    }
  }
}
