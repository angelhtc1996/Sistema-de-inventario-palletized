import { Component, Input, OnDestroy, NgZone, PLATFORM_ID, Inject, AfterContentInit } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_usaLow from '@amcharts/amcharts4-geodata/usaLow';
import am4ThemeAnimated from '@amcharts/amcharts4/themes/animated';
import am4ThemeMaterial from '@amcharts/amcharts4/themes/material';
import { Central3plService } from 'src/app/core/services/central3pl.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { IndicatorService } from 'src/app/core/services/indicator.service';
import { translations } from './../../../../assets/langs/translations';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-map-chart',
  templateUrl: './map-chart.component.html',
  styleUrls: ['./map-chart.component.scss']
})
export class MapChartComponent implements OnDestroy, AfterContentInit {
  private currentChart: any;
  private polygonSeries: any;
  public showChart = false;
  public customerId = 0;
  public time = '';
  public messageTime = 'Press a button to get the data';
  public translations: object = translations;
  @Input() chartNumber = 0;
  @Input() chartData: any;
  @Input() isAdmin = false;
  @Input() customers: object[] = [];
  @Input() dashboardDataNumber = 0;

  constructor(
    private central3plService: Central3plService,
    private helperService: HelperService,
    private indicatorService: IndicatorService,
    public ngZone: NgZone,
    @Inject(PLATFORM_ID) public platformId) {}

  async ngAfterContentInit(): Promise<void> {
    this.browserOnly(async () => {
      am4core.useTheme(am4ThemeAnimated);
      am4core.useTheme(am4ThemeMaterial);

      if (!this.isAdmin) { // Cliente
        this.showChart = true;
        await this.createChart(this.chartNumber, await this.processData([{}]));

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
    if (this.currentChart !== undefined) {
      this.currentChart.dispose();
    }
  }

  public browserOnly(f: () => void): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        f();
      });
    }
  }

  async processData(data: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const arrData: any[] = [];
      if (data.length > 0) {
        if (new Date(data[0].key).toDateString() === new Date().toDateString()) {
          Object.keys(data[0].value).forEach((state) => {
            arrData.push({ id: `US-${state}`, value: data[0].value[state]  });
          });
        }
      }
      resolve(arrData);
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
    if (this.currentChart !== undefined) {
      this.currentChart.dispose();
    }
    const dashboardData = await this.getDashboardData(event);
    this.chartData = await this.helperService.parsingObjectToArray(dashboardData);
    this.showChart = true;
    await this.createChart(this.chartNumber, this.chartData);

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
        resolve(res.data);
      });
    });
  }

  async createChart(chartNumber: number, chartData: any): Promise<void> {
    this.currentChart = am4core.create(`mapChart${chartNumber}`, am4maps.MapChart);
    this.currentChart.geodata = am4geodata_usaLow;
    this.currentChart.projection = new am4maps.projections.AlbersUsa();
    this.polygonSeries = this.currentChart.series.push(new am4maps.MapPolygonSeries());
    this.polygonSeries.heatRules.push({
      property: 'fill',
      target: this.polygonSeries.mapPolygons.template,
      min: this.currentChart.colors.getIndex(1).brighten(1),
      max: this.currentChart.colors.getIndex(1).brighten(-0.3)
    });
    this.polygonSeries.useGeodata = true;
    this.polygonSeries.data = await this.processData(chartData);

    // Allow scroll over the map
    this.currentChart.chartContainer.wheelable = false;

    // Set up heat legend
    const heatLegend = this.currentChart.createChild(am4maps.HeatLegend);
    heatLegend.marginTop = am4core.percent(5);
    heatLegend.series = this.polygonSeries;
    heatLegend.align = 'center';
    heatLegend.valign = 'bottom';
    heatLegend.width = am4core.percent(40);
    heatLegend.marginRight = am4core.percent(4);
    heatLegend.minValue = 0;
    heatLegend.maxValue = 1000000;

    // Set up custom heat map legend labels using axis ranges
    const minRange = heatLegend.valueAxis.axisRanges.create();
    minRange.value = heatLegend.minValue;
    minRange.label.text = 'Lower quantity';
    const maxRange = heatLegend.valueAxis.axisRanges.create();
    maxRange.value = heatLegend.maxValue;
    maxRange.label.text = 'Higher quantity';

    // Blank out internal heat legend value axis labels
    heatLegend.valueAxis.renderer.labels.template.adapter.add('text', (labelText: any) => {
      return '';
    });

    // Configure series tooltip
    const polygonTemplate = this.polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = '{name}: {value}';
    polygonTemplate.nonScalingStroke = true;
    polygonTemplate.strokeWidth = 0.5;

    // Create hover state and set alternative fill color
    const hs = polygonTemplate.states.create('hover');
    hs.properties.fill = am4core.color('#3c5bdc');
  }

  async filterDataBy(interval: string): Promise<void> {
    // Guardar el tiempo seleccionado
    this.indicatorService.setTime(this.dashboardDataNumber, interval);
    this.time = interval;

    // Actualización del mapa
    const resampleredData = this.helperService.resampleData(this.chartData, interval);
    if (this.currentChart !== undefined) {
      this.currentChart.dispose();
    }
    await this.createChart(this.chartNumber, [{ key: new Date().toDateString() , value: resampleredData}]);

    // Identificar el filtro establecido
    this.setIdentificatorData(interval);
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
