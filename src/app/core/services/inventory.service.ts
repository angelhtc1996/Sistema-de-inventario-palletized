import { Injectable } from '@angular/core';

@Injectable()
export class InventoryService {
  async setLastCustomerSearched(customerId: string): Promise<void>{
    localStorage.setItem('inventory-customer', customerId);
  }

  async getLastCustomerSearched(): Promise<string> {
    return localStorage.getItem('inventory-customer');
  }

  async dropLastCustomerSearched(): Promise<void> {
    localStorage.removeItem('inventory-customer');
  }
}
