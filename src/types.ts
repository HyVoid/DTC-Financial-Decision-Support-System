/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemParameter {
  id: string;
  name: string;
  value: number;
  description: string;
}

export interface ShopifyOrder {
  id: string;
  orderId: string;
  date: string;
  netPayment: number; // in USD
}

export interface BankTransaction {
  id: string;
  referenceId: string; // matches orderId, invoiceNo, PO, etc.
  date: string;
  amount: number; // Positive for inflow, negative for outflow
  description: string;
}

export interface AccountingInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  vendor: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Paid';
}

export interface InventoryPurchase {
  id: string;
  poReference: string;
  totalOrderCost: number;
  prepaymentPercent: number; // e.g. 30 for 30%
  leadTimeWeeks: number; // weeks between prepay and final payment
  estPrepayDate: string; // YYYY-MM-DD
  status: 'Planned' | 'Prepaid' | 'Completed';
}

export interface AdvertisingSpend {
  id: string;
  channel: string;
  date: string;
  cost: number;
}

// Derived Types
export interface ReconciliationItem {
  orderId: string;
  shopifyNet: number;
  bankSettled: number;
  variance: number;
  status: 'Fully Matched' | 'Minor Variance' | 'Bank Missing' | 'Discrepancy';
}

export interface PaymentReviewItem {
  id: string;
  invoiceNo: string;
  vendor: string;
  amount: number;
  trigger: string;
  status: 'Pending' | 'Flagged' | 'Cleared';
}

export interface WeeklyForecast {
  weekIndex: number;
  dateLabel: string;
  startingBalance: number;
  shopifyInflow: number;
  otherInflow: number;
  adOutflow: number;
  inventoryPrepayOutflow: number;
  inventoryFinalOutflow: number;
  fixedOpexOutflow: number;
  netCashFlow: number;
  endingBalance: number;
  isBreached: boolean;
}

export interface SimulatorItem {
  poReference: string;
  totalOrderCost: number;
  prepaymentPercent: number;
  leadTimeWeeks: number;
  estPrepayDate: string;
  prepayAmount: number;
  finalAmount: number;
  finalPaymentDate: string;
  prepayCashAfter: number;
  finalCashAfter: number;
  isPrepaySafe: boolean;
  isFinalSafe: boolean;
  statusMessage: string;
  statusType: 'success' | 'warning' | 'danger';
}

export interface AppState {
  parameters: SystemParameter[];
  shopifyData: ShopifyOrder[];
  bankTransactions: BankTransaction[];
  accountingInvoices: AccountingInvoice[];
  inventoryPurchases: InventoryPurchase[];
  advertisingSpend: AdvertisingSpend[];
}
