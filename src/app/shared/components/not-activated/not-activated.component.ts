import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { LoggedDataModel } from '../../models/logged-data.model';
import { translations } from '../../../../assets/langs/translations.js';

@Component({
  selector: 'app-not-activated',
  templateUrl: './not-activated.component.html',
  styleUrls: ['./not-activated.component.scss']
})
export class NotActivatedComponent implements OnInit {
  public currentUser: LoggedDataModel;
  public translate: any = translations;

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.currentUser = this.authenticationService.getCurrentUser();
  }
}
