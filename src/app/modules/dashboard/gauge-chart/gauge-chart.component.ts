import { Component, Inject, NgZone, PLATFORM_ID, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4ThemeMaterial from '@amcharts/amcharts4/themes/material';
import { Central3plService } from 'src/app/core/services/central3pl.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { IndicatorService } from 'src/app/core/services/indicator.service';
import { translations } from './../../../../assets/langs/translations';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.scss']
})
export class GaugeChartComponent implements AfterViewInit, OnDestroy {
  private currentChart: any;
  private currentHand: any;
  public showChart = false;
  public customerId = 0;
  public time = '';
  public messageTime = 'Press a button to get the data';
  public translations: object = translations;
  @Input() chartNumber = 0;
  @Input() chartData: any;
  @Input() isClockGauge = false;
  @Input() isAdmin = false;
  @Input() customers: object[] = [];
  @Input() dashboardDataNumber = 0;
  @Input() toHours = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private ngZone: NgZone,
    private central3plService: Central3plService,
    private helperService: HelperService,
    private indicatorService: IndicatorService) {
    this.currentHand = {
      value: 0
    };
  }

  public browserOnly(f: () => void): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        f();
      });
    }
  }

  ngAfterViewInit(): void {
    this.browserOnly(async () => {
      am4core.useTheme(am4ThemeMaterial);

      if (!this.isAdmin) { // Cliente
        this.showChart = true;

        // Creando el gráfico
        if (this.chartNumber !== 5) {
          await this.createChart(this.chartNumber, [{}]);
        } else {
          await this.createChart(this.chartNumber, this.chartData);
        }

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
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.currentChart !== undefined) {
        this.currentChart.dispose();
      }
    });
  }

  async setMaxValue(chartData: Array<any>, reSample: boolean = false ): Promise<number> {
    return new Promise((resolve, reject) => {
      let result = 0;

      if (Array.isArray(chartData[0])) {
        for (let i = 0; i < chartData.length; i++) {
          if (chartData[i][0]['value'] > result && new Date(chartData[i][0]['key']).toDateString() === new Date().toDateString() ) {
            result = chartData[i][0]['value'];
          }
        }
      } else {
        for (let i = 0; i < chartData.length; i++) {
          // Handle Average orders open date
          if (!chartData[i].hasOwnProperty('value')) {
            let totalItem = Object.keys(chartData[i]).length;
            let addition = 0;
            let average = 0;
            Object.entries(chartData[i]).forEach((arrEntry:any) => {
              if (new Date(arrEntry[0]).toDateString() === new Date().toDateString() && !reSample) {
                addition += (new Date(arrEntry[1]).getHours());
              } else if (reSample) {
                addition += (new Date(arrEntry[1]).getHours());
              }
            });
            average = addition > 0 ? addition / totalItem : average;
            result = average;
          } else {
            // Using by the value getted from parent component take a shape of date
            if (typeof chartData[i]['value'] === 'string' ) {
              if ( new Date(chartData[i]['value']).getHours() > result) {
                result = new Date(chartData[i]['value']).getHours();
              }
            } else {
              if (chartData[i]['value'] > result) {
                result = chartData[i]['value'];
              }
            }
          }
        }
      }
      resolve(result);
    });
  }

  async showOptionVal(event: number): Promise<void> {
    // Guardar el cliente seleccionado
    if (this.customerId !== event) {
      this.indicatorService.setCustomerId(this.dashboardDataNumber, event);
      this.customerId = event;
    }

    // Actualización del mapa
    this.showChart = false;
    const dashboardData = await this.getDashboardData(event);

    this.chartData = dashboardData;
    this.showChart = true;
    if (this.currentChart !== undefined) {
      this.currentChart.dispose();
    }

    if (this.isAdmin) {
      await this.createChart(this.chartNumber, this.chartData);
    } else {
      const data = (Array.isArray(dashboardData) && this.chartNumber !== 5) ? this.chartData : [{}];
      await this.createChart(this.chartNumber, data);
    }

    // Busco el tiempo en la configuración
    const timeString = this.indicatorService.getTimeFromLocal(this.dashboardDataNumber);
    if (timeString !== '') {
      this.filterDataBy(timeString);
    }
  }

  public getDashboardData(customerId: number): Promise<any> {
    const customer = customerId;
    return new Promise((resolve, reject) => {
      this.central3plService.getDashboardData(this.dashboardDataNumber, customer).subscribe((res: any) => {
        resolve([res.data]);
      });
    });
  }

  async filterDataBy(interval: string): Promise<void> {
    // Guardar el tiempo seleccionado
    this.indicatorService.setTime(this.dashboardDataNumber, interval);
    this.time = interval;

    // Actualización del termometro
    let data;
    if (this.isClockGauge && this.isAdmin) {
      data = await this.helperService.parsingObjectToArray(this.chartData[0]);
    } else {
      data = Array.isArray(this.chartData[0]) ? this.chartData[0] : this.chartData;
    }
    const resampleredData: any = this.helperService.resampleData(data, interval, this.isClockGauge);
    this.currentChart.dispose();
    await this.createChart(this.chartNumber, resampleredData.hasOwnProperty('value') ? [{ key: new Date().toDateString(), value: resampleredData.value}] : [resampleredData], true);

    // Identificar el filtro establecido
    this.setIdentificatorData(interval);
  }

  async createChart(chartNumber, chartData, reSample: boolean = false): Promise<void> {
    this.currentChart = am4core.create(`gaugeChart${ chartNumber }`, am4charts.GaugeChart);
    this.currentChart.innerRadius = -15;
    const axis = this.currentChart.xAxes.push(new am4charts.ValueAxis<am4charts.AxisRendererCircular>());
    let handValue = 0;

    // Here we can set the minutes of average order closing time to hours
    if (this.toHours) {
      handValue = await this.setMaxValue(chartData, reSample) / 60;
    } else {
      handValue = await this.setMaxValue(chartData, reSample);
    }

    const label = this.currentChart.radarContainer.createChild(am4core.Label);
    label.isMeasured = false;
    label.fontSize = 45;
    label.x = am4core.percent(50);
    label.y = am4core.percent(100);
    label.horizontalCenter = 'middle';
    label.verticalCenter = 'bottom';
    label.text = Math.trunc(Math.round(handValue));
    axis.min = 0;

    if (!this.isClockGauge) {
      axis.max = handValue === 0 ? 100 : handValue + (handValue * 0.5);
    } else {
      axis.max = 24;
    }

    axis.strictMinMax = true;

    // Estilizando la aguja
    const hand = this.currentChart.hands.push(new am4charts.ClockHand());
    hand.value = handValue;
    hand.fill = am4core.color('black');
    /*this.currentChart.hands.push(new am4charts.ClockHand());
    this.currentChart.fill = am4core.color('#BABABA');
    this.currentChart.value = 0;
    this.currentChart.value += handValue;*/

    // Actualizando el valor de la variable para HTML
    this.currentHand.value = this.currentChart.value;

    const gradient = new am4core.LinearGradient();
    gradient.stops.push({ color: am4core.color('red') });
    gradient.stops.push({ color: am4core.color('yellow') });
    gradient.stops.push({ color: am4core.color('green') });

    axis.renderer.line.stroke = gradient;
    axis.renderer.line.strokeWidth = 15;
    axis.renderer.line.strokeOpacity = 1;
    axis.renderer.grid.template.disabled = true;
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
