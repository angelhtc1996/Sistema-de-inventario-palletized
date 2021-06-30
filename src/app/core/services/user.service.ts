import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable()
export class UserService {
  constructor(private http: HttpClient) {}

  public getAllUsers(): Observable<any> {
    return this.http.get(`${ environment.pal_app }/users`);
  }

  public updateStatusUser(id, status): Observable<any> {
    return this.http.put(`${ environment.pal_app }/users/${ id }`, { status });
  }

  public assignClientId(clientId, userId, companyName): Observable<any> {
    return this.http.put(`${ environment.pal_app }/users/${ companyName }/${ clientId }/${ userId }`, null);
  }

  public changeRoleUser(userId, newRole): Observable<any> {
    return this.http.put(`${ environment.pal_app }/users/${ newRole }/${ userId }`, null);
  }
}
