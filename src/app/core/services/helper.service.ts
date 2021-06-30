import { Injectable } from '@angular/core';
import * as underscore from 'underscore';

@Injectable()
export class HelperService {
  public groupBy(data: object) {
    return underscore.groupBy(data);
  }

  public parsingObjectToArray(objectToParse: object) : Promise<object[]>{
    return new Promise((resolve, reject) => {
      let arrayResult: Array<object> = [];
      Object.keys(objectToParse).forEach((key) => {
        let objectToPush = {};
        objectToPush["key"] = key;
        objectToPush["value"] = objectToParse[key];
        arrayResult.push(objectToPush);
      });
      resolve(arrayResult);
    });
  }

  public getTimeAverage(array: Array<object>) : Promise<object[]> {
    return new Promise((resolve, reject) => {
      let result : any = [];
      let accumulateHour : number = 0;
      let arrayLength = array.length;
      array.forEach((date:any) => {
        accumulateHour += new Date(date.value).getHours();
      })
      result.push({ value: accumulateHour / arrayLength});
      resolve(result);
    });
  }

  public resampleData(data, interval = 'D', calcAvgHour = false) {
    let filterData: any[] = [];
    let processedData = {};

    switch (interval) {
      case 'D':
        if (!calcAvgHour && data[0].hasOwnProperty('value')) {
          filterData = data.filter((entry:any) =>  new Date(entry.key).getTime() > (new Date(Date.now())).setUTCHours(-24,0,0,-1) && new Date(entry.key).getTime() <  (new Date(Date.now())).setUTCHours(0,0,0,-1));
        } else if(data[0].hasOwnProperty('value')) {
          filterData = data.filter((entry:any) =>  new Date(entry.key).getTime() >  (new Date(Date.now())).setUTCHours(-24,0,0,-1) && new Date(entry.key).getTime() <  (new Date(Date.now())).setUTCHours(0,0,0,-1));
        } else {
          for (let i = 0; i < data.length; i++) {
            Object.entries(data[i]).forEach((arrEntries:any) => {
              if(new Date(arrEntries[0]).getTime() >  (new Date(Date.now())).setUTCHours(-24,0,0,-1) && new Date(arrEntries[0]).getTime() < (new Date(Date.now())).setUTCHours(0,0,0,-1)) filterData.push({ [arrEntries[0]]: arrEntries[1] });
            });
          }
        }
        break;
      case 'W':
        if (!calcAvgHour && data[0].hasOwnProperty('value')) {
          filterData = data.filter((entry:any) =>  new Date(entry.key).getTime() >  (new Date(Date.now())).setUTCHours(-168,0,0,-1)  && new Date(entry.key).getTime() < (new Date(Date.now())).setUTCHours(0,0,0,-1) );
        } else if(data[0].hasOwnProperty('value')) {
          filterData = data.filter((entry:any) =>  new Date(entry.key).getTime() >  (new Date(Date.now())).setUTCHours(-168,0,0,-1)  && new Date(entry.key).getTime() < (new Date(Date.now())).setUTCHours(0,0,0,-1) );
        } else {
          for (let i = 0; i < data.length; i++) {
            Object.entries(data[i]).forEach((arrEntries:any) => {
              if(new Date(arrEntries[0]).getTime() >  (new Date(Date.now())).setUTCHours(-168,0,0,-1)  && new Date(arrEntries[0]).getTime() < (new Date(Date.now())).setUTCHours(0,0,0,-1)) filterData.push({ [arrEntries[0]]: arrEntries[1] });
            });
          }
        }
        break;
      case 'M':
        if (!calcAvgHour && data[0].hasOwnProperty('value')) {
          filterData = data.filter((entry:any) =>  new Date(entry.key).getTime() > (new Date(Date.now())).setUTCHours(-720,0,0,-1) && new Date(entry.key).getTime() < (new Date(Date.now())).setUTCHours(0,0,0,-1) );
        } else if(data[0].hasOwnProperty('value')) {
          filterData = data.filter((entry:any) =>  new Date(entry.key).getTime() > (new Date(Date.now())).setUTCHours(-720,0,0,-1) && new Date(entry.key).getTime() < (new Date(Date.now())).setUTCHours(0,0,0,-1) );
        } else {
          for (let i = 0; i < data.length; i++) {
            Object.entries(data[i]).forEach((arrEntries:any) => {
              if(new Date(arrEntries[0]).getTime() > (new Date(Date.now())).setUTCHours(-720,0,0,-1) && new Date(arrEntries[0]).getTime() < (new Date(Date.now())).setUTCHours(0,0,0,-1)) filterData.push({ [arrEntries[0]]: arrEntries[1] });
            });
          }
        }
        break;
      default:
        throw 'Unknow Interval';
        break;
    }

    for (let i = 0; i < filterData.length; i++) {
      // Handle gauge indicator avg open orders
      if (calcAvgHour || !data[0].hasOwnProperty('value')) {
        if(i == 0) {
          processedData['value'] = 0;
        }
        processedData['value'] = filterData.map((value) => (new Date(value['value']).getUTCHours())).reduce((prev, curr) => curr += prev, 0) / filterData.length;
        if(isNaN(processedData['value'])){
          processedData['value'] = 0;
          console.log(filterData);
          filterData.forEach((resampleredData) => {
            Object.values(resampleredData).forEach((value) => {
              processedData['value'] += value;
            });
          });
          processedData['value'] = processedData['value'] / filterData.length;
        }
        break
      } else {
        // Handle gauge chart
        if (typeof filterData[i].value == 'number') {
          if(!processedData.hasOwnProperty('value')) processedData['value'] = filterData[i].value;
          else processedData['value'] += filterData[i].value;
          if(i == filterData.length - 1) {
            processedData['value'] /= filterData.length;
          }
        } else {
          // Handle map charts
          Object.keys(filterData[i].value).forEach((key) => {
            if(!processedData.hasOwnProperty(key)) processedData[key] = filterData[i].value[key]
            else processedData[key] += filterData[i].value[key]
          });
        }
      }
    }

    return processedData;
  };
}
