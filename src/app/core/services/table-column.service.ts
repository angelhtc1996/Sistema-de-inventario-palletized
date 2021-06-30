import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable()
export class TableColumnService {
  constructor(private http: HttpClient) {}

  public checkIfConfigApply(moduleId, userId): Observable<any> {
    return this.http.get(`${ environment.pal_app }/config/${ moduleId }/${ userId }`);
  }

  public getNameOfColumns(moduleId): Observable<any> {
    return this.http.get(`${ environment.pal_app }/config/${ moduleId }`);
  }

  public setColumnsConfig(userId, moduleId, columns): Observable<any> {
    const params = JSON.stringify({ columns });
    return this.http.put(`${ environment.pal_app }/config/${ userId }/${ moduleId }`, { params });
  }

  public setColumnsOrder(userId, moduleId, columns): Observable<any> {
    const params = JSON.stringify({ order: columns });
    return this.http.put(`${ environment.pal_app }/config/columns/${ userId }/${ moduleId }`, { params });
  }
}
