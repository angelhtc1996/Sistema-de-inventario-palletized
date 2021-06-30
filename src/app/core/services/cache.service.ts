import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheModel } from 'src/app/shared/models/cache.model';
import * as moment from 'moment';

@Injectable()
export class CacheService {
  public all(): CacheModel[] {
    return JSON.parse( localStorage.getItem('cache') );
  }

  public search(reqUrl: string): HttpResponse<any> | undefined {
    let cache: CacheModel[] = this.all();
    cache = cache ?? [];
    const result = cache.find((e: CacheModel) => e.url.trim() === reqUrl.trim());

    if (result !== undefined && result !== null) {
      // Obtengo las fechas
      const currentDate = moment();
      const createdAt = moment(result.createdAt);

      // Verifico que pasaron los días establecidos
      if (currentDate.diff(createdAt, 'days') >= result.expired) {
        // Se elimina el objeto cacheado
        const newCache = cache.filter((e: CacheModel) => e.url !== reqUrl);
        localStorage.setItem('cache', JSON.stringify( newCache ));

        // Se response
        return undefined;
      } else {
        // Devuelvo el dato guardado
        return result.response;
      }
    } else {
      return undefined;
    }
  }

  public add(reqUrl: string, res: HttpResponse<any>): void {
    // Pregunta sobre la URL
    if ( reqUrl.split('/')[4] === 'customers' ) {
      // Busco la solicitud actual
      const cachedResponse: HttpResponse<any> = this.search(reqUrl);
      if (cachedResponse === undefined) {
        let cache: CacheModel[] = this.all();
        cache = cache ?? [];
        cache.push({
          url: reqUrl,
          response: res,
          createdAt: moment().format('YYYY-MM-DD').toString(),
          expired: 1
        });
        localStorage.setItem('cache', JSON.stringify( cache ));
      } else {
        console.log('Response from cache!');
      }
    }
  }
}
