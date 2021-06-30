import { Component, OnInit, NgZone, Input } from '@angular/core';
import { HelperService } from 'src/app/core/services/helper.service';
import { Central3plService } from 'src/app/core/services/central3pl.service';
import { IndicatorService } from 'src/app/core/services/indicator.service';
import { translations } from './../../../../assets/langs/translations';
@Component({
  selector: 'app-top-chart',
  templateUrl: './top-chart.component.html',
  styleUrls: ['./top-chart.component.scss']
})
export class TopChartComponent implements OnInit {
  @Input() chartNumber = 0;
  @Input() chartData: Array<object> = [];
  @Input() category = 'Category';
  @Input() value = 'Value';
  @Input() auxiliarKey = '';
  @Input() customers: any[] = [];
  @Input() dashboardDataNumber = 0;
  @Input() isAdmin = false;
  @Input() isTopFive = false;
  public columns: string[] = [];
  public values: any[] = [];
  public showChart = false;
  public customerId = 0;
  public translations: object = translations;

  constructor(
    private ngZone: NgZone,
    private helperService: HelperService,
    private central3plService: Central3plService,
    private indicatorService: IndicatorService) {}

  async ngOnInit(): Promise<void> {
    if (!this.isAdmin) {
      if (this.isTopFive) {
        await this.getKeysChartData(this.chartData, this.isTopFive);
        await this.setIndex(this.chartData, this.isTopFive);
      } else {
        await this.getKeysChartData(this.chartData);
        await this.setIndex(this.chartData);
      }
    }

    // Busco el cliente en la configuración
    const customerNumber = this.indicatorService.getCustomerIdFromLocal(this.dashboardDataNumber);
    if (customerNumber > 0) {
      this.customerId = customerNumber;
      this.showOptionVal(customerNumber);
    }
  }

  async getKeysChartData(chartData, isTopFive = false): Promise<void> {
    if (isTopFive) {
    this.columns.push('#');
    if (Array.isArray(chartData) && chartData.length > 0) {
      Object.keys(chartData[0]).forEach((key) => {
        this.columns.push( key);
      });
    } else {
      this.columns.push(this.category);
      this.columns.push(this.value);
    }
    let [a, b, c] = this.columns;
    this.columns[1] = c;
    this.columns[2] = b;
    } else {
      this.columns.push('#');
      this.columns.push(this.category);
      this.columns.push(this.value);
    }
  }

  async setIndex(chartData, isTopFive = false): Promise<void> {
    if (!Array.isArray(chartData)) {
      chartData = await this.helperService.parsingObjectToArray(chartData);
    }

    if (isTopFive) {
      if (chartData.length > 0 && chartData[0].hasOwnProperty('value')) {
        chartData.forEach((objData: any, indexObj: any) => {
          if (indexObj <= 9){
            Object.entries(objData.value).forEach((entry, i) => {
              for (let k = 0; k < entry.length; k++) {
                const obj = {};
                obj[i + 1] = i + 1;
                this.values.push(Object.assign(entry[k], obj));
              }
            });
          }
        });
      } else {
        chartData.forEach((data: any, i: any) => {
          if (i + 1 <= 5) {
            const obj = {};
            obj[i + 1] = i + 1;
            this.values.push(Object.assign(data, obj));
          }
        });
      }
    } else {
      const sortedArrEntries = await this.sortObjEntries(chartData[0].value);
      sortedArrEntries.forEach((entries: any, i: any) => {
        if (i + 1 <= 10) {
          const objData = {};
          objData[i + 1] = i + 1;
          objData[this.category] = entries[0];
          objData[this.value] = entries[1];
          this.values.push(objData);
        }
      });
    }
  }

  async showOptionVal(event: number): Promise<void> {
    // Guardar el cliente seleccionado
    if (this.customerId !== event) {
      this.indicatorService.setCustomerId(this.dashboardDataNumber, event);
      this.customerId = event;
    }

    // Actualización de los datos
    const dashboardData = await this.getDashboardData(event);
    this.showChart = false;
    if (this.isTopFive) {
      this.chartData = dashboardData;
      this.values = [];
      this.columns = [];
      await this.getKeysChartData(this.chartData, this.isTopFive);
      await this.setIndex(this.chartData, this.isTopFive);
      this.showChart = true;
    } else {
      this.ngZone.run( async () => {
        const sortedData = dashboardData.sort((a: any,b: any) => {
          return new Date(a.CreationDate).getTime() - new Date(b.CreationDate).getTime();
        });
        this.chartData = sortedData;
        this.values = [];
        this.columns = [];
        await this.getKeysChartData(this.chartData, this.isTopFive);
        await this.setIndex(this.chartData, this.isTopFive);
        this.showChart = true;
      });
    }
  }

  public getDashboardData(customerId: number): Promise<any> {
    const customer = customerId;
    return new Promise((resolve, reject) => {
      this.central3plService.getDashboardData(this.dashboardDataNumber, customer).subscribe(async (res: any) => {
        resolve(this.isTopFive ? res.data : await this.helperService.parsingObjectToArray(res.data));
      });
    });
  }

  public sortObjEntries(objTarget: object): Promise<any[]> {
    return new Promise((resolve, reject) => {
      resolve(Object.entries(objTarget).sort((a, b) => b[1] - a[1]));
    });
  }
}
