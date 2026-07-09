/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShopifyOrder } from '../types';
import { ShoppingBag, Plus, Trash2, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils';
import CSVImporter from './CSVImporter';

interface ShopifyViewProps {
  orders: ShopifyOrder[];
  onAddOrder: (order: Omit<ShopifyOrder, 'id'>) => void;
  onDeleteOrder: (id: string) => void;
  onBulkImport: (rows: string[][]) => void;
}

export default function ShopifyView({ orders, onAddOrder, onDeleteOrder, onBulkImport }: ShopifyViewProps) {
  const [orderId, setOrderId] = useState('');
  const [date, setDate] = useState('2026-07-07');
  const [netPayment, setNetPayment] = useState('');
  const [showImporter, setShowImporter] = useState(false);

  // Find max value for inline data bars
  const maxVal = orders.reduce((max, o) => Math.max(max, o.netPayment), 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !netPayment.trim()) return;
    onAddOrder({
      orderId: orderId.trim(),
      date,
      netPayment: parseFloat(netPayment) || 0
    });
    setOrderId('');
    setNetPayment('');
  };

  const handleCSVImport = (parsedRows: string[][]) => {
    onBulkImport(parsedRows);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="heading-eb text-2xl text-[#051C2C] font-semibold flex items-center gap-2">
            <ShoppingBag className="text-[#2251FF]" size={22} />
            Shopify Sales & Receivables (Shopify_Data)
          </h2>
          <p className="text-[#888888] text-xs mt-1">
            Store payouts, orders, and net payment settlements. This database feeds into the Reconciliation Engine and Cash Projections.
          </p>
        </div>

        <button
          id="toggle-shopify-importer-btn"
          onClick={() => setShowImporter(!showImporter)}
          className="px-4 py-2 border border-[#E8E8E6] text-[#051C2C] hover:border-[#051C2C] rounded-[10px] text-xs font-semibold transition-colors"
        >
          {showImporter ? 'Hide Importer' : 'Bulk CSV Import'}
        </button>
      </div>

      {showImporter && (
        <CSVImporter
          title="Shopify Data"
          expectedHeaders={['Order ID', 'Date', 'Net Payment']}
          onImport={handleCSVImport}
        />
      )}

      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-[14px] shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Order ID</label>
          <input
            id="shopify-order-id-input"
            type="text"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            placeholder="SH-1010"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Order Date</label>
          <input
            id="shopify-order-date-input"
            type="date"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Net Payment (USD)</label>
          <input
            id="shopify-net-payment-input"
            type="number"
            step="0.01"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            placeholder="250.00"
            value={netPayment}
            onChange={(e) => setNetPayment(e.target.value)}
            required
          />
        </div>
        <button
          id="shopify-add-order-btn"
          type="submit"
          className="px-5 py-2.5 bg-[#051C2C] hover:bg-opacity-90 text-white rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
        >
          <Plus size={14} />
          Add Row
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-[14px] shadow-sm overflow-hidden border-b border-[#E8E8E6]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[rgba(5,28,44,0.04)] border-b border-[rgba(5,28,44,0.12)]">
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Order ID</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Date</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-right" style={{ width: '320px' }}>Net Payment</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-center" style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-[#888888] text-xs">
                    No sales records found. Upload a CSV or fill in the quick-add form above to begin.
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => {
                  const pct = Math.min(100, Math.max(0, (order.netPayment / maxVal) * 100));
                  return (
                    <tr 
                      key={order.id}
                      className={`border-b border-[#E8E8E6] hover:bg-gray-50/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F2]/50'
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-[#051C2C] text-xs">
                        {order.orderId}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-[#888888]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {order.date}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-block w-full">
                          <div className="text-xs font-mono font-semibold text-[#051C2C] mb-1">
                            {formatCurrency(order.netPayment)}
                          </div>
                          {/* Inline Data Bar */}
                          <div 
                            className="w-full h-1.5 rounded-full overflow-hidden" 
                            style={{ backgroundColor: 'rgba(5, 12, 44, 0.10)' }}
                            title={`${pct.toFixed(1)}% of max`}
                          >
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ 
                                width: `${pct}%`,
                                backgroundColor: 'var(--color-primary)'
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          id={`delete-shopify-${order.id}`}
                          onClick={() => onDeleteOrder(order.id)}
                          className="p-1.5 text-red-100 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Order Record"
                        >
                          <Trash2 size={14} />
                        </button>
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
