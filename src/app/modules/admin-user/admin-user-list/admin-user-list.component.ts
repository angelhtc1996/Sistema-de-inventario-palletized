import { ViewChild, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { UserService } from 'src/app/core/services/user.service';
import { Central3plService } from 'src/app/core/services/central3pl.service';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogSetRoleComponent } from '../dialogSetRole/dialog-set-role.component';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import { AppService } from 'src/app/core/services/app.service';
import { translations } from '../../../../assets/langs/translations.js';
import { LoggedDataModel } from 'src/app/shared/models/logged-data.model';

export interface UsersElement {
  id: number;
  clientId: number;
  companyName: string;
  name: string;
  email: string;
  role: string;
  status: number;
}

let ELEMENT_DATA: UsersElement[] = [];

enum STATUS {
  BLOCKED = -1,
  INACTIVE,
  ACTIVE
}

@Component({
  selector: 'app-admin-user-list',
  templateUrl: './admin-user-list.component.html',
  styleUrls: ['./admin-user-list.component.scss']
})
export class AdminUserListComponent implements OnInit {
  displayedColumns: string[] = ['clientId', 'companyName', 'name', 'email', 'role', 'status', 'actions'];
  dataSource = new TableVirtualScrollDataSource(ELEMENT_DATA);
  allowViewUser = false;
  customers: Array<any> = [];
  public currentUser: LoggedDataModel;
  public translations: any = translations;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public dialog: MatDialog,
    public userService: UserService,
    public autheticationService: AuthenticationService,
    public central3plService: Central3plService,
    public toastrService: ToastrService,
    private appService: AppService) {
    this.currentUser = this.autheticationService.getCurrentUser();
  }

  ngOnInit(): void {
    this.getAllUsers();
    this.getAllCustomers();
    this.appService.setTitle('Administration');
  }


  getAllUsers() {
    ELEMENT_DATA = [];
    this.userService.getAllUsers().subscribe((res: any) => {
      res.data.forEach((user) => {
        ELEMENT_DATA.push(user);
      });
      this.dataSource.data = ELEMENT_DATA;
      this.allowViewUser = true;
    });
  }

  changeRole(id, role){
    return new Observable((observer) => {
      this.userService.changeRoleUser(id, role).subscribe((res:any) => {
        observer.next(res);
      }, (error) => {
        observer.error(error);
      });
    });
  }

  updateStatusUser(id, status) {
    return new Observable((observer) => {
      this.userService.updateStatusUser(id, status).subscribe((res: any) => {
        observer.next(res);
      }, (error) => {
        observer.error(error);
      });
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onClickActivate(row) {
    const index = this.dataSource.data.findIndex(users => users.id === row.id);

    if ((this.dataSource.data[index].status === STATUS.INACTIVE) || (this.dataSource.data[index].status === STATUS.BLOCKED)) {
      this.updateStatusUser(row.id, STATUS.ACTIVE).subscribe((res: any) => {
        this.toastrService.success('', res.message);
        this.dataSource.data[index].status = STATUS.ACTIVE;
      }, (e: HttpErrorResponse) => {
        this.toastrService.error('', e.error.message);
      });
    }
    else if (this.dataSource.data[index].status === STATUS.ACTIVE) {
      this.updateStatusUser(row.id, STATUS.INACTIVE).subscribe((res: any) => {
        this.toastrService.success('', res.message);
        this.dataSource.data[index].status = STATUS.INACTIVE;
      }, (e: HttpErrorResponse) => {
        this.toastrService.error('', e.error.message);
      });
    }
  }

  onClickAssignID(row) {
    const index = this.dataSource.data.findIndex(users => users.id === row.id);

    const dialogRef = this.dialog.open(DialogAssignID, {
      data: {
        row: row,
        customers: this.customers,
      },
      panelClass: 'data-column'
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      this.userService.assignClientId(result.customerData.CustomerId, row.id, result.customerData.CompanyName).subscribe((res: any) => {
        this.toastrService.success('', res.message);
        this.dataSource.data[index].clientId = result.customerData.CustomerId;
        this.dataSource.data[index].companyName = result.customerData.CompanyName;
      }, (e: HttpErrorResponse) => {
        this.toastrService.error('', e.error.message);
      });
    });
  }

  onClickBlock(row) {
    const index = this.dataSource.data.findIndex(users => users.id === row.id);
    this.updateStatusUser(row.id, STATUS.BLOCKED).subscribe((res: any) => {
      this.toastrService.success('', res.message);
      this.dataSource.data[index].status = STATUS.BLOCKED;
    }, (e: HttpErrorResponse) => {
      console.log(e);
      this.toastrService.error('', e.error.message);
    });
  }

  getAllCustomers() {
    this.central3plService.getCustomers().subscribe((res: any) => {
      this.customers = res.data.sort((a, b) => a.CompanyName.localeCompare(b.CompanyName));
    });
  }

  setAsRole(row){
    const dialogRef = this.dialog.open(DialogSetRoleComponent, {
      data: {
        row: row
      },
      height: '200px',
      width: '400px',
      panelClass: 'data-column'
    });

    dialogRef.afterClosed().subscribe((result) => {
      const { settedRole } = result;
      const index = this.dataSource.data.findIndex(user => user.id === row.id);
      this.changeRole(row.id, settedRole).subscribe((res: any) => {
        this.toastrService.success('', res.message);
        this.dataSource.data[index].role = settedRole;
      }, (e: HttpErrorResponse) => {
        this.toastrService.error('', e.error.message);
      });
    });
  }
}

@Component({
  selector: 'dialog-assign-id',
  templateUrl: 'dialog-assign-id.html',
  encapsulation: ViewEncapsulation.None
})
export class DialogAssignID {
  public dialogForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogAssignID>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public formBuilder: FormBuilder) {
    this.dialogForm = this.formBuilder.group({
      customerId: new FormControl('', Validators.required)
    });
  }

  onAssignClick(): void {
    if (this.dialogForm.valid) {
      const dialogFormData = this.dialogForm.getRawValue();
      const customerFinded = this.data.customers.find(customer => customer.CustomerId === dialogFormData.customerId);
      this.dialogRef.close({ customerData: customerFinded });
    }
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
