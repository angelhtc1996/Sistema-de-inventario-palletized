import { Component, OnInit, DoCheck } from '@angular/core';
import { Observable } from 'rxjs';
import { Central3plService } from 'src/app/core/services/central3pl.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { AppService } from 'src/app/core/services/app.service';
import { IndicatorModel } from 'src/app/shared/models/indicator.model';
import { translations } from '../../../../assets/langs/translations.js';
import { openDB } from 'idb';
import { IndicatorService } from 'src/app/core/services/indicator.service';
import { LoggedDataModel } from 'src/app/shared/models/logged-data.model.js';

const DBSTORENAME = 'PalDB';
const DBOBJECTSTORENAME = 'Indicators-Data';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, DoCheck {
  public currentUser: LoggedDataModel;
  public isAdmin: boolean;
  public customers: any[] = [];
  public picksPerHourColumnChartData: any = [];
  public picksPerHourGaugeChartData: any = [];
  public lineItemsPicksPerHourColumnChartData: any = [];
  public lineItemsPicksPerHourGaugeChartData: any = [];
  public averageLineItemsPerOrderColumnChartData: any = [];
  public averageLineItemsPerOrderGaugeChartData: any = [];
  public averageOrderClosingPeriodOfTimeColumnChartData: any = [];
  public averageOrderClosingPeriodOfTimeGaugeChartData: any = [];
  public totalOpenOrders: any = [];
  public averageOpenOrderDate: any = [];
  public shippingMethod: any = [];
  public shippingCarrier: any = [];
  public oldestOpenOrderDate: any = [];
  public topStateShippedTo: any[] = [];
  public packageUsage: any = [];
  public hottesItems: any = {};
  public indicatorsSetting: IndicatorModel[] = [];
  public translate: any = translations;
  private db: any;
  private endOfCachetime: number;
  public isMobile = false;

  constructor(
    public central3plService: Central3plService,
    public helperService: HelperService,
    public autheticationService: AuthenticationService,
    private appService: AppService,
    private indicatorService: IndicatorService) {
    this.currentUser = this.autheticationService.getCurrentUser();
    this.isAdmin = (this.currentUser?.role === 'Administrator');
  }

  async ngOnInit(): Promise<void> {
    this.appService.setTitle('Dashboard');
    await this.initDB();

    // Verificar la configuración de los indicadores
    this.indicatorService.indicatorsSettingChanged.subscribe(() => this.getIndicatorsSetting());
    this.getIndicatorsSetting();
  }

  async ngDoCheck(): Promise<void> {
    if ((/Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )){
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  public dashboardInit(): void {
    if (this.currentUser?.status) {
      this.central3plService.getCustomers().subscribe((res: any) => {
        this.customers = [];
        this.customers.push(JSON.parse('{"CompanyName": "All", "CompanyId": null }'));
        this.customers = this.customers.concat(res.data.sort((a, b) => a.CompanyName.localeCompare(b.CompanyName)));
      });

      if (this.currentUser?.role !== 'Administrator') {
        if (this.showIndicator(1) || this.showIndicator(111)) {
          this.getDashboardData(1, this.currentUser?.clientId).subscribe((data) => {
            this.picksPerHourColumnChartData = data;
            this.picksPerHourGaugeChartData = data;
          });
        }

        if (this.showIndicator(2) || this.showIndicator(222)) {
          this.getDashboardData(2, this.currentUser?.clientId).subscribe(async (data: object) => {
            const parsedData = await this.helperService.parsingObjectToArray(data);
            this.lineItemsPicksPerHourColumnChartData = parsedData;
            this.lineItemsPicksPerHourGaugeChartData = parsedData;
          });
        }

        if (this.showIndicator(3) || this.showIndicator(333)) {
          this.getDashboardData(3, this.currentUser?.clientId).subscribe(async (data: object) => {
            const parsedData = await this.helperService.parsingObjectToArray(data);
            this.averageLineItemsPerOrderColumnChartData = parsedData;
            this.averageLineItemsPerOrderGaugeChartData = parsedData;
          });
        }

        if (this.showIndicator(4) || this.showIndicator(444)) {
          this.getDashboardData(4, this.currentUser?.clientId).subscribe(async (data: object) => {
            const parsedData = await this.helperService.parsingObjectToArray(data);
            this.averageOrderClosingPeriodOfTimeColumnChartData = parsedData;
            this.averageOrderClosingPeriodOfTimeGaugeChartData = parsedData;
          });
        }

        if (this.showIndicator(5)) {
          this.getDashboardData(5, this.currentUser?.clientId).subscribe(async (data: object) => {
            const parsedData = await this.helperService.parsingObjectToArray(data);
            this.totalOpenOrders = parsedData;
          });
        }

        if (this.showIndicator(6)) {
          this.getDashboardData(6, this.currentUser?.clientId).subscribe(async (data: object) => {
            const parsedData: any = await this.helperService.parsingObjectToArray(data);
            this.averageOpenOrderDate = parsedData;
          });
        }

        if (this.showIndicator(7)) {
          this.getDashboardData(7, this.currentUser?.clientId).subscribe(async (data: any[]) => {
            this.oldestOpenOrderDate = data;
          });
        }

        if (this.showIndicator(8)) {
          this.getDashboardData(8, this.currentUser?.clientId).subscribe(async (data: object) => {
            const parsedData = await this.helperService.parsingObjectToArray(data);
            this.shippingMethod = parsedData;
          });
        }

        if (this.showIndicator(9)) {
          this.getDashboardData(9, this.currentUser?.clientId).subscribe(async (data: object) => {
            const parsedData = await this.helperService.parsingObjectToArray(data);
            this.shippingCarrier = parsedData;
          });
        }

        if (this.showIndicator(10)) {
          this.getDashboardData(10, this.currentUser?.clientId).subscribe(async (data: object) => {
            this.hottesItems = data;
          });
        }

        if (this.showIndicator(11)) {
          this.getDashboardData(11, this.currentUser?.clientId).subscribe(async (data: object) => {
            this.packageUsage = data;
          });
        }

        if (this.showIndicator(12)) {
          this.getDashboardData(12, this.currentUser?.clientId).subscribe(async (data: object) => {
            this.topStateShippedTo = await this.helperService.parsingObjectToArray(data);
          });
        }
      }
    }
  }

  public getDashboardData(indicator: number, customerId = null): any {
    return new Observable(subscribe => {
      const id = customerId ? customerId : 'all';
      this.db.get(DBOBJECTSTORENAME, `${id}-${indicator}`).then((data) => {
        if (data && (Date.now() < this.endOfCachetime)) {
          subscribe.next(data);
        } else {
          this.central3plService.getDashboardData(indicator, customerId).subscribe(async (res: any) => {
            subscribe.next(res.data);
            if (indicator !== 5 && indicator !== 7) {
              await this.db.put(DBOBJECTSTORENAME, res.data, `${id}-${indicator}`);
            }
          });
        }
      });
    });
  }

  public getIndicatorsSetting(): void {
    // Buscando la configuración de los indicadores
    this.indicatorsSetting = this.indicatorService.getIndicatorsSettingFromLocal();
    let anyActive = undefined;

    // Buscando los indicadores activos
    if (this.indicatorsSetting !== null) {
      anyActive = this.indicatorsSetting.find(x => x.active);
    }

    // Si existe al menos un indicador activo
    if (anyActive !== undefined) {
      this.dashboardInit();
    }
  }

  public async initDB(): Promise<void> {
    this.db = (await openDB(DBSTORENAME, 1));
    this.endOfCachetime = await this.db.get(DBOBJECTSTORENAME, 'endOfCacheTime');
    if (!this.endOfCachetime) {
      if (this.endOfCachetime > Date.now()) {
        await this.db.clear(DBOBJECTSTORENAME);
      }
      await this.db.put(DBOBJECTSTORENAME, (new Date(Date.now())).setHours(23, 59, 59, 999), 'endOfCacheTime');
    }
  }

  public showIndicator(indicatorId: number): boolean {
    if (this.indicatorsSetting !== null) {
      const indicator: any = this.indicatorsSetting.find(e => e.id === indicatorId);
      return (indicator !== undefined) ? indicator.active : false;
    } else {
      return false;
    }
  }

  public setColumns(rowIndex: number): string {
    const dashboardGrid: Array<Array<boolean>> = [
      [this.showIndicator(5), this.showIndicator(6), this.showIndicator(333)],
      [this.showIndicator(444), this.showIndicator(111), this.showIndicator(222)],
      [this.showIndicator(8), this.showIndicator(9)],
      [this.showIndicator(1), this.showIndicator(2)],
      [this.showIndicator(3), this.showIndicator(4)],
      [this.showIndicator(7), this.showIndicator(10), this.showIndicator(11)],
    ];

    let actCount = 0;
    let colString = '';

    dashboardGrid[rowIndex].forEach((result: boolean) => {
      if (result) {
        actCount += 1;
      }
    });

    switch (actCount) {
      case 1: colString = 'col-lg-12 col-md-12 col-sm-12 p-0'; break;
      case 2: colString = 'col-lg-6 col-md-6 col-sm-12'; break;
      case 3: colString = 'col-lg-4 col-md-4 col-sm-12'; break;
    }

    return colString;
  }
}
