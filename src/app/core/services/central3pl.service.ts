import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable()
export class Central3plService {
  constructor(private http: HttpClient) {}

  public getCustomers(): Observable<any> {
    return this.http.get(`${ environment.pal_app }/Central3PL/customers`);
  }

  public getInventory(customerId = null): Observable<any> {
    const params = customerId ? new HttpParams().set('customerId', customerId) : {};
    return this.http.get(`${ environment.pal_app }/Central3PL/inventory`, { params });
  }

  public getOrders(customerId = null, rql = null): Observable<any> {
    let params = new HttpParams();
    if (customerId) {
      params = params.set('customerId', customerId);
    }
    if (rql) {
      params = params.set('rql', rql);
    }
    return this.http.get(`${ environment.pal_app }/Central3PL/orders`, { params });
  }

  public getOrderItems(customerId, orderId): Observable<any> {
    let params = new HttpParams().set('orderId', orderId.toString());
    if (customerId) {
      params = params.set('customerId', customerId);
    }
    return this.http.get(`${ environment.pal_app }/Central3PL/itemsummaries`, { params });
  }

  public getNotifications(customerId): Observable<any> {
    const params = customerId ? new HttpParams().set('customerId', customerId) : {};
    return this.http.get(`${ environment.pal_app }/Central3PL/notifications`, { params });
  }

  public getDashboardData(indicator = 1, customerId = null): Observable<any> {
    let params = new HttpParams().set('indicator', indicator.toString());
    if (customerId) {
      params = params.set('customerId', customerId);
    }
    return this.http.get(`${ environment.pal_app }/Central3PL/dashboard/data`, { params });
  }

  public getSnapTracking(tracking = null, customerId = null): Observable<any> {
    let params = new HttpParams().set('tracking', tracking.toString());
    if (customerId) {
      params = params.set('customerId', customerId);
    }
    return this.http.get(`${ environment.pal_app }/Central3PL/snaptracking`, { params });
  }

  public getSnapPicture(tracking = null, customerId = null): Observable<any> {
    let params = new HttpParams().set('tracking', tracking.toString());
    if (customerId) {
      params = params.set('customerId', customerId);
    }
    return this.http.get(`${ environment.pal_app }/Central3PL/snappicture`, { params });
  }
}
