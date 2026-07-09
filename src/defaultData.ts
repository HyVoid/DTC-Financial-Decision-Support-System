/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState } from './types';

export const defaultState: AppState = {
  parameters: [
    {
      id: 'param_initial_cash',
      name: 'Initial Bank Balance',
      value: 125000,
      description: 'Starting cash in business bank account for forecast calculations.'
    },
    {
      id: 'param_safety_reserve',
      name: 'Minimum Safety Cash Reserve',
      value: 50000,
      description: 'The critical cash floor. Cash levels below this trigger alert conditions.'
    },
    {
      id: 'param_usd_rate',
      name: 'USD to Local Exchange Rate',
      value: 7.25,
      description: 'Exchange rate used for multicurrency displays or external billing.'
    },
    {
      id: 'param_weekly_overhead',
      name: 'Weekly Overhead (Fixed OPEX)',
      value: 4500,
      description: 'Fixed recurring cash outflow per week (salaries, software, rent, etc.).'
    },
    {
      id: 'param_roas_target',
      name: 'Target Advertising ROAS',
      value: 3.5,
      description: 'Benchmark return on ad spend (Revenue / Cost) to evaluate marketing efficiency.'
    }
  ],
  shopifyData: [
    { id: 'sh_01', orderId: 'SH-1001', date: '2026-07-01', netPayment: 4200 },
    { id: 'sh_02', orderId: 'SH-1002', date: '2026-07-02', netPayment: 3800 },
    { id: 'sh_03', orderId: 'SH-1003', date: '2026-07-03', netPayment: 5100 },
    { id: 'sh_04', orderId: 'SH-1004', date: '2026-07-04', netPayment: 2900 },
    { id: 'sh_05', orderId: 'SH-1005', date: '2026-07-05', netPayment: 6200 },
    { id: 'sh_06', orderId: 'SH-1006', date: '2026-07-06', netPayment: 4500 },
    { id: 'sh_07', orderId: 'SH-1007', date: '2026-07-07', netPayment: 5800 },
    { id: 'sh_08', orderId: 'SH-1008', date: '2026-07-07', netPayment: 3100 },
    { id: 'sh_09', orderId: 'SH-1009', date: '2026-07-08', netPayment: 4900 }
  ],
  bankTransactions: [
    // Starting balance transactions or receipts matching shopify data
    { id: 'bt_01', referenceId: 'SH-1001', date: '2026-07-02', amount: 4200, description: 'Shopify Payout SH-1001' },
    { id: 'bt_02', referenceId: 'SH-1002', date: '2026-07-03', amount: 3800, description: 'Shopify Payout SH-1002' },
    { id: 'bt_03', referenceId: 'SH-1003', date: '2026-07-04', amount: 5085, description: 'Shopify Payout SH-1003 (Discrepancy: Fee)' }, // discrepancy
    { id: 'bt_04', referenceId: 'SH-1004', date: '2026-07-05', amount: 2900, description: 'Shopify Payout SH-1004' },
    { id: 'bt_05', referenceId: 'SH-1005', date: '2026-07-06', amount: 6200, description: 'Shopify Payout SH-1005' },
    { id: 'bt_06', referenceId: 'SH-1006', date: '2026-07-07', amount: 4500, description: 'Shopify Payout SH-1006' },
    // Some outgoing payments
    { id: 'bt_out_01', referenceId: 'INV-2026-88', date: '2026-07-01', amount: -2400, description: 'Ad agency retainer' },
    { id: 'bt_out_02', referenceId: 'PO-991', date: '2026-07-04', amount: -15000, description: 'Prepayment Supplier PO-991' }
  ],
  accountingInvoices: [
    { id: 'ac_01', invoiceNo: 'INV-2026-88', date: '2026-06-28', vendor: 'BlueMedia Agency', amount: 2400, status: 'Paid' },
    { id: 'ac_02', invoiceNo: 'INV-2026-89', date: '2026-07-01', vendor: 'Shipwire Logistics', amount: 6800, status: 'Approved' },
    { id: 'ac_03', invoiceNo: 'INV-2026-90', date: '2026-07-02', vendor: 'Klaviyo SaaS', amount: 1500, status: 'Approved' },
    { id: 'ac_04', invoiceNo: 'INV-2026-91', date: '2026-07-03', vendor: 'Customs Broker Co', amount: 3200, status: 'Pending' },
    // Repeat invoices to trigger the Payment Review check!
    { id: 'ac_05', invoiceNo: 'INV-2026-90', date: '2026-07-05', vendor: 'Klaviyo SaaS', amount: 1500, status: 'Pending' }, // Duplicate invoiceNo!
    { id: 'ac_06', invoiceNo: 'INV-2026-92', date: '2026-07-06', vendor: 'WeWork Office', amount: 3200, status: 'Pending' }
  ],
  inventoryPurchases: [
    { id: 'ip_01', poReference: 'PO-2026-01', totalOrderCost: 45000, prepaymentPercent: 30, leadTimeWeeks: 4, estPrepayDate: '2026-07-10', status: 'Planned' },
    { id: 'ip_02', poReference: 'PO-2026-02', totalOrderCost: 28000, prepaymentPercent: 50, leadTimeWeeks: 3, estPrepayDate: '2026-07-18', status: 'Planned' },
    { id: 'ip_03', poReference: 'PO-2026-03', totalOrderCost: 65000, prepaymentPercent: 30, leadTimeWeeks: 6, estPrepayDate: '2026-08-01', status: 'Planned' }
  ],
  advertisingSpend: [
    { id: 'ad_01', channel: 'Facebook Ads', date: '2026-07-01', cost: 1200 },
    { id: 'ad_02', channel: 'Google Ads', date: '2026-07-01', cost: 800 },
    { id: 'ad_03', channel: 'Facebook Ads', date: '2026-07-02', cost: 1150 },
    { id: 'ad_04', channel: 'Google Ads', date: '2026-07-02', cost: 850 },
    { id: 'ad_05', channel: 'TikTok Ads', date: '2026-07-03', cost: 500 },
    { id: 'ad_06', channel: 'Facebook Ads', date: '2026-07-03', cost: 1300 },
    { id: 'ad_07', channel: 'Google Ads', date: '2026-07-03', cost: 900 },
    { id: 'ad_08', channel: 'Facebook Ads', date: '2026-07-04', cost: 1400 },
    { id: 'ad_09', channel: 'Google Ads', date: '2026-07-04', cost: 950 },
    { id: 'ad_10', channel: 'TikTok Ads', date: '2026-07-04', cost: 600 },
    { id: 'ad_11', channel: 'Facebook Ads', date: '2026-07-05', cost: 1500 },
    { id: 'ad_12', channel: 'Google Ads', date: '2026-07-05', cost: 1000 },
    { id: 'ad_13', channel: 'Facebook Ads', date: '2026-07-06', cost: 1600 },
    { id: 'ad_14', channel: 'Google Ads', date: '2026-07-06', cost: 1100 },
    { id: 'ad_15', channel: 'TikTok Ads', date: '2026-07-06', cost: 700 },
    { id: 'ad_16', channel: 'Facebook Ads', date: '2026-07-07', cost: 1650 },
    { id: 'ad_17', channel: 'Google Ads', date: '2026-07-07', cost: 1150 }
  ]
};
