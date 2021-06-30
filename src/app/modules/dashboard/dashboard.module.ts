import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardRoutingModule } from './dashboard.routing';

// Components
import { DashboardComponent } from './dashboard/dashboard.component';
import { IndicatorToggleComponent } from './indicator-toggle/indicator-toggle.component';
import { MapChartComponent } from './map-chart/map-chart.component';
import { GaugeChartComponent } from './gauge-chart/gauge-chart.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { TopChartComponent } from './top-chart/top-chart.component';

@NgModule({
  declarations: [
    DashboardComponent,
    IndicatorToggleComponent,
    MapChartComponent,
    GaugeChartComponent,
    LineChartComponent,
    PieChartComponent,
    TopChartComponent,
  ],
  imports: [
    SharedModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule {}
