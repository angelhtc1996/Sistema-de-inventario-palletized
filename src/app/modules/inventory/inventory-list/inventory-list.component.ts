import { ViewChild, Component, OnInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { Central3plService } from 'src/app/core/services/central3pl.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { TableColumnService } from 'src/app/core/services/table-column.service';
import { DialogConfigurationComponent } from '../dialog/dialog-configuration.component';
import { openDB } from 'idb';
import * as moment from 'moment';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import { AppService } from 'src/app/core/services/app.service';
import { translations } from '../../../../assets/langs/translations.js';
import { InventoryService } from 'src/app/core/services/inventory.service';
import { LoggedDataModel } from 'src/app/shared/models/logged-data.model';

export interface inventoryElement {
  id: number,
  AvailableQty: number,
  Cost: number,
  CustomerIdentifier: object,
  Description2: string,
  FacilityIdentifier: object,
  InventoryUnitOfMeasureIdentifier: object,
  ItemDescription: string,
  ItemIdentifier: object,
  Sku: string;
  LocationIdentifier: object,
  LotNumber: string,
  OnHandQty: number,
  OnHold: boolean,
  OnHoldQty: number,
  PalletIdentifier: object,
  Qualifier: string,
  Quarantined: boolean,
  ReceiveItemId: number,
  ReceivedDate: string,
  ReceivedQty: number,
  ReceiverId: number,
  ReferenceNum: string,
  RowVersion: string,
  SavedElements: object
  SerialNumber: string,
  StockRowVersion: string,
  Upc: string,
  _links: object
};

export interface dataDialog {
  columnsAvailables: object,
  displayedColumns: object
}

const DBSTORENAME = 'PalDB';
const DBOBJECTSTORENAME = 'Inventory-Data';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})
export class InventoryListComponent implements OnInit {
  private db: any;
  private cacheMinutes: number = 5;
  columns = [
    { matColumnDef: 'id', header: 'id', cell: (element: any) => `${element.id}` },
    { matColumnDef: 'AvailableQty', header: 'AvailableQty', cell: (element: any) => `${element.AvailableQty}` },
    { matColumnDef: 'Cost', header: 'Cost', cell: (element: any) => `${element.Cost}` },
    { matColumnDef: 'CustomerIdentifier.Name', header: 'CustomerIdentifier', cell: (element: any) => `${element.CustomerIdentifier.Name}` },
    { matColumnDef: 'Description2', header: 'Description2', cell: (element: any) => `${element.Description2}` },
    { matColumnDef: 'FacilityIdentifier.Name', header: 'Facility Name', cell: (element: any) => `${element.FacilityIdentifier.Name}` },
    { matColumnDef: 'FacilityIdentifier.Id', header: 'Facility Id', cell: (element: any) => `${element.FacilityIdentifier.Id}` },
    { matColumnDef: 'InventoryUnitOfMeasureIdentifier', header: 'InventoryUnitOfMeasureIdentifier', cell: (element: any) => `${element.InventoryUnitOfMeasureIdentifier}` },
    { matColumnDef: 'ItemDescription', header: 'ItemDescription', cell: (element: any) => `${element.ItemDescription}` },
    { matColumnDef: 'ItemIdentifier.Sku', header: 'Sku', cell: (element: any) => `${element.ItemIdentifier.Sku}` },
    { matColumnDef: 'LocationIdentifier', header: 'LocationIdentifier', cell: (element: any) => `${element.LocationIdentifier}` },
    { matColumnDef: 'LotNumber', header: 'LotNumber', cell: (element: any) => `${element.LotNumber}` },
    { matColumnDef: 'OnHandQty', header: 'OnHandQty', cell: (element: any) => `${element.OnHandQty}` },
    { matColumnDef: 'OnHold', header: 'OnHold', cell: (element: any) => `${element.OnHold}` },
    { matColumnDef: 'OnHoldQty', header: 'OnHoldQty', cell: (element: any) => `${element.OnHoldQty}` },
    { matColumnDef: 'PalletIdentifier', header: 'PalletIdentifier', cell: (element: any) => `${element.PalletIdentifier}` },
    { matColumnDef: 'Qualifier', header: 'Qualifier', cell: (element: any) => `${element.Qualifier}` },
    { matColumnDef: 'Quarantined', header: 'Quarantined', cell: (element: any) => `${element.Quarantined}` },
    { matColumnDef: 'ReceiveItemId', header: 'ReceiveItemId', cell: (element: any) => `${element.ReceiveItemId}` },
    { matColumnDef: 'ReceivedDate', header: 'ReceivedDate', cell: (element: any) => `${element.ReceivedDate}` },
    { matColumnDef: 'ReceivedQty', header: 'ReceivedQty', cell: (element: any) => `${element.ReceivedQty}` },
    { matColumnDef: 'ReceiverId', header: 'ReceiverId', cell: (element: any) => `${element.ReceiverId}` },
    { matColumnDef: 'ReferenceNum', header: 'ReferenceNum', cell: (element: any) => `${element.ReferenceNum}` },
    { matColumnDef: 'RowVersion', header: 'RowVersion', cell: (element: any) => `${element.RowVersion}` },
    { matColumnDef: 'SavedElements', header: 'SavedElements', cell: (element: any) => `${element.SavedElements}` },
    { matColumnDef: 'SerialNumber', header: 'SerialNumber', cell: (element: any) => `${element.SerialNumber}` },
    { matColumnDef: 'StockRowVersion', header: 'StockRowVersion', cell: (element: any) => `${element.StockRowVersion}` },
    { matColumnDef: 'Upc', header: 'Upc', cell: (element: any) => `${element.Upc}` },
    { matColumnDef: 'Status', header: 'Status', cell: (element: any) => `${element.Status}` },
  ];
  columnsDefaultWeb = [
    { matColumnDef: 'ItemIdentifier.Sku', header: 'Sku', cell: (element: any) => `${element.ItemIdentifier.Sku}` },
    { matColumnDef: 'ReceiveItemId', header: 'ReceiveItemId', cell: (element: any) => `${element.ReceiveItemId}` },
    { matColumnDef: 'ItemDescription', header: 'ItemDescription', cell: (element: any) => `${element.ItemDescription}` },
    { matColumnDef: 'AvailableQty', header: 'AvailableQty', cell: (element: any) => `${element.AvailableQty}` },
    { matColumnDef: 'Status', header: 'Status', cell: (element: any) => `${element.Status}` },
  ];
  columnsOnMobile = [
    { matColumnDef: 'ItemIdentifier.Sku', header: 'ItemIdentifier.Sku', cell: (element: any) => `${element.ItemIdentifier.Sku}`  },
    { matColumnDef: 'AvailableQty', header: 'AvailableQty', cell: (element: any) => `${element.AvailableQty}`  },
  ];
  public DATA: inventoryElement[] = [];
  public dataSource: any;
  public currentUser: LoggedDataModel;
  public customers: Array<any> = [];
  public selectedOption: string;
  public moduleId: string = "1";
  public displayedColumns: any[] = [];
  public columnsToDisplay : any[] = [];
  public allColumnsAvailables : any[] = [];
  public isRequesting: boolean = false;
  public translate: any = translations;
  isMobile: boolean = false; // For detecting mobile or desktop
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public _central3plService: Central3plService,
    public _autheticationService: AuthenticationService,
    public _tableColumnService: TableColumnService,
    private _inventoryService: InventoryService,
    public dialog: MatDialog,
    public breakpointObserver: BreakpointObserver,
    private appService: AppService) {
    this.dataSource = new TableVirtualScrollDataSource(this.DATA);
    this.currentUser = this._autheticationService.getCurrentUser();
    breakpointObserver.observe([
      Breakpoints.Handset,
    ]).subscribe(result => {
      this.displayedColumns = [];
      if (result.matches) {
        this.isMobile = true;
        this.displayedColumns = this.columnsOnMobile.map(x => x.matColumnDef);
      } else {
        this.isMobile = false;
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.getAllCustomers();

    this.db = (await openDB(DBSTORENAME, 1))
    if (this.currentUser.role != 'Administrator') {
      this.getInventory(this.currentUser.clientId);
      this.dataSource.data.sort((a, b) => { return b.ReceivedDate - a.ReceivedDate });
    } else {
      if (!await this._inventoryService.getLastCustomerSearched()) {
        this.getInventory(1);
      } else {
        this.getInventory(parseInt(await this._inventoryService.getLastCustomerSearched()));
      }
      this.dataSource.data.sort((a, b) => { return b.ReceivedDate - a.ReceivedDate });
    }

    if (!this.isMobile) {
      this._tableColumnService.checkIfConfigApply(this.moduleId, this.currentUser.id).subscribe((res: any) => {
        if (res.result) {
          let [ dataObject ] = res.data;
          let orderColumns = JSON.parse(dataObject.orderColumn).order;
          if (orderColumns) orderColumns.forEach( column => this.displayedColumns.push(column) );
        } else {
          this.displayedColumns = this.columnsDefaultWeb.map(x => x.matColumnDef);
        }
      });

      this._tableColumnService.getNameOfColumns(this.moduleId).subscribe((res:any) => {
        res.data.forEach((value: string) => {
          this.allColumnsAvailables.push({
            name: value,
            status: this.displayedColumns.find((displayedColumn) => displayedColumn == value) == value ? true : false
          });
        });
      });
    }

    this.appService.setTitle('inventory');
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
    this._tableColumnService.setColumnsOrder(this.currentUser.id, this.moduleId, this.displayedColumns).subscribe((res:any) => {});
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getInventory(customerId = null) {
    let id = customerId ? customerId : 'all';

    this.DATA = [];
    this.isRequesting = true;

    this.db.get(DBOBJECTSTORENAME, id).then((data) => {
      if (data && ((Date.now() - data.time) / 60000 < this.cacheMinutes)) {
        this.dataSource.data = data.data;
        this.isRequesting = false;
      } else {
        this._central3plService.getInventory(customerId).subscribe(async (res: any) => {
          res.data.forEach((record, index) => {
            record["id"] = index + 1;
            record["ReceivedDate"] = moment(record["ReceivedDate"]).fromNow();
            record.Sku = record.ItemIdentifier.Sku;
            console.log(record);
            this.DATA.push(record);
          });
          this.dataSource.data = this.DATA;
          this.isRequesting = false;

          await this.db.put(DBOBJECTSTORENAME, {data: this.DATA, time: Date.now()}, id);
        });
      }
    });
  }

  popUpConfiguration(){
    const dialogRef = this.dialog.open(DialogConfigurationComponent, {
      width: '400px',
      height: '500px',
      data: { columnsAvailables: this.allColumnsAvailables, defaultColumns: this.displayedColumns },
      panelClass: 'data-column'
    });
    dialogRef.afterClosed().subscribe((data) => {
      if(data == null) return;
      this.displayedColumns = [];
      data.availableColumns.filter((data) => data.status == true).forEach((filteredData) => {
        this.displayedColumns.push(filteredData.name);
      })
      this._tableColumnService.setColumnsOrder(this.currentUser.id, this.moduleId, this.displayedColumns).subscribe((res:any) => {});
    });
  }

  addColumnToTable(column: string){
    let columnMatch = this.columnsToDisplay.find((displayColumn) => displayColumn == column);
    if(columnMatch == undefined)this.columnsToDisplay.push(column);
  }

  async selectCustomer(event) {
    await this._inventoryService.dropLastCustomerSearched();
    await this._inventoryService.setLastCustomerSearched(event.value);
    this.getInventory(event.value);
  }

  async getAllCustomers() {
    this._central3plService.getCustomers().subscribe(async(res: any) => {
      this.customers = res.data.sort((a, b) => a.CompanyName.localeCompare(b.CompanyName));
      this.selectedOption = !await this._inventoryService.getLastCustomerSearched()? this.customers[0].CustomerId: parseInt(await this._inventoryService.getLastCustomerSearched());
    });
  }
}
