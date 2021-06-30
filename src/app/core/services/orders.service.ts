import { Injectable } from '@angular/core';

@Injectable()
export class OrdersService {
  async setLastCustomerSearched(customerId: string): Promise<void>{
    localStorage.setItem('order-customer', customerId);
  }

  async getLastCustomerSearched(): Promise<string> {
    return localStorage.getItem('order-customer');
  }

  async dropLastCustomerSearched(): Promise<void> {
    localStorage.removeItem('order-customer');
  }
}
