/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShopifyOrder, BankTransaction, ReconciliationItem } from '../types';
import { CheckCircle, AlertTriangle, HelpCircle, ShieldCheck, Filter } from 'lucide-react';
import { formatCurrency } from '../utils';

interface ReconciliationViewProps {
  orders: ShopifyOrder[];
  transactions: BankTransaction[];
}

export default function ReconciliationView({ orders, transactions }: ReconciliationViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Compute reconciliation items live using Shopify Order list as master keys
  const reconItems: ReconciliationItem[] = orders.map(order => {
    // 1. Shopify Net
    const shopifyNet = order.netPayment;

    // 2. Sum matching bank transactions (where Reference ID matches this Order ID)
    const bankSettled = transactions
      .filter(tx => tx.referenceId === order.orderId)
      .reduce((sum, tx) => sum + tx.amount, 0);

    // 3. Variance
    const variance = shopifyNet - bankSettled;

    // 4. Status
    let status: ReconciliationItem['status'] = 'Discrepancy';
    if (variance === 0) {
      status = 'Fully Matched';
    } else if (Math.abs(variance) < 0.05) {
      status = 'Minor Variance';
    } else if (bankSettled === 0) {
      status = 'Bank Missing';
    }

    return {
      orderId: order.orderId,
      shopifyNet,
      bankSettled,
      variance,
      status
    };
  });

  // Calculate high-level audit stats
  const totalOrdersCount = reconItems.length;
  const fullyMatchedCount = reconItems.filter(item => item.status === 'Fully Matched' || item.status === 'Minor Variance').length;
  const bankMissingCount = reconItems.filter(item => item.status === 'Bank Missing').length;
  const discrepancyCount = reconItems.filter(item => item.status === 'Discrepancy').length;
  const totalVarianceAmt = reconItems.reduce((sum, item) => sum + Math.abs(item.variance), 0);

  const matchedPercent = totalOrdersCount > 0 ? (fullyMatchedCount / totalOrdersCount) * 100 : 100;

  // Apply filters
  const filteredItems = reconItems.filter(item => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'MATCHED') return item.status === 'Fully Matched' || item.status === 'Minor Variance';
    if (filterStatus === 'MISSING') return item.status === 'Bank Missing';
    if (filterStatus === 'DISCREPANCY') return item.status === 'Discrepancy';
    return true;
  });

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h2 className="heading-eb text-2xl text-[#051C2C] font-semibold flex items-center gap-2">
          <ShieldCheck className="text-[#2251FF]" size={22} />
          Double-Entry Reconciliation Engine (Reconciliation_Engine)
        </h2>
        <p className="text-[#888888] text-xs mt-1">
          Automated cross-system matching. Computes differences between Shopify payouts and bank ledger settlements in real-time.
        </p>
      </div>

      {/* KPI Cards specific to reconciliation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[14px] shadow-sm floating-card">
          <div className="text-[#888888] text-[11px] font-semibold uppercase mb-1">Reconciliation Score</div>
          <div className="display-eb text-3xl font-bold text-[#051C2C] tracking-tight">
            {matchedPercent.toFixed(1)}%
          </div>
          <div className="text-xs text-[#888888] mt-1">
            {fullyMatchedCount} / {totalOrdersCount} payouts reconciled
          </div>
        </div>

        <div className="bg-white p-5 rounded-[14px] shadow-sm floating-card">
          <div className="text-[#888888] text-[11px] font-semibold uppercase mb-1">Pending Bank Clearing</div>
          <div className="display-eb text-3xl font-bold text-[#2251FF] tracking-tight">
            {bankMissingCount} items
          </div>
          <div className="text-xs text-[#888888] mt-1">
            Orders pending bank transfer lines
          </div>
        </div>

        <div className="bg-white p-5 rounded-[14px] shadow-sm floating-card">
          <div className="text-[#888888] text-[11px] font-semibold uppercase mb-1">Discrepancy Alerts</div>
          <div className="display-eb text-3xl font-bold text-[#D32F2F] tracking-tight">
            {discrepancyCount} items
          </div>
          <div className="text-xs text-[#888888] mt-1">
            Requires processor settlement audit
          </div>
        </div>

        <div className="bg-white p-5 rounded-[14px] shadow-sm floating-card">
          <div className="text-[#888888] text-[11px] font-semibold uppercase mb-1">Unreconciled Variance</div>
          <div className="display-eb text-3xl font-bold text-[#051C2C] tracking-tight">
            {formatCurrency(totalVarianceAmt)}
          </div>
          <div className="text-xs text-[#888888] mt-1">
            Absolute sum of transaction offsets
          </div>
        </div>
      </div>

      {/* Audit Insight Box */}
      {discrepancyCount > 0 && (
        <div className="anomaly-box flex gap-3 items-start">
          <AlertTriangle className="text-[#D32F2F] shrink-0 mt-0.5" size={16} />
          <div className="text-xs text-[#051C2C]">
            <strong className="font-semibold block text-[#D32F2F] mb-1">Reconciliation Discrepancy Alert!</strong>
            We detected {discrepancyCount} Shopify orders with payout amounts deviating from matching bank bank flow records. Typically caused by processor fees, currency spreads, or chargebacks. Inspect highlighted rows below.
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-[14px] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#888888]" />
          <span className="text-xs font-semibold text-[#051C2C] uppercase tracking-wider">Filter Status:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'ALL', label: 'All Orders' },
            { key: 'MATCHED', label: 'Matched/Minor Variance' },
            { key: 'MISSING', label: 'Pending Bank Inflow' },
            { key: 'DISCREPANCY', label: 'Discrepancy Alerts' }
          ].map(opt => (
            <button
              key={opt.key}
              id={`filter-recon-${opt.key}`}
              onClick={() => setFilterStatus(opt.key)}
              className={`px-4 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                filterStatus === opt.key 
                  ? 'bg-[#2251FF] text-white shadow-sm' 
                  : 'bg-[#F5F5F2] text-[#051C2C] hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reconciliation Table */}
      <div className="bg-white rounded-[14px] shadow-sm overflow-hidden border-b border-[#E8E8E6]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[rgba(5,28,44,0.04)] border-b border-[rgba(5,28,44,0.12)]">
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Order Reference</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-right">Shopify Net Due</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-right">Bank Settled Inflow</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-right">variance Offset</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-center" style={{ width: '180px' }}>Recon Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#888888] text-xs">
                    No orders found matching this filter condition.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  // Style based on reconciliation status
                  let statusBadgeStyle = 'bg-gray-100 text-[#888888]';
                  let statusIcon = <HelpCircle size={12} />;
                  let rowStyle = idx % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F2]/50';

                  if (item.status === 'Fully Matched') {
                    statusBadgeStyle = 'bg-green-50 text-[#00C853] border border-green-200';
                    statusIcon = <CheckCircle size={12} />;
                  } else if (item.status === 'Minor Variance') {
                    statusBadgeStyle = 'bg-green-50/50 text-[#00C853] border border-green-100';
                    statusIcon = <CheckCircle size={12} />;
                  } else if (item.status === 'Bank Missing') {
                    statusBadgeStyle = 'bg-yellow-50 text-yellow-800 border border-yellow-200';
                    statusIcon = <AlertTriangle size={12} />;
                  } else if (item.status === 'Discrepancy') {
                    statusBadgeStyle = 'bg-red-50 text-[#D32F2F] border border-red-200';
                    statusIcon = <AlertTriangle size={12} />;
                    rowStyle = 'bg-[rgba(211,47,47,0.04)] hover:bg-[rgba(211,47,47,0.06)]'; // Highlight breach row!
                  }

                  return (
                    <tr 
                      key={item.orderId}
                      className={`border-b border-[#E8E8E6] transition-colors ${rowStyle}`}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-xs text-[#051C2C]">
                        {item.orderId}
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-mono font-medium text-[#051C2C]">
                        {formatCurrency(item.shopifyNet)}
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-mono text-[#051C2C]">
                        {item.bankSettled === 0 ? (
                          <span className="text-[#888888] italic">Unreceived</span>
                        ) : (
                          formatCurrency(item.bankSettled)
                        )}
                      </td>
                      <td className={`px-6 py-4 text-right text-xs font-mono font-semibold ${
                        item.variance === 0 
                          ? 'text-[#888888]' 
                          : item.status === 'Discrepancy' 
                            ? 'text-[#D32F2F]' 
                            : 'text-[#051C2C]'
                      }`}>
                        {item.variance === 0 ? '-' : formatCurrency(item.variance)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold ${statusBadgeStyle}`}>
                          {statusIcon}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
