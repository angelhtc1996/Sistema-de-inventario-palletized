import { Component, Inject, NgZone, PLATFORM_ID, Input, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4plugins_rangeSelector from '@amcharts/amcharts4/plugins/rangeSelector';
import am4ThemeMaterial from '@amcharts/amcharts4/themes/material';
import { Central3plService } from 'src/app/core/services/central3pl.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { IndicatorService } from 'src/app/core/services/indicator.service';
import { translations } from './../../../../assets/langs/translations';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnDestroy {
  private chart: am4charts.XYChart;
  public currentChart: any;
  public showChart = false;
  public customerId = 0;
  public translations: any = translations;
  @Input() chartNumber = 0;
  @Input() chartData: Array<object> = [];
  @Input() shapeGroupField = '';
  @Input() serieName = '';
  @Input() isAdmin = false;
  @Input() customers: object[] = [];
  @Input() dashboardDataNumber = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private ngZone: NgZone,
    private central3plService: Central3plService,
    private helperService: HelperService,
    private indicatorService: IndicatorService) {}

  ngAfterViewInit(): void {
    this.browserOnly(async () => {
      am4core.useTheme(am4ThemeMaterial);
      if (!this.isAdmin) {
        this.showChart = true;
        await this.createChart(this.chartNumber, this.chartData, true);
      }

      // Busco el cliente en la configuración
      const customerNumber = this.indicatorService.getCustomerIdFromLocal(this.dashboardDataNumber);
      if (customerNumber > 0) {
        this.customerId = customerNumber;
        this.showOptionVal(customerNumber);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  public browserOnly(f: () => void): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        f();
      });
    }
  }

  async createChart(chartNumber, chartData, initialCharge: boolean = false): Promise<void> {
    this.currentChart = am4core.create(`chartdiv${chartNumber}`, am4charts.XYChart);
    this.currentChart.data = this.parseDateData(chartData) ;
    this.currentChart.marginRight = 200;
    this.currentChart.dateFormatter.inputDateFormat = 'MM/dd/yy';
    this.currentChart.responsive.enabled = true;
    this.currentChart.colors.list = [
      am4core.color('#fb6808'),
      am4core.color('#f12cff'),
      am4core.color('#b030ff'),
      am4core.color('#d91c5c'),
      am4core.color('#fc5355'),
      am4core.color('#3ef3da')
    ];

    const dateAxis = this.currentChart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.minGridDistance = 20;
    dateAxis.renderer.labels.template.rotation = 90;
    dateAxis.groupData = true;

    const selector = new am4plugins_rangeSelector.DateAxisRangeSelector();
    selector.periods.unshift( { name: '1D', interval: { timeUnit: 'day', count: 1 } } );
    selector.container = document.getElementById(`selectordiv${ chartNumber }`);
    selector.axis = dateAxis;

    const valueAxis = this.currentChart.yAxes.push(new am4charts.ValueAxis());

    // Create series
    const series = this.currentChart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = 'value';
    series.dataFields.dateX = 'date';
    series.tooltipText = '{dateX}: [bold]{valueY}[/]';
    series.stacked = true;
    series.name = this.serieName;

    this.currentChart.cursor = new am4charts.XYCursor();
    this.currentChart.scrollbarX = new am4core.Scrollbar();
  }

  public parseDateData(chartData: Array<any>): any[] {
    const parsedChartData: Array<any> = [];
    chartData.forEach((data) => {
      parsedChartData.push({ date: Date.parse(data.key), value: data.value });
    });
    return parsedChartData.reverse();
  }

  async showOptionVal(event: number): Promise<void> {
    // Guardar el cliente seleccionado
    if (this.customerId !== event) {
      this.indicatorService.setCustomerId(this.dashboardDataNumber, event);
      this.customerId = event;
    }

    // Actualización del mapa
    this.showChart = false;
    if (this.dashboardDataNumber === 1) {
      this.chartData = await this.getDashboardData(event);
    } else {
      this.chartData = await this.helperService.parsingObjectToArray(await this.getDashboardData(event));
    }

    this.showChart = true;
    if (this.currentChart !== undefined) {
      this.currentChart.dispose();
    }
    if (this.chartData.length > 0) {
      await this.createChart(this.chartNumber, this.chartData);
    }
  }

  public getDashboardData(customerId: number): Promise<any> {
    const customer = customerId;
    return new Promise((resolve, reject) => {
      this.central3plService.getDashboardData(this.dashboardDataNumber, customer).subscribe((res: any) => {
        resolve(res.data);
      });
    });
  }
}
