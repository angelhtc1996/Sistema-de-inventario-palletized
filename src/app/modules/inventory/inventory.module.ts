import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { InventoryRoutingModule } from './inventory.routing';

// Components
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { DialogConfigurationComponent } from './dialog/dialog-configuration.component';

@NgModule({
  declarations: [
    InventoryListComponent,
    DialogConfigurationComponent
  ],
  imports: [
    SharedModule,
    InventoryRoutingModule,
  ]
})
export class InventoryModule {}
