import { Component, Input, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { OrdersElement } from '../orders-list/orders-list.component';


@Component({
  selector: 'app-orders-detail',
  templateUrl: './orders-detail.component.html',
  styleUrls: ['./orders-detail.component.scss']
})
export class OrdersDetailComponent implements OnInit {

  columns = [
    { matColumnDef: "ItemIdentifier.Sku", header: 'SKU' },
    { matColumnDef: "ItemIdentifier.Description", header: 'Description' },
    { matColumnDef: "Qty", header: 'Quantity' },
    // { matColumnDef: "WeightMetric", header: 'Weight' },
  ]

  orderItems : any;

  displayedColumns: string[] = this.columns.map(x => x.matColumnDef);


  @Input() rowData: OrdersElement;
  @Input() sideNav: MatSidenav;

  constructor() { }

  ngOnInit(): void {
    this.columns.forEach((column) => column['cell'] = (element: OrdersElement['OrderItems']) => eval('element.' + column['matColumnDef']))
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }

}
