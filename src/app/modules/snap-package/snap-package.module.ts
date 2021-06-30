import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { SnapPackageRoutingModule } from './snap-package.routing';

// Components
import { DialogSnap, SnapPackageListComponent } from './snap-package-list/snap-package-list.component';

@NgModule({
  declarations: [
    SnapPackageListComponent,
    DialogSnap,
  ],
  imports: [
    SharedModule,
    SnapPackageRoutingModule
  ]
})
export class SnapPackageModule {}
