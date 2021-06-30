import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { AdministratorGuard } from './core/guards/administrator.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginGuard } from './core/guards/login.guard';
import { StatusGuard } from './core/guards/status.guard';

// Components
import { LoginComponent } from './shared/components/login/login.component';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';
import { HomeComponent } from './shared/components/home/home.component';
import { NotActivatedComponent } from './shared/components/not-activated/not-activated.component';

const routes: Routes = [{
  path: '',
  component: LoginComponent,
  canActivate: [LoginGuard],
}, {
  path: 'app',
  component: HomeComponent,
  //canActivate: [AuthGuard],
  children: [{
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  }, {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    //canActivate: [AuthGuard, StatusGuard]
  }, {
    path: 'administration',
    loadChildren: () => import('./modules/admin-user/admin-user.module').then(m => m.AdminUserModule),
    //canActivate: [AuthGuard, StatusGuard, AdministratorGuard]
  }, {
    path: 'orders',
    loadChildren: () => import('./modules/orders/orders.module').then(m => m.OrdersModule),
    //canActivate: [AuthGuard, StatusGuard]
  }, {
    path: 'inventory',
    loadChildren: () => import('./modules/inventory/inventory.module').then(m => m.InventoryModule),
    //canActivate: [AuthGuard, StatusGuard]
  }, {
    path: 'snap-package',
    loadChildren: () => import('./modules/snap-package/snap-package.module').then(m => m.SnapPackageModule),
    //canActivate: [AuthGuard, StatusGuard]
  }, {
    path: 'message',
    component: NotActivatedComponent
  }, {
    path: '**',
    component: NotfoundComponent
  }]
}, {
  path: '**',
  redirectTo: '',
  pathMatch: 'full'
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
