import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { OrdersRoutingModule } from './orders.routing';

// Components
import { DialogConfigurationComponentOrders, OrdersListComponent } from './orders-list/orders-list.component';
import { OrdersDetailComponent } from './orders-detail/orders-detail.component';

@NgModule({
  declarations: [
    OrdersListComponent,
    DialogConfigurationComponentOrders,
    OrdersDetailComponent
  ],
  imports: [
    SharedModule,
    OrdersRoutingModule
  ]
})
export class OrdersModule {}
