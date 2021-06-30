import { OverlayContainer} from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { SocialAuthService } from 'angularx-social-login';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { Central3plService } from '../../../core/services/central3pl.service';
import { AppService } from 'src/app/core/services/app.service';
import { onSideNavChange, animateText } from '../../animations/animation';
import { ThemeService } from 'src/app/core/services/theme.service';
import { openDB } from 'idb';
import { translations } from '../../../../assets/langs/translations.js';
import { SidebarService } from 'src/app/core/services/sidebar.service';
import { NotificationElementModel } from '../../models/notification-element.model';
import { LoggedDataModel } from '../../models/logged-data.model';

const DBSTORENAME = 'PalDB';
const DBINDICATORSNAME = 'Indicators-Data';
const DBORDERSNAME = 'Orders-Data';
const DBINVENTORYNAME = 'Inventory-Data';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [onSideNavChange, animateText]
})
export class HomeComponent implements OnInit {
  public themes: string[];
  public notificacions = {} as NotificationElementModel;
  public notificationsRefreshInterval = 120000;  // Every 2 minutes
  public mobileQuery: MediaQueryList;
  public currentUser: LoggedDataModel;
  public events: string[] = [];
  public opened: boolean;
  public title: string;
  // For detecting mobile or desktop
  public isMobile = false;
  public sideNavState = false;
  public linkText = false;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private socialAuthService: SocialAuthService,
    private toastrService: ToastrService,
    private central3plService: Central3plService,
    private overlay: OverlayContainer,
    public breakpointObserver: BreakpointObserver,
    private appService: AppService,
    private sidebarService: SidebarService,
    private themeService: ThemeService) {
    this.currentUser = this.authenticationService.getCurrentUser();
    breakpointObserver.observe([
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isMobile = result.matches ? true : false;
    });
  }

  public toggleTheme(): void {
    if (this.overlay.getContainerElement().classList.contains('dark-theme')) {
      this.overlay.getContainerElement().classList.remove('dark-theme');
      this.overlay.getContainerElement().classList.add('light-theme');
      this.themeService.setDarkTheme(false);
    } else if (this.overlay.getContainerElement().classList.contains('light-theme')) {
      this.overlay.getContainerElement().classList.remove('light-theme');
      this.overlay.getContainerElement().classList.add('dark-theme');
      this.themeService.setDarkTheme(true);
    } else {
      this.overlay.getContainerElement().classList.add('light-theme');
      this.themeService.setDarkTheme(false);
    }
    if (document.body.classList.contains('dark-theme')) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else if (document.body.classList.contains('light-theme')) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }

  async ngOnInit(): Promise<void> {
    await this.initDB();
    if ((this.currentUser.role !== 'Administrator') && (this.currentUser.clientId !== 'unasigned')) {
      this.getNotifications(Number.parseInt(this.currentUser.clientId, 10));
      setInterval(() => {
        if (!this.notificacions.totalResults) {
          this.getNotifications(Number.parseInt(this.currentUser.clientId, 10));
        }
      }, this.notificationsRefreshInterval);
    }
    this.appService.getTitle().subscribe(appTitle => this.title = appTitle);
  }

  public logout(): void {
    // Cierro sesión del usuario
    this.authenticationService.logout();
    this.toastrService.success('', translations.LANG.EN.AUTH.SIGN_OUT);
    this.router.navigateByUrl('');
  }

  public clearNotifications(): void {
    this.notificacions.notificacionList = [];
    this.notificacions.totalResults = 0;
  }

  public getNotifications(customerId: number): void {
    this.central3plService.getNotifications(customerId).subscribe((res: any) => {
      if (Object.keys(res.data).length > 0) {
        this.notificacions.totalResults = res.data.NotificationList.length;
        this.notificacions.notificacionList = res.data.NotificationList;
      }
    });
  }

  public onSinenavToggle(): void {
    this.sideNavState = !this.sideNavState;
    setTimeout(() => this.linkText = this.sideNavState, 200);
    this.sidebarService.sideNavState$.next(this.sideNavState);
  }

  async initDB(): Promise<void> {
    (await openDB(DBSTORENAME, 1, {
      upgrade(db): void {
        db.createObjectStore(DBINDICATORSNAME);
        db.createObjectStore(DBORDERSNAME);
        db.createObjectStore(DBINVENTORYNAME);
      }
    }));
  }
}
