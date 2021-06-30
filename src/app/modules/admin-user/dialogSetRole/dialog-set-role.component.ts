import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'dialog-set-role',
    styleUrls: ['./dialog-set-role.scss'],
    templateUrl: 'dialog-set-role.html',
    encapsulation: ViewEncapsulation.None
  })
  export class DialogSetRoleComponent {
    public dialogForm: FormGroup;
    public roles : string[] = ['Administrator', 'client'];
    constructor(
      public dialogRef: MatDialogRef<DialogSetRoleComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      public _formBuilder: FormBuilder
    ) {
        this.dialogForm = this._formBuilder.group({
            role: new FormControl('', Validators.required)
        });
    }

    onSetClick(): void {
        let dialogFormValue = this.dialogForm.getRawValue();
        if (this.data.row.role != dialogFormValue.role && this.dialogForm.valid ) {
            this.dialogRef.close({ settedRole: dialogFormValue.role });
        }
    }

      onCancelClick(): void {
        this.dialogRef.close();
      }

  }
