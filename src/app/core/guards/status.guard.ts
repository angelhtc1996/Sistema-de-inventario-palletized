import { Injectable } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable()
export class StatusGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Obteniendo los datos de localStorage
    const currentUser = this.authenticationService.getCurrentUser();

    // Validando la información
    if (currentUser.status === 1 && currentUser.clientId === 'unasigned' && currentUser.role === 'Administrator') {
      return true;
    } else if (currentUser.status === 1 && currentUser.clientId !== 'unasigned') {
      return true;
    } else {
      this.router.navigate(['/app/message']);
      return false;
    }
  }
}
