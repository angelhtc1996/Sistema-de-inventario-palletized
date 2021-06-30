import { Component, Inject, NgZone, PLATFORM_ID, Input, OnDestroy, AfterContentInit } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4ThemeMaterial from '@amcharts/amcharts4/themes/material';
import { isPlatformBrowser } from '@angular/common';
import { HelperService } from 'src/app/core/services/helper.service';
import { Central3plService } from 'src/app/core/services/central3pl.service';
import { IndicatorService } from 'src/app/core/services/indicator.service';
import { translations } from './../../../../assets/langs/translations';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnDestroy, AfterContentInit {
  private chart: am4charts.PieChart;
  public currentChart: any;
  public showChart = false;
  public customerId = 0;
  public time = '';
  public messageTime = 'Press a button to get the data';
  public showSpinner = true;
  public translations: object = translations;
  @Input() chartNumber = 0;
  @Input() chartData: object[] = [];
  @Input() category = '';
  @Input() value = '';
  @Input() isAdmin = false;
  @Input() customers: object[] = [];
  @Input() dashboardDataNumber = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private ngZone: NgZone,
    private helperService: HelperService,
    private central3plService: Central3plService,
    private indicatorService: IndicatorService) {}

  ngAfterContentInit(): void {
    this.browserOnly(async () => {
      am4core.useTheme(am4ThemeMaterial);

      if (!this.isAdmin) { // Cliente
        this.showChart = true;
        this.showSpinner = false;
        await this.createChart(this.chartNumber, await this.fromKeyToArray({}));

        // Busco el tiempo en la configuración
        const timeString = this.indicatorService.getTimeFromLocal(this.dashboardDataNumber);
        if (timeString !== '') {
          this.filterDataBy(timeString);
        }
      } else { // Administrador
        // Busco el cliente en la configuración
        const customerNumber = this.indicatorService.getCustomerIdFromLocal(this.dashboardDataNumber);
        if (customerNumber > 0) {
          this.customerId = customerNumber;
          this.showOptionVal(customerNumber);
        }
      }
    });
  }

  ngOnDestroy(): void {
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

  async fromKeyToArray(arrChartData: object): Promise<object[]>{
    const arr: object[] = [];
    const entries: any[] = Object.entries(arrChartData);
    for (let i = 0; i < entries.length; i++) {
      arr.push({ [this.category]: new String(entries[i][0]).includes('undefined') ? 'Others': entries[i][0], [this.value]: entries[i][1] });
    }
    return arr;
  }

  async showOptionVal(event: number): Promise<void> {
    // Guardar el cliente seleccionado
    if (this.customerId !== event) {
      this.indicatorService.setCustomerId(this.dashboardDataNumber, event);
      this.customerId = event;
    }

    // Actualización de la torta
    this.showChart = false;
    this.showSpinner = true;
    this.chartData = await this.helperService.parsingObjectToArray(await this.getDashboardData(event));
    if (this.chartData.length > 0) {
      this.showChart = true;
      this.showSpinner = false;
      if (this.currentChart !== undefined) {
        this.currentChart.dispose();
      }
      await this.createChart(this.chartNumber, this.chartData);

      // Busco el tiempo en la configuración
      const timeString = this.indicatorService.getTimeFromLocal(this.dashboardDataNumber);
      if (timeString !== '') {
        this.filterDataBy(timeString);
      }
    }
  }

  public getDashboardData(customerId: number): Promise<any>{
    const customer = customerId;
    return new Promise((resolve, reject) => {
      this.central3plService.getDashboardData(this.dashboardDataNumber, customer).subscribe((res: any) => {
        if (res.data === null || res.data === undefined || Object.keys(res.data).length === 0) {
          this.showSpinner = false;
        }
        resolve(res.data);
      });
    });
  }

  async filterDataBy(interval: string): Promise<void> {
    // Guardar el tiempo seleccionado
    this.indicatorService.setTime(this.dashboardDataNumber, interval);
    this.time = interval;

    // Actualización del mapa
    if (this.chartData.length > 0) {
      const resampleredData = this.helperService.resampleData(this.chartData, interval);
      if (this.currentChart !== undefined) {
        this.currentChart.dispose();
      }
      await this.createChart(this.chartNumber, [{ value: resampleredData }]);
    }

    // Identificar el filtro establecido
    this.setIdentificatorData(interval);
  }

  async createChart(chartNumber: number, chartData: any): Promise<void> {
    this.currentChart = am4core.create(`pieChart${chartNumber}`, am4charts.PieChart);

    if (chartData.length === 0) {
      this.currentChart.radius = am4core.percent(90);

      // Dummy innitial data data
      this.currentChart.data = [{
        [this.category]: 'Empty',
        disabled: true,
        [this.value]: 1000,
        color: am4core.color('#dadada'),
        opacity: 0.3,
        strokeDasharray: '4,4',
        tooltip: 'Select a date range clicking on the buttons below, to load the chart'
      }];

      const series = this.currentChart.series.push(new am4charts.PieSeries());
      series.dataFields.value = this.value;
      series.dataFields.category = this.category;
      series.dataFields.hiddenInLegend = 'disabled';

      const slice = series.slices.template;
      slice.propertyFields.fill = 'color';
      slice.propertyFields.fillOpacity = 'opacity';
      slice.propertyFields.stroke = 'color';
      slice.propertyFields.strokeDasharray = 'strokeDasharray';
      slice.propertyFields.tooltipText = 'tooltip';

      series.labels.template.propertyFields.disabled = 'disabled';
      series.ticks.template.propertyFields.disabled = 'disabled';

      series.hiddenState.properties.opacity = 1;
      series.hiddenState.properties.endAngle = -90;
      series.hiddenState.properties.startAngle = -90;
    } else {
      this.currentChart.data = await this.fromKeyToArray(chartData.shift().value);

      const pieSeries = this.currentChart.series.push(new am4charts.PieSeries());
      pieSeries.dataFields.value = this.value;
      pieSeries.dataFields.category = this.category;

      this.currentChart.legend = new am4charts.Legend();
      this.currentChart.responsive.enabled = true;
      this.currentChart.responsive.rules.push({
        relevant: (target: any) => {
          if (target.pixelWidth <= 600) {
            return true;
          }
          return false;
        },
        state: (target: any, stateId: any) => {
          if (target instanceof am4charts.PieSeries) {
            const state = target.states.create(stateId);

            const labelState = target.labels.template.states.create(stateId);
            labelState.properties.disabled = true;

            const tickState = target.ticks.template.states.create(stateId);
            tickState.properties.disabled = true;
            return state;
          }
          return null;
        }
      });
    }
  }

  public setIdentificatorData(interval: string): void {
    if (interval === 'D') {
      this.messageTime = 'Information pertaining to 1 day ago';
    } else if (interval === 'W') {
      this.messageTime = 'Information pertaining to 1 week ago';
    } else if (interval === 'M'){
      this.messageTime = 'Information pertaining to 1 month ago';
    } else {
      this.messageTime = 'Press a button to get the data';
    }
  }
}
