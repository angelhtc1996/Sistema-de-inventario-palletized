import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { LoggedDataModel } from 'src/app/shared/models/logged-data.model';
import { environment } from 'src/environments/environment';
import { IndicatorModel } from '../../shared/models/indicator.model';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class IndicatorService {
  public indicatorsSetting: IndicatorModel[] = [];
  public indicatorsSettingChanged = new EventEmitter<boolean>();

  constructor(
    private http: HttpClient,
    private autheticationService: AuthenticationService) {}

  // Indicators Settings
  public getIndicatorsSettingByDefault(): IndicatorModel[] {
    return [{
      id: 12,
      title: 'Top states shipped to',
      active: true,
      type: 'map',
      customerId: 0,
      time: ''
    }, {
      id: 5,
      title: 'Total open orders',
      active: true,
      type: 'gauge',
      customerId: 0,
      time: ''
    }, {
      id: 6,
      title: 'Average orders open date',
      active: true,
      type: 'gauge',
      customerId: 0,
      time: ''
    }, {
      id: 333,
      title: 'Average line items per order',
      active: false,
      type: 'gauge',
      customerId: 0,
      time: ''
    }, {
      id: 444,
      title: 'Average order closing period of time',
      active: false,
      type: 'gauge',
      customerId: 0,
      time: ''
    }, {
      id: 111,
      title: 'Picks per hour',
      active: false,
      type: 'gauge',
      customerId: 0,
      time: ''
    }, {
      id: 222,
      title: 'Line items picks per hour',
      active: false,
      type: 'gauge',
      customerId: 0,
      time: ''
    }, {
      id: 8,
      title: 'Shipping method',
      active: false,
      type: 'pie graph',
      customerId: 0,
      time: ''
    }, {
      id: 9,
      title: 'Shipping carriers',
      active: true,
      type: 'pie graph',
      customerId: 0,
      time: ''
    }, {
      id: 1,
      title: 'Picks per hour',
      active: false,
      type: 'line graph',
      customerId: 0,
      time: ''
    }, {
      id: 2,
      title: 'Line items picks per hour',
      active: false,
      type: 'line graph',
      customerId: 0,
      time: ''
    }, {
      id: 3,
      title: 'Average line items per order',
      active: false,
      type: 'line graph',
      customerId: 0,
      time: ''
    }, {
      id: 4,
      title: 'Average order closing period of time',
      active: false,
      type: 'line graph',
      customerId: 0,
      time: ''
    }, {
      id: 7,
      title: 'Oldest open order date',
      active: false,
      type: 'top',
      customerId: 0,
      time: ''
    }, {
      id: 10,
      title: 'Hotest item',
      active: true,
      type: 'top',
      customerId: 0,
      time: ''
    }, {
      id: 11,
      title: 'Package usage',
      active: false,
      type: 'top',
      customerId: 0,
      time: ''
    }];
  }

  public getIndicatorsSettingFromLocal(): IndicatorModel[] {
    return JSON.parse(localStorage.getItem('indicators-setting'));
  }

  public setIndicatorsSettingOnLocal(indicatorsSetting: IndicatorModel[]): void {
    localStorage.setItem('indicators-setting', JSON.stringify(indicatorsSetting));
    this.indicatorsSettingChanged.emit(true);
  }

  public getIndicatorsSettingFromServer(): IndicatorModel[] {
    const currentUser: LoggedDataModel = this.autheticationService.getCurrentUser();
    let il: IndicatorModel[] = [];

    this.getToggleConfig(currentUser.id).subscribe((res: any) => {
      if (res.data === null) { // No hay configuracion en el servidor
        il = this.getIndicatorsSettingByDefault();
        this.setIndicatorsSettingOnLocal(il);
        this.setIndicatorsSettingOnServer(il);
      } else { // Si hay configuracion en el servidor
        let toggles = JSON.parse(res.data[0].toggleActives);
        toggles = JSON.parse(toggles.toggle);
        il = toggles;
        this.setIndicatorsSettingOnLocal(il);
      }
    });

    return il;
  }

  public setIndicatorsSettingOnServer(indicatorsSetting: IndicatorModel[]): void {
    const currentUser: LoggedDataModel = this.autheticationService.getCurrentUser();
    const newConfig = JSON.stringify(indicatorsSetting);
    this.setToggleConfig(currentUser.id, newConfig).subscribe((res: any) => {
      console.log(res.message);
    });
  }

  public saveChanges(indicatorsSetting: IndicatorModel[]): void {
    this.setIndicatorsSettingOnLocal(indicatorsSetting);
    this.setIndicatorsSettingOnServer(indicatorsSetting);
  }

  // Filter: CustomerId
  public getCustomerIdFromLocal(indicatorId: number): number {
    const is: IndicatorModel[] = this.getIndicatorsSettingFromLocal();
    let customerId = 0;

    // Busco el cliente seleccionado
    is.map((x: IndicatorModel) => {
      if (x.id === indicatorId) {
        customerId = x.customerId;
      }
    });

    // Devuelvo el id del cliente seleccionado
    return customerId;
  }

  public setCustomerId(indicatorId: number, customerId: number): void {
    const is: IndicatorModel[] = this.getIndicatorsSettingFromLocal();

    // Buscar y actualizar el cliente seleccionado
    is.map((x: IndicatorModel) => {
      if (x.id === indicatorId) {
        x.customerId = customerId;
      }
    });

    // Guardar en local y servidor
    this.saveChanges(is);
  }

  // Filter: Time
  public getTimeFromLocal(indicatorId: number): string {
    const is: IndicatorModel[] = this.getIndicatorsSettingFromLocal();
    let time = '';

    // Busco el tiempo seleccionado
    is.map((x: IndicatorModel) => {
      if (x.id === indicatorId) {
        time = x.time;
      }
    });

    // Devuelvo el tiempo del cliente seleccionado
    return time;
  }

  public setTime(indicatorId: number, time: string): void {
    const is: IndicatorModel[] = this.getIndicatorsSettingFromLocal();

    // Buscar y actualizar el cliente seleccionado
    is.map((x: IndicatorModel) => {
      if (x.id === indicatorId) {
        x.time = time;
      }
    });

    // Guardar en local y servidor
    this.saveChanges(is);
  }

  // Remotes
  public getToggleConfig(userId: number): any {
    return this.http.get(`${ environment.pal_app }/config/indicators/toggle/${ userId }`);
  }

  public setToggleConfig(userId: number, toggles: string): any {
    const myParams = JSON.stringify({ toggle: toggles });
    return this.http.post(`${ environment.pal_app }/config/indicators/toggle/${ userId }`, { params: myParams });
  }
}
