import { ViewChild, Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import { AppService } from 'src/app/core/services/app.service';
import * as moment from 'moment';
import { Central3plService } from 'src/app/core/services/central3pl.service';
import { translations } from 'src/assets/langs/translations.js';
import { LoggedDataModel } from 'src/app/shared/models/logged-data.model';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

export interface SnapElement {
  tracking: string;
  created: Date;
  picture: any;
}

let DATA: SnapElement[] = [];

@Component({
  selector: 'app-snap-package-list',
  templateUrl: './snap-package-list.component.html',
  styleUrls: ['./snap-package-list.component.scss']
})
export class SnapPackageListComponent implements OnInit, AfterViewInit {
  public columns = [
    { matColumnDef: 'tracking', header: 'Tracking' },
    { matColumnDef: 'created', header: 'Created Date' },
  ];
  public displayedColumns: string[] = this.columns.map(x => x.matColumnDef);
  public dataSource = new TableVirtualScrollDataSource(DATA);
  public currentUser: LoggedDataModel;
  public image: any;
  public translations: any = translations;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public central3plService: Central3plService,
    public autheticationService: AuthenticationService,
    public dialog: MatDialog,
    private appService: AppService,
    private domSanitizer: DomSanitizer,
    private toastrService: ToastrService) {}

  ngOnInit(): void {
    this.currentUser = this.autheticationService.getCurrentUser();
    this.appService.setTitle('Snap package');
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    DATA = [];
    if (filterValue.length > 3) {
      const customerId = this.currentUser.role === 'Administrator' ? null : this.currentUser;
      this.central3plService.getSnapTracking(filterValue, customerId).subscribe((res: any) => {
        res.data.forEach((record) => {
          record.created = moment(record.created).fromNow();
          DATA.push(record);
        });
        this.dataSource.data = DATA;
      });
    } else {
      this.dataSource.data = DATA;
    }
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }

  getRecord(row): void {
    this.central3plService.getSnapPicture(row.tracking).subscribe((res: any) => {
      if (res.result) {
        row.picture = this.domSanitizer.bypassSecurityTrustUrl(res.data);
      } else {
        row.picture = 'assets/images/not-image.png';

        // Mostrar mensaje
        let messageToShow = '';
        if (res.type === 'NOT_FOUND') {
          messageToShow = translations.LANG.EN.SNAP_PACKAGE.NOT_FOUND_IMAGE;
          this.toastrService.warning('', messageToShow);
        } else if (res.type === 'ERROR') {
          messageToShow = translations.LANG.EN.SNAP_PACKAGE.ERROR_SEARCH_IMAGE;
          this.toastrService.error('', messageToShow);
        }
      }
    });
    this.openDialog(row);
  }

  openDialog(row): void {
    this.dialog.open(DialogSnap, {
      width: '100%',
      data: row,
      panelClass: 'snap-modal'
    });
  }
}

@Component({
  selector: 'dialog-snap',
  templateUrl: './dialog-snap.html',
  styleUrls: ['./snap-package-list.component.scss']
})
export class DialogSnap {
  constructor(
    public dialogRef: MatDialogRef<DialogSnap>,
    @Inject(MAT_DIALOG_DATA) public data: SnapElement) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
