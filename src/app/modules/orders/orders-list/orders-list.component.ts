import { ViewChild, Component, Inject, OnInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Central3plService } from 'src/app/core/services/central3pl.service';
import { TableColumnService } from 'src/app/core/services/table-column.service';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { FormGroup, FormControl } from '@angular/forms';
import { openDB } from 'idb';
import * as moment from 'moment';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import { MatSidenav } from '@angular/material/sidenav';
import { AppService } from 'src/app/core/services/app.service';
import { translations } from '../../../../assets/langs/translations.js';
import { LoggedDataModel } from 'src/app/shared/models/logged-data.model';
import { OrdersService } from 'src/app/core/services/orders.service';
 
export interface OrdersElement {
  Tracking: string;
  ReferenceNum: string;
  OrderId: number;
  CreationDate: Date;
  CustomerName: string;
  CustomerId: number;
  NumUnits1: number;
  Status: number;
  Weight: number;
  Volume: number;
  OrderItems: any;
  ShipTo: any;
  Description: string;
}
var DATA: OrdersElement[] = [];

enum STATUS {
  OPEN,
  CLOSED,
  CANCELED
}

enum TYPEOFDATE {
  CREATED = '1',
  SHIPPED = '2',
}

const DBSTORENAME = 'PalDB';
const DBOBJECTSTORENAME = 'Orders-Data';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit {
  private db: any;
  private cacheMinutes = 2;
  public columns = [
    { matColumnDef: 'ReferenceNum', header: 'Reference' },
    { matColumnDef: 'Tracking', header: 'Tracking' },
    { matColumnDef: 'CustomerName', header: 'Customer' },
    { matColumnDef: 'CreationDate', header: 'Created Date' },
    { matColumnDef: 'NumUnits1', header: 'Line Items' },
    { matColumnDef: 'Status', header: 'Status' },
  ];
  public columnsOnMobile = [
    { matColumnDef: 'ReferenceNum', header: 'Reference' },
    { matColumnDef: 'Tracking', header: 'Tracking' },
  ];
  displayedColumns: string[] = [];
  dataSource = new TableVirtualScrollDataSource(DATA);
  rowData = {} as OrdersElement;
  currentUser: LoggedDataModel;
  customers: Array<any> = [];
  selectedOption = '';
  allColumnsAvailables: any[] = [];
  moduleId = '0';
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
    type: new FormControl()
  });
  typeOfDate = '1';
  rqlForDate: string;
  selectedCustomer;
  // For detecting mobile or desktop
  isMobile = false;
  isRequesting  = true;
  public translate: any = translations;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('menuTrigger') dateRangeMenu: MatMenuTrigger;
  @ViewChild('sideNav') public sideNav: MatSidenav;

  constructor(
    public _central3plService: Central3plService,
    public _autheticationService : AuthenticationService,
    public _tableColumnService: TableColumnService,
    private _ordersService: OrdersService,
    public dialog: MatDialog,
    public breakpointObserver: BreakpointObserver,
    private appService: AppService    ) {
      breakpointObserver.observe([
        Breakpoints.Handset,
      ]).subscribe(result => {
        this.displayedColumns = [];
        if(result.matches){
          this.isMobile = true;
          this.displayedColumns = this.columnsOnMobile.map(x => x.matColumnDef);
        } else{
          this.isMobile = false;
        }
      });
    }

    async ngOnInit(): Promise<void> {
      this.db = (await openDB(DBSTORENAME, 1))
      this.columns.forEach((column) => column['cell'] = (element: OrdersElement['OrderItems']) => eval('element.' + column['matColumnDef']));
      this.currentUser = this._autheticationService.getCurrentUser();
      this.getAllCustomers();

      let customerId = this.currentUser.role == 'Administrator' ? null : this.currentUser.clientId;
      this.selectedCustomer = customerId;
      if (!this.selectedCustomer) {
        if (await this._ordersService.getLastCustomerSearched() != '') {
          this.getOrders(await this._ordersService.getLastCustomerSearched(), this.rqlForDate);
        }
        this.isRequesting = false;
      } else {
        this.getOrders(customerId);
      }
      if(!this.isMobile) {
        this._tableColumnService.checkIfConfigApply(this.moduleId, this.currentUser.id).subscribe((res:any) => {
          if(res.result){
            let [ dataObject ] = res.data;
            let orderColumns = JSON.parse(dataObject.orderColumn).order;
            if (orderColumns) orderColumns.forEach( column => this.displayedColumns.push(column) );
          } else {
            this.displayedColumns = this.columns.map(x => x.matColumnDef);
          }
        });
        this._tableColumnService.getNameOfColumns(this.moduleId).subscribe((res:any) => {
          res.data.forEach((value:string) => {
            this.allColumnsAvailables.push({name: value, status: this.displayedColumns.find((displayedColumn) => displayedColumn == value) == value ? true : false})
          });
        });
      }
      this.appService.setTitle('orders');
    }

    applyDate() {
      if (!this.dateRange.controls.start.value && !this.dateRange.controls.end.value) {
        this.rqlForDate = null;
      } else {
        switch (this.typeOfDate) {
          case TYPEOFDATE.CREATED:
            if (this.dateRange.controls.end.value) {
              this.rqlForDate = `ReadOnly.CreationDate=ge=${new Date(this.dateRange.controls.start.value).toISOString()};ReadOnly.CreationDate=le=${new Date(this.dateRange.controls.end.value).toISOString()}`;
            }
            else {
              this.rqlForDate = `ReadOnly.CreationDate=ge=${new Date(this.dateRange.controls.start.value).toISOString()}`;
            }
            break;
          case TYPEOFDATE.SHIPPED:
            if (this.dateRange.controls.end.value) {
              this.rqlForDate = `ReadOnly.ProcessDate=ge=${new Date(this.dateRange.controls.start.value).toISOString()};ReadOnly.ProcessDate=le=${new Date(this.dateRange.controls.end.value).toISOString()}`;
            }
            else {
              this.rqlForDate = `ReadOnly.ProcessDate=ge=${new Date(this.dateRange.controls.start.value).toISOString()}`;
            }
            break;
        }
      }
      this.getOrders(this.selectedCustomer, this.rqlForDate);
      this.dateRangeMenu.closeMenu();
    }

    clearDate() {
      this.dateRange.reset();
      this.rqlForDate = null;
      this.getOrders(this.selectedCustomer, this.rqlForDate);
      this.dateRangeMenu.closeMenu();
    }

    ngAfterViewInit() {
      this.dataSource.sort = this.sort;
    }

    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
      this._tableColumnService.setColumnsOrder(this.currentUser.id, this.moduleId, this.displayedColumns).subscribe((res: any) => {});
    }

    getOrders(customerId = null, rql = null) {
      const id = customerId ? customerId : 'all';
      const isDateFilter = rql ? rql.toLowerCase().match('date') ? true : false : false;
      DATA = [];
      this.isRequesting = true;

      this.db.get(DBOBJECTSTORENAME, `${ id }`).then((data) => {
        if (data && ((Date.now() - data.time) / 60000 < this.cacheMinutes) && !isDateFilter) {
          data.data.forEach((record) => {
            // Format Status conditions
            switch (record.Status) {
              case STATUS.OPEN:
                record.Status = 'Processing'
                if (((new Date (Date.now()).getTime() - new Date(record['CreationDate']).getTime()) / 1000 / 3600) > 72) {
                  record.Status = 'Delayed';
                }
                break;
              case STATUS.CLOSED:
                record.Status = 'Shipped';
                break;
              case STATUS.CANCELED:
                record.Status = 'Canceled';
                break;
            }
            record.CreationDate = moment(record.CreationDate).fromNow();
            DATA.push(record);
          });
          this.dataSource.data = DATA;
          this.isRequesting = false;
        }
        else {
          this._central3plService.getOrders(customerId, rql).subscribe(async (res: any) => {
            if (!isDateFilter) {
              await this.db.put(DBOBJECTSTORENAME, {data: res.data, time: Date.now()}, `${id}`);
            }
            res.data.forEach((record) => {
              // Format Status conditions
              switch (record.Status) {
                case STATUS.OPEN:
                  record.Status = 'Processing';
                  if (((new Date (Date.now()).getTime() - new Date(record['CreationDate']).getTime()) / 1000 / 3600) > 72) {
                    record.Status = 'Delayed';
                  }
                  break;
                case STATUS.CLOSED:
                  record.Status = 'Shipped';
                  break;
                case STATUS.CANCELED:
                  record.Status = 'Canceled';
                  break;
              }
              record.CreationDate = moment(record.CreationDate).fromNow();
              DATA.push(record);
            });
            this.dataSource.data = DATA;
            this.isRequesting = false;
          });
        }
      });
    }

    getOrderItems(customerId, orderId) {
      return this._central3plService.getOrderItems(customerId, orderId);
    }

    popUpConfiguration() {
      const dialogRef = this.dialog.open(DialogConfigurationComponentOrders, {
        width: '400px',
        height: '400px',
        panelClass: 'data-column',
        data: { columnsAvailables: this.allColumnsAvailables, defaultColumns: this.displayedColumns }
      });
      dialogRef.afterClosed().subscribe((data) => {
        if (data == null) return;
        this.displayedColumns = [];
        data.availableColumns.filter((data) => data.status == true).forEach((filteredData) => {
          this.displayedColumns.push(filteredData.name);
        });
        this._tableColumnService.setColumnsOrder(this.currentUser.id, this.moduleId, this.displayedColumns).subscribe((res:any) => {});
      });
    }

  async selectCustomer(event) {
    this.selectedCustomer = event.value;
    await this._ordersService.dropLastCustomerSearched();
    await this._ordersService.setLastCustomerSearched(this.selectedCustomer)
    this.getOrders(event.value, this.rqlForDate);
  }

  getRecord(row) {
    console.log(row);
    console.log(DATA);
    this.rowData = row;
    this.getOrderItems(row.CustomerId, row.OrderId).subscribe((res: any) => {
      this.rowData.OrderItems.forEach((orderItems) => {
        orderItems.ItemIdentifier['Description'] = (res.data.find(element => element.SKU === orderItems.ItemIdentifier.Sku)).Description;
      });
    });
    this.sideNav.open();
  }

  // TODO: We should refactor this
  getAllCustomers() {
    this._central3plService.getCustomers().subscribe((res: any) => {
      this.customers = this.customers.concat(res.data.sort((a, b) => a.CompanyName.localeCompare(b.CompanyName)));
    });
  }
}

@Component({
  selector: 'dialog-configuration',
  templateUrl: 'dialog-configuration.html',
})
export class DialogConfigurationComponentOrders implements OnInit {
  public availableColumns : any[] = [];
  public defaultColumns : any[] = [];
  public updatedColumns : object[] = [];
  constructor(
    public dialogRef: MatDialogRef<DialogConfigurationComponentOrders>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.availableColumns = data.columnsAvailables;
      this.defaultColumns = data.defaultColumns;
    }

  ngOnInit(){}

  changeValue(event, index){
    this.availableColumns[index].status = event;
  }

  close(): void {
    this.dialogRef.close();
  }

  apply() {
    this.dialogRef.close({defaultColumns: this.updatedColumns, availableColumns: this.availableColumns});
  }
}
