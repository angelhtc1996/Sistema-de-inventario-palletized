import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Configs
import { socialNetworkConfig } from './configs/social-network.config';

// Modules
import { SocialLoginModule } from 'angularx-social-login';

// Guards
import { AdministratorGuard } from './guards/administrator.guard';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { StatusGuard } from './guards/status.guard';

// Interceptors
import { RequestInterceptor } from './interceptors/request.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';

// Services
import { AppService } from './services/app.service';
import { AuthenticationService } from './services/authentication.service';
import { CacheService } from './services/cache.service';
import { Central3plService } from './services/central3pl.service';
import { HelperService } from './services/helper.service';
import { IndicatorService } from './services/indicator.service';
import { SidebarService } from './services/sidebar.service';
import { TableColumnService } from './services/table-column.service';
import { ThemeService } from './services/theme.service';
import { UserService } from './services/user.service';
import { InventoryService } from './services/inventory.service';
import { OrdersService } from './services/orders.service';

@NgModule({
  imports: [
    CommonModule,
    SocialLoginModule,
  ],
  providers: [
    { provide: 'SocialAuthServiceConfig', useValue: socialNetworkConfig },
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true },
    AppService,
    AuthenticationService,
    CacheService,
    Central3plService,
    HelperService,
    IndicatorService,
    SidebarService,
    TableColumnService,
    ThemeService,
    UserService,
    InventoryService,
    OrdersService,
    AdministratorGuard,
    AuthGuard,
    StatusGuard,
    LoginGuard,
  ]
})
export class CoreModule {}
