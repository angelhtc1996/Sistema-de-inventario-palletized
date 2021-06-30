import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'dialog-configuration',
  templateUrl: 'dialog-configuration.html',
})
export class DialogConfigurationComponent implements OnInit {
  public availableColumns : any[] = [];
  public defaultColumns : any[] = [];
  public updatedColumns : object[] = [];
  constructor(
    public dialogRef: MatDialogRef<DialogConfigurationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.availableColumns = data.columnsAvailables;
      this.defaultColumns = data.defaultColumns;
      this.availableColumns.forEach((avCol:object) => {
        if(this.defaultColumns.includes(avCol['name'])) avCol['status'] = true;
      });
    }

  ngOnInit(){}

  changeValue(event, index){
    this.availableColumns[index].status = event;
  }
  
  close(): void {
    this.dialogRef.close();
  }

  apply(){
    this.dialogRef.close({defaultColumns: this.updatedColumns, availableColumns: this.availableColumns});
  }

}