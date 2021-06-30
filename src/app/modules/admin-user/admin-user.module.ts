import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminUserRoutingModule } from './admin-user.routing';

// Components
import { AdminUserListComponent, DialogAssignID } from './admin-user-list/admin-user-list.component';
import { DialogSetRoleComponent } from './dialogSetRole/dialog-set-role.component';

@NgModule({
  declarations: [
    AdminUserListComponent,
    DialogSetRoleComponent,
    DialogAssignID
  ],
  imports: [
    SharedModule,
    AdminUserRoutingModule
  ]
})
export class AdminUserModule {}
