import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs/index';

@Injectable()
export class AppService {
  private title = new BehaviorSubject<string>('Dashboard');
  private title$ = this.title.asObservable();

  public setTitle(title: string): void {
    this.title.next(title);
  }

  public getTitle(): Observable<string> {
    return this.title$;
  }
}
