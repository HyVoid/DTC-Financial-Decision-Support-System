/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  SystemParameter, 
  ShopifyOrder, 
  BankTransaction, 
  InventoryPurchase, 
  AdvertisingSpend,
  WeeklyForecast 
} from '../types';
import { TrendingUp, AlertTriangle, CheckCircle2, CalendarRange } from 'lucide-react';
import { formatCurrency, getSequenceOfWeeks, isDateInWeek, addWeeksToDate } from '../utils';

interface CashForecastViewProps {
  parameters: SystemParameter[];
  shopifyData: ShopifyOrder[];
  bankTransactions: BankTransaction[];
  inventoryPurchases: InventoryPurchase[];
  advertisingSpend: AdvertisingSpend[];
}

export default function CashForecastView({ 
  parameters, 
  shopifyData, 
  bankTransactions, 
  inventoryPurchases, 
  advertisingSpend 
}: CashForecastViewProps) {

  const initialBalanceParam = parameters.find(p => p.id === 'param_initial_cash')?.value ?? 125000;
  const safetyReserveParam = parameters.find(p => p.id === 'param_safety_reserve')?.value ?? 50000;
  const weeklyOpexParam = parameters.find(p => p.id === 'param_weekly_overhead')?.value ?? 4500;

  // 1. Calculate current exact cash balance = starting + net of all bank transactions
  const netBankChanges = bankTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const currentCashBalance = initialBalanceParam + netBankChanges;

  // 2. Generate 12 rolling weekly periods starting from today (2026-07-07)
  const baseDate = '2026-07-07';
  const weekStartDates = getSequenceOfWeeks(baseDate, 12);

  // 3. Calculate forecast weekly parameters
  const forecasts: WeeklyForecast[] = [];
  let prevEndingBalance = currentCashBalance;

  weekStartDates.forEach((weekStart, idx) => {
    // Week interval details
    const weekStartMs = new Date(weekStart).getTime();
    const weekEndMs = weekStartMs + 7 * 24 * 60 * 60 * 1000;

    // A. Starting Balance
    const startingBalance = idx === 0 ? currentCashBalance : prevEndingBalance;

    // B. Shopify inflows (orders settling in this week)
    const shopifyInflow = shopifyData
      .filter(o => {
        const orderTime = new Date(o.date).getTime();
        return orderTime >= weekStartMs && orderTime < weekEndMs;
      })
      .reduce((sum, o) => sum + o.netPayment, 0);

    // C. Other inflows (miscellaneous deposits from bank transactions with positive amount falling in this future week - if any mapped)
    const otherInflow = bankTransactions
      .filter(tx => {
        if (tx.amount <= 0) return false;
        // Check if matching a shopify order (if so, already counted as order receipt inflow to avoid double count)
        const isShopifyPayout = shopifyData.some(o => o.orderId === tx.referenceId);
        if (isShopifyPayout) return false;
        
        const txTime = new Date(tx.date).getTime();
        return txTime >= weekStartMs && txTime < weekEndMs;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    // D. Ad spend outflows
    const adOutflow = advertisingSpend
      .filter(ad => {
        const adTime = new Date(ad.date).getTime();
        return adTime >= weekStartMs && adTime < weekEndMs;
      })
      .reduce((sum, ad) => sum + ad.cost, 0);

    // E. Inventory prepayments (status: Planned / Prepaid)
    const inventoryPrepayOutflow = inventoryPurchases
      .filter(p => {
        const prepayTime = new Date(p.estPrepayDate).getTime();
        return prepayTime >= weekStartMs && prepayTime < weekEndMs && p.status !== 'Completed';
      })
      .reduce((sum, p) => sum + (p.totalOrderCost * (p.prepaymentPercent / 100)), 0);

    // F. Inventory final balance payments (after leadTimeWeeks)
    const inventoryFinalOutflow = inventoryPurchases
      .filter(p => {
        const finalDate = addWeeksToDate(p.estPrepayDate, p.leadTimeWeeks);
        const finalTime = new Date(finalDate).getTime();
        return finalTime >= weekStartMs && finalTime < weekEndMs && p.status !== 'Completed';
      })
      .reduce((sum, p) => sum + (p.totalOrderCost * (1 - p.prepaymentPercent / 100)), 0);

    // G. Fixed Opex overhead
    const fixedOpexOutflow = weeklyOpexParam;

    // Calculation summary
    const totalInflow = shopifyInflow + otherInflow;
    const totalOutflow = adOutflow + inventoryPrepayOutflow + inventoryFinalOutflow + fixedOpexOutflow;
    const netCashFlow = totalInflow - totalOutflow;
    const endingBalance = startingBalance + netCashFlow;
    const isBreached = endingBalance < safetyReserveParam;

    forecasts.push({
      weekIndex: idx + 1,
      dateLabel: weekStart,
      startingBalance,
      shopifyInflow,
      otherInflow,
      adOutflow,
      inventoryPrepayOutflow,
      inventoryFinalOutflow,
      fixedOpexOutflow,
      netCashFlow,
      endingBalance,
      isBreached
    });

    prevEndingBalance = endingBalance;
  });

  // Calculate stats
  const breachedWeeks = forecasts.filter(f => f.isBreached);
  const minEndingCash = Math.min(...forecasts.map(f => f.endingBalance));

  // Custom SVG Chart Dimensions
  const chartHeight = 120;
  const chartWidth = 1200;
  const marginY = 15;
  const maxCashValue = Math.max(...forecasts.map(f => f.endingBalance), safetyReserveParam, 180000) * 1.1;
  const minCashValue = Math.min(...forecasts.map(f => f.endingBalance), safetyReserveParam, 0) * 0.9;
  const cashSpan = maxCashValue - minCashValue;

  const getSvgY = (val: number) => {
    return chartHeight - marginY - ((val - minCashValue) / cashSpan) * (chartHeight - 2 * marginY);
  };

  const getSvgX = (idx: number) => {
    return 50 + (idx / 11) * (chartWidth - 100);
  };

  // Build ending cash polyline points
  const points = forecasts.map((f, i) => `${getSvgX(i)},${getSvgY(f.endingBalance)}`).join(' ');
  const safetyY = getSvgY(safetyReserveParam);

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="heading-eb text-2xl text-[#051C2C] font-semibold flex items-center gap-2">
            <TrendingUp className="text-[#2251FF]" size={22} />
            12-Week Rolling Cash Flow Forecast (Cash_Flow_Forecast)
          </h2>
          <p className="text-[#888888] text-xs mt-1">
            Predict future cash liquidity based on active marketing ad-spend, inventory production lead-times, fixed opex and order settlement averages.
          </p>
        </div>
      </div>

      {/* Cash Health Alert Indicator */}
      {breachedWeeks.length > 0 ? (
        <div className="anomaly-box flex gap-3 items-start">
          <AlertTriangle className="text-[#D32F2F] shrink-0 mt-0.5" size={16} />
          <div className="text-xs text-[#051C2C]">
            <strong className="font-semibold block text-[#D32F2F] mb-1">Critical Cash Liquidity Alert!</strong>
            Future ending cash reserves fall below your safe minimum floor (<strong className="font-mono text-[#D32F2F]">{formatCurrency(safetyReserveParam)}</strong>) in <strong>{breachedWeeks.length} out of the next 12 weeks</strong>. 
            First breach occurs on <strong className="font-mono text-[#D32F2F]">{breachedWeeks[0].dateLabel}</strong> (Week {breachedWeeks[0].weekIndex}). Adjust marketing bids or negotiate longer supplier terms.
          </div>
        </div>
      ) : (
        <div className="insight-box flex gap-3 items-start">
          <CheckCircle2 className="text-[#00C853] shrink-0 mt-0.5" size={16} />
          <div className="text-xs text-[#051C2C]">
            <strong className="font-semibold block text-[#00C853] mb-1">Cash Reserve Liquid State: Stable</strong>
            Liquid reserves are projected to remain above the critical limit of <strong className="font-mono">{formatCurrency(safetyReserveParam)}</strong> for all 12 upcoming weeks. Minimum projected cash cushion is <strong className="font-mono text-[#2251FF]">{formatCurrency(minEndingCash)}</strong>.
          </div>
        </div>
      )}

      {/* SVG Projections Chart */}
      <div className="bg-white p-5 rounded-[14px] shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="heading-eb text-sm text-[#051C2C] font-semibold flex items-center gap-1.5">
            <CalendarRange size={14} className="text-[#2251FF]" />
            Liquid Cash Curve vs Safety Threshold
          </h4>
          <div className="flex gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-[#051C2C]">
              <span className="w-3 h-0.5 bg-[#2251FF]" />
              Projected Bank Cash
            </div>
            <div className="flex items-center gap-1.5 text-[#D32F2F]">
              <span className="w-3 h-0.5 bg-[#D32F2F] border-dashed border-t border-[#D32F2F]" />
              Safety Cushion Minimum
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <svg className="w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ minWidth: '800px', height: `${chartHeight}px` }}>
            {/* Horizontal Grid lines */}
            <line x1="50" y1={getSvgY(safetyReserveParam)} x2={chartWidth - 50} y2={getSvgY(safetyReserveParam)} stroke="#D32F2F" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="50" y1={getSvgY(0)} x2={chartWidth - 50} y2={getSvgY(0)} stroke="#E8E8E6" strokeWidth="0.5" />
            
            {/* Ending Cash Polyline */}
            <polyline fill="none" stroke="var(--color-accent)" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />

            {/* Verticals and Labels for Weeks */}
            {forecasts.map((f, i) => {
              const x = getSvgX(i);
              const y = getSvgY(f.endingBalance);

              return (
                <g key={f.weekIndex}>
                  <line x1={x} y1="10" x2={x} y2={chartHeight - 20} stroke="#E8E8E6" strokeWidth="0.5" strokeDasharray="1 3" />
                  
                  {/* Point Circle */}
                  <circle cx={x} cy={y} r="4" fill={f.isBreached ? '#D32F2F' : 'var(--color-accent)'} stroke="#FFFFFF" strokeWidth="1.5" />

                  {/* Top value value on hover/visible */}
                  <text x={x} y={y - 8} textAnchor="middle" className="font-mono text-[9px] fill-[#051C2C] font-semibold">
                    ${(f.endingBalance / 1000).toFixed(0)}k
                  </text>

                  {/* Bottom Week Label */}
                  <text x={x} y={chartHeight - 4} textAnchor="middle" className="font-mono text-[9px] fill-[#888888]">
                    W{f.weekIndex}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 12-Week Rolling Grid Table */}
      <div className="bg-white rounded-[14px] shadow-sm overflow-hidden border-b border-[#E8E8E6]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: '1300px' }}>
            <thead>
              <tr className="bg-[rgba(5,28,44,0.04)] border-b border-[rgba(5,28,44,0.12)]">
                <th className="px-5 py-4 label-uppercase text-xs text-[#051C2C] font-semibold sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.03)]" style={{ width: '220px' }}>
                  Cash Category Item
                </th>
                {forecasts.map(f => (
                  <th key={f.weekIndex} className="px-4 py-4 text-center">
                    <div className="text-xs font-mono font-bold text-[#051C2C]">W{f.weekIndex}</div>
                    <div className="text-[10px] text-[#888888] font-mono mt-0.5">{f.dateLabel.substring(5)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Starting Cash */}
              <tr className="border-b border-[#E8E8E6] bg-white">
                <td className="px-5 py-3 font-semibold text-[#051C2C] text-xs sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                  Starting Balance
                </td>
                {forecasts.map(f => (
                  <td key={f.weekIndex} className="px-4 py-3 text-center font-mono text-xs text-[#051C2C]">
                    {formatCurrency(f.startingBalance)}
                  </td>
                ))}
              </tr>

              {/* Inflows Section */}
              <tr className="bg-gray-50/40">
                <td colSpan={13} className="px-5 py-1.5 label-uppercase text-[10px] text-[#888888] font-semibold sticky left-0 bg-gray-50/40">
                  Cash Receipts (Inflows)
                </td>
              </tr>
              <tr className="border-b border-[#E8E8E6] bg-white">
                <td className="px-5 py-2.5 text-xs text-[#051C2C] pl-8 sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                  Shopify Store Receipts
                </td>
                {forecasts.map(f => (
                  <td key={f.weekIndex} className="px-4 py-2.5 text-center font-mono text-xs text-[#00C853]">
                    {f.shopifyInflow > 0 ? `+${formatCurrency(f.shopifyInflow)}` : '-'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#E8E8E6] bg-white">
                <td className="px-5 py-2.5 text-xs text-[#051C2C] pl-8 sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                  Other Bank Inflows
                </td>
                {forecasts.map(f => (
                  <td key={f.weekIndex} className="px-4 py-2.5 text-center font-mono text-xs text-[#00C853]">
                    {f.otherInflow > 0 ? `+${formatCurrency(f.otherInflow)}` : '-'}
                  </td>
                ))}
              </tr>

              {/* Outflows Section */}
              <tr className="bg-gray-50/40">
                <td colSpan={13} className="px-5 py-1.5 label-uppercase text-[10px] text-[#888888] font-semibold sticky left-0 bg-gray-50/40">
                  Cash Disbursements (Outflows)
                </td>
              </tr>
              <tr className="border-b border-[#E8E8E6] bg-white">
                <td className="px-5 py-2.5 text-xs text-[#051C2C] pl-8 sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                  Advertising Expenditure
                </td>
                {forecasts.map(f => (
                  <td key={f.weekIndex} className="px-4 py-2.5 text-center font-mono text-xs text-[#D32F2F]">
                    {f.adOutflow > 0 ? `-${formatCurrency(f.adOutflow)}` : '-'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#E8E8E6] bg-white">
                <td className="px-5 py-2.5 text-xs text-[#051C2C] pl-8 sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                  Inventory Prepayments
                </td>
                {forecasts.map(f => (
                  <td key={f.weekIndex} className="px-4 py-2.5 text-center font-mono text-xs text-[#D32F2F]">
                    {f.inventoryPrepayOutflow > 0 ? `-${formatCurrency(f.inventoryPrepayOutflow)}` : '-'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#E8E8E6] bg-white">
                <td className="px-5 py-2.5 text-xs text-[#051C2C] pl-8 sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                  Inventory Final Payments
                </td>
                {forecasts.map(f => (
                  <td key={f.weekIndex} className="px-4 py-2.5 text-center font-mono text-xs text-[#D32F2F]">
                    {f.inventoryFinalOutflow > 0 ? `-${formatCurrency(f.inventoryFinalOutflow)}` : '-'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#E8E8E6] bg-white">
                <td className="px-5 py-2.5 text-xs text-[#051C2C] pl-8 sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                  Fixed Overhead (Fixed OPEX)
                </td>
                {forecasts.map(f => (
                  <td key={f.weekIndex} className="px-4 py-2.5 text-center font-mono text-xs text-[#D32F2F]">
                    -{formatCurrency(f.fixedOpexOutflow)}
                  </td>
                ))}
              </tr>

              {/* Total Summary Row */}
              <tr className="border-b border-[#E8E8E6] bg-gray-50/50">
                <td className="px-5 py-3 font-semibold text-[#051C2C] text-xs sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                  Net Weekly Change
                </td>
                {forecasts.map(f => {
                  const isPos = f.netCashFlow >= 0;
                  return (
                    <td key={f.weekIndex} className={`px-4 py-3 text-center font-mono text-xs font-semibold ${
                      isPos ? 'text-[#00C853]' : 'text-[#D32F2F]'
                    }`}>
                      {isPos ? '+' : ''}{formatCurrency(f.netCashFlow)}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Ending Balance */}
              <tr className="border-b-2 border-[#051C2C] bg-[#051C2C]/5 font-bold">
                <td className="px-5 py-3.5 text-[#051C2C] text-xs sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                  Ending Bank Cash
                </td>
                {forecasts.map(f => (
                  <td 
                    key={f.weekIndex} 
                    className={`px-4 py-3.5 text-center font-mono text-xs border-b-2 ${
                      f.isBreached 
                        ? 'text-[#D32F2F] bg-red-100/50' 
                        : 'text-[#051C2C]'
                    }`}
                  >
                    {formatCurrency(f.endingBalance)}
                    {f.isBreached && (
                      <span className="block text-[9px] text-[#D32F2F] font-semibold uppercase mt-0.5">
                        ⚠️ BREACHED
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
