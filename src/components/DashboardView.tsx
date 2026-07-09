/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  SystemParameter, 
  ShopifyOrder, 
  BankTransaction, 
  AccountingInvoice, 
  InventoryPurchase, 
  AdvertisingSpend 
} from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  AlertOctagon, 
  Briefcase, 
  Percent, 
  Activity, 
  CheckCircle,
  HelpCircle,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency, addWeeksToDate, getSequenceOfWeeks } from '../utils';

interface DashboardViewProps {
  parameters: SystemParameter[];
  shopifyData: ShopifyOrder[];
  bankTransactions: BankTransaction[];
  accountingInvoices: AccountingInvoice[];
  inventoryPurchases: InventoryPurchase[];
  advertisingSpend: AdvertisingSpend[];
  onSetTab: (tab: string) => void;
}

export default function DashboardView({
  parameters,
  shopifyData,
  bankTransactions,
  accountingInvoices,
  inventoryPurchases,
  advertisingSpend,
  onSetTab
}: DashboardViewProps) {

  // Fetch parameters
  const initialBalanceParam = parameters.find(p => p.id === 'param_initial_cash')?.value ?? 125000;
  const safetyReserveParam = parameters.find(p => p.id === 'param_safety_reserve')?.value ?? 50000;
  const weeklyOpexParam = parameters.find(p => p.id === 'param_weekly_overhead')?.value ?? 4500;
  const roasTargetParam = parameters.find(p => p.id === 'param_roas_target')?.value ?? 3.5;

  // 1. Calculate Exact Live Liquid Cash
  const netBankChanges = bankTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const liveCash = initialBalanceParam + netBankChanges;

  // 2. Compute Reconciliation Discrepancies
  const reconVarianceTotal = shopifyData.reduce((total, order) => {
    const bankSettled = bankTransactions
      .filter(tx => tx.referenceId === order.orderId)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return total + Math.abs(order.netPayment - bankSettled);
  }, 0);

  const missingBankCount = shopifyData.filter(order => {
    const bankSettled = bankTransactions.some(tx => tx.referenceId === order.orderId);
    return !bankSettled;
  }).length;

  const totalOrdersCount = shopifyData.length;
  const fullyMatchedCount = shopifyData.filter(order => {
    const bankSettled = bankTransactions
      .filter(tx => tx.referenceId === order.orderId)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return Math.abs(order.netPayment - bankSettled) < 0.05;
  }).length;
  const matchedPercent = totalOrdersCount > 0 ? (fullyMatchedCount / totalOrdersCount) * 100 : 100;

  // 3. Compute Marketing Ad Performance
  const totalAdCost = advertisingSpend.reduce((sum, ad) => sum + ad.cost, 0);
  const totalSalesRevenue = shopifyData.reduce((sum, o) => sum + o.netPayment, 0);
  const activeROAS = totalAdCost > 0 ? totalSalesRevenue / totalAdCost : 0;

  // 4. Compute Active Audit Duplicate Alerts
  const duplicateAlertsCount = accountingInvoices.filter((inv, _, arr) => {
    const dupRef = arr.some(other => 
      other.id !== inv.id && 
      other.invoiceNo.trim().toLowerCase() === inv.invoiceNo.trim().toLowerCase() && 
      inv.invoiceNo.trim() !== ''
    );
    const dupAmt = arr.some(other => {
      if (other.id === inv.id) return false;
      if (other.vendor.trim().toLowerCase() !== inv.vendor.trim().toLowerCase()) return false;
      if (other.amount !== inv.amount) return false;
      const diffTime = Math.abs(new Date(other.date).getTime() - new Date(inv.date).getTime());
      return (diffTime / (1000 * 60 * 60 * 24)) <= 7;
    });
    return (dupRef || dupAmt) && inv.status !== 'Paid';
  }).length;

  // 5. Weekly Cash Forecast Breach scan (Week 1 to Week 12)
  const baseDate = '2026-07-07';
  const weekStartDates = getSequenceOfWeeks(baseDate, 12);
  let prevEndingBalance = liveCash;
  let hasForecastBreach = false;
  let firstBreachWeekIdx = -1;
  let firstBreachWeekDate = '';

  weekStartDates.forEach((weekStart, idx) => {
    const weekStartMs = new Date(weekStart).getTime();
    const weekEndMs = weekStartMs + 7 * 24 * 60 * 60 * 1000;

    const shopifyInflow = shopifyData
      .filter(o => {
        const orderTime = new Date(o.date).getTime();
        return orderTime >= weekStartMs && orderTime < weekEndMs;
      })
      .reduce((sum, o) => sum + o.netPayment, 0);

    const otherInflow = bankTransactions
      .filter(tx => {
        if (tx.amount <= 0) return false;
        const isShopify = shopifyData.some(o => o.orderId === tx.referenceId);
        if (isShopify) return false;
        const txTime = new Date(tx.date).getTime();
        return txTime >= weekStartMs && txTime < weekEndMs;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    const adOutflow = advertisingSpend
      .filter(ad => {
        const adTime = new Date(ad.date).getTime();
        return adTime >= weekStartMs && adTime < weekEndMs;
      })
      .reduce((sum, ad) => sum + ad.cost, 0);

    const inventoryPrepayOutflow = inventoryPurchases
      .filter(p => {
        const prepayTime = new Date(p.estPrepayDate).getTime();
        return prepayTime >= weekStartMs && prepayTime < weekEndMs && p.status !== 'Completed';
      })
      .reduce((sum, p) => sum + (p.totalOrderCost * (p.prepaymentPercent / 100)), 0);

    const inventoryFinalOutflow = inventoryPurchases
      .filter(p => {
        const finalDate = addWeeksToDate(p.estPrepayDate, p.leadTimeWeeks);
        const finalTime = new Date(finalDate).getTime();
        return finalTime >= weekStartMs && finalTime < weekEndMs && p.status !== 'Completed';
      })
      .reduce((sum, p) => sum + (p.totalOrderCost * (1 - p.prepaymentPercent / 100)), 0);

    const netCashFlow = shopifyInflow + otherInflow - adOutflow - inventoryPrepayOutflow - inventoryFinalOutflow - weeklyOpexParam;
    const endingBalance = prevEndingBalance + netCashFlow;
    
    if (endingBalance < safetyReserveParam && !hasForecastBreach) {
      hasForecastBreach = true;
      firstBreachWeekIdx = idx + 1;
      firstBreachWeekDate = weekStart;
    }
    prevEndingBalance = endingBalance;
  });

  // Calculate standard conversion indicators
  const cashGrade = liveCash >= safetyReserveParam ? 'Healthy' : 'Breached';
  const conversionROASGoalMet = activeROAS >= roasTargetParam;

  return (
    <div className="animate-fade-up space-y-6">
      
      {/* Visual Introduction and Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="heading-eb text-3xl text-[#051C2C] font-semibold flex items-center gap-2">
            <Activity className="text-[#2251FF]" size={24} />
            DTC Financial Decision Support cockpit
          </h2>
          <p className="text-[#888888] text-xs mt-1">
            Real-time spreadsheet-reconciliation integration. Zero manual formula maintenance, completely offline-saved cash pilot console.
          </p>
        </div>
      </div>

      {/* Top Level Exec KPI Grid (EB Garamond Numbers) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* KPI 1: Live Cash */}
        <div className="bg-white p-5 rounded-[14px] shadow-sm floating-card border-l-4 border-[#2251FF]">
          <div className="text-[#888888] text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <DollarSign size={12} className="text-[#2251FF]" />
            Liquid Bank Cash
          </div>
          <div className="display-eb text-3.5xl font-bold text-[#051C2C] tracking-tight -mt-1">
            {formatCurrency(liveCash)}
          </div>
          <div className="text-xs text-[#888888] mt-1.5 flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-full ${liveCash >= safetyReserveParam ? 'bg-[#00C853]' : 'bg-[#D32F2F]'}`} />
            Status: {cashGrade}
          </div>
        </div>

        {/* KPI 2: ROAS performance */}
        <div className="bg-white p-5 rounded-[14px] shadow-sm floating-card border-l-4 border-[#051C2C]">
          <div className="text-[#888888] text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Percent size={12} className="text-[#051C2C]" />
            Active Store ROAS
          </div>
          <div className="display-eb text-3.5xl font-bold text-[#051C2C] tracking-tight -mt-1">
            {activeROAS.toFixed(2)}x
          </div>
          <div className="text-xs text-[#888888] mt-1.5">
            Target benchmark: {roasTargetParam.toFixed(1)}x
          </div>
        </div>

        {/* KPI 3: AP Fraud intercept alerts */}
        <div className="bg-white p-5 rounded-[14px] shadow-sm floating-card border-l-4 border-[#D32F2F]">
          <div className="text-[#888888] text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <AlertOctagon size={12} className="text-[#D32F2F]" />
            AP Duplicate Risks
          </div>
          <div className="display-eb text-3.5xl font-bold text-[#D32F2F] tracking-tight -mt-1">
            {duplicateAlertsCount}
          </div>
          <div className="text-xs text-[#888888] mt-1.5">
            Potential double-payment flags
          </div>
        </div>

        {/* KPI 4: Unreconciled Variance Offset */}
        <div className="bg-white p-5 rounded-[14px] shadow-sm floating-card border-l-4 border-yellow-400">
          <div className="text-[#888888] text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-yellow-600" />
            Unmatched variance
          </div>
          <div className="display-eb text-3.5xl font-bold text-[#051C2C] tracking-tight -mt-1">
            {formatCurrency(reconVarianceTotal)}
          </div>
          <div className="text-xs text-[#888888] mt-1.5">
            {missingBankCount} orders missing bank flow
          </div>
        </div>
      </div>

      {/* Critical Operations Bulletins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Alerts Ledger */}
        <div className="bg-white p-6 rounded-[14px] shadow-sm lg:col-span-2 space-y-4">
          <h3 className="heading-eb text-lg text-[#051C2C] font-semibold border-b border-[#E8E8E6] pb-3 flex items-center gap-2">
            <AlertOctagon className="text-[#D32F2F]" size={18} />
            CEO Executive Alert Desk
          </h3>

          <div className="space-y-3">
            {/* Liquidity alarm */}
            {hasForecastBreach ? (
              <div 
                className="p-3 bg-[rgba(211,47,47,0.04)] text-xs text-red-950 border-l-3 border-[#D32F2F] rounded-r-[8px] flex items-center justify-between gap-4 cursor-pointer hover:bg-[rgba(211,47,47,0.06)] transition-colors"
                onClick={() => onSetTab('forecast')}
              >
                <div>
                  <strong className="font-semibold text-[#D32F2F] block">PROJECTED LIQUIDITY CRASH</strong>
                  Forecast shows cash dropping below ${safetyReserveParam.toLocaleString()} limit in Week {firstBreachWeekIdx} ({firstBreachWeekDate}).
                </div>
                <ArrowUpRight size={16} className="text-[#D32F2F] shrink-0" />
              </div>
            ) : (
              <div className="p-3 bg-green-50 text-xs text-green-950 border-l-3 border-[#00C853] rounded-r-[8px] flex items-center gap-2">
                <CheckCircle size={14} className="text-[#00C853]" />
                Liquidity Runway: All 12 forward-looking weeks have sufficient buffers above threshold levels.
              </div>
            )}

            {/* Reconciliation alarm */}
            {reconVarianceTotal > 0 ? (
              <div 
                className="p-3 bg-yellow-50 text-xs text-yellow-950 border-l-3 border-yellow-500 rounded-r-[8px] flex items-center justify-between gap-4 cursor-pointer hover:bg-yellow-100/50 transition-colors"
                onClick={() => onSetTab('reconciliation')}
              >
                <div>
                  <strong className="font-semibold text-yellow-800 block">RECONCILIATION DISCREPANCY</strong>
                  There is {formatCurrency(reconVarianceTotal)} in cash variance between Shopify net payouts and bank flow references.
                </div>
                <ArrowUpRight size={16} className="text-yellow-600 shrink-0" />
              </div>
            ) : (
              <div className="p-3 bg-green-50 text-xs text-green-950 border-l-3 border-[#00C853] rounded-r-[8px] flex items-center gap-2">
                <CheckCircle size={14} className="text-[#00C853]" />
                Payout Verification: Double-entry audit verified 100% bank clearance matching.
              </div>
            )}

            {/* Double payment alarm */}
            {duplicateAlertsCount > 0 ? (
              <div 
                className="p-3 bg-[rgba(211,47,47,0.04)] text-xs text-red-950 border-l-3 border-[#D32F2F] rounded-r-[8px] flex items-center justify-between gap-4 cursor-pointer hover:bg-[rgba(211,47,47,0.06)] transition-colors"
                onClick={() => onSetTab('paymentReview')}
              >
                <div>
                  <strong className="font-semibold text-[#D32F2F] block">DOUBLE-PAYMENT BLOCKED VOUCHERS</strong>
                  {duplicateAlertsCount} duplicate vouchers caught in ledger audit. Suspended to prevent clerical payouts.
                </div>
                <ArrowUpRight size={16} className="text-[#D32F2F] shrink-0" />
              </div>
            ) : (
              <div className="p-3 bg-green-50 text-xs text-green-950 border-l-3 border-[#00C853] rounded-r-[8px] flex items-center gap-2">
                <CheckCircle size={14} className="text-[#00C853]" />
                Audit Protection: General Ledger is clear of overlapping duplicates.
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Business Analytics Chart Card */}
        <div className="bg-white p-6 rounded-[14px] shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="heading-eb text-lg text-[#051C2C] font-semibold border-b border-[#E8E8E6] pb-3">
              Channel Ad Cost Distribution
            </h3>
            
            {/* Direct Channel cost distribution */}
            <div className="mt-4 space-y-4">
              {['Facebook Ads', 'Google Ads', 'TikTok Ads'].map((chan, i) => {
                const totalChanCost = advertisingSpend
                  .filter(ad => ad.channel === chan)
                  .reduce((sum, ad) => sum + ad.cost, 0);
                const chanPct = totalAdCost > 0 ? (totalChanCost / totalAdCost) * 100 : 0;
                const colors = ['bg-[#2251FF]', 'bg-[#051C2C]', 'bg-[#888888]'];

                return (
                  <div key={chan} className="text-xs">
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-[#051C2C]">{chan}</span>
                      <span className="font-mono text-[#888888]">{formatCurrency(totalChanCost)} ({chanPct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#F5F5F2] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${colors[i % colors.length]}`} 
                        style={{ width: `${chanPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#E8E8E6] pt-4 mt-6">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#888888]">Total Marketing Budget:</span>
              <span className="font-mono text-[#051C2C]">{formatCurrency(totalAdCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytical Narrative Insight Block */}
      <div className="insight-box space-y-2">
        <h4 className="heading-eb text-md text-[#2251FF] font-semibold uppercase tracking-wider text-xs">
          CEO Strategic Intelligence Report
        </h4>
        <p className="text-[#051C2C] text-xs leading-relaxed">
          The DTC store is operating at a cumulative ROAS of <strong>{activeROAS.toFixed(2)}x</strong> against a target of <strong>{roasTargetParam.toFixed(1)}x</strong>. 
          Cash reconciliation score is <strong>{matchedPercent.toFixed(1)}%</strong>. 
          {hasForecastBreach ? (
            <span> We recommend <strong>suspending</strong> the next inventory PO prepayment, or negotiating a payment split (e.g., 20/80) to secure Week {firstBreachWeekIdx} runway requirements.</span>
          ) : (
            <span> Liquid resources are stable. Standard inventory procurement replenishment orders are safe to execute under current ad budgets.</span>
          )}
        </p>
      </div>

    </div>
  );
}
