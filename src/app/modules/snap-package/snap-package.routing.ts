import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SnapPackageListComponent } from './snap-package-list/snap-package-list.component';

const routes: Routes = [{
  path: '',
  component: SnapPackageListComponent,
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SnapPackageRoutingModule {}
