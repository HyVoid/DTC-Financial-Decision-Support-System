/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryPurchase } from '../types';
import { Package, Plus, Trash2, Calendar, Info } from 'lucide-react';
import { formatCurrency, addWeeksToDate } from '../utils';
import CSVImporter from './CSVImporter';

interface InventoryPurchasesViewProps {
  purchases: InventoryPurchase[];
  onAddPurchase: (purchase: Omit<InventoryPurchase, 'id'>) => void;
  onUpdatePurchaseStatus: (id: string, status: 'Planned' | 'Prepaid' | 'Completed') => void;
  onDeletePurchase: (id: string) => void;
  onBulkImport: (rows: string[][]) => void;
}

export default function InventoryPurchasesView({ purchases, onAddPurchase, onUpdatePurchaseStatus, onDeletePurchase, onBulkImport }: InventoryPurchasesViewProps) {
  const [poReference, setPoReference] = useState('');
  const [totalOrderCost, setTotalOrderCost] = useState('');
  const [prepaymentPercent, setPrepaymentPercent] = useState('30');
  const [leadTimeWeeks, setLeadTimeWeeks] = useState('4');
  const [estPrepayDate, setEstPrepayDate] = useState('2026-07-10');
  const [status, setStatus] = useState<'Planned' | 'Prepaid' | 'Completed'>('Planned');
  const [showImporter, setShowImporter] = useState(false);

  // Maximum order cost for relative inline data bar
  const maxVal = purchases.reduce((max, p) => Math.max(max, p.totalOrderCost), 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poReference.trim() || !totalOrderCost.trim()) return;
    onAddPurchase({
      poReference: poReference.trim(),
      totalOrderCost: parseFloat(totalOrderCost) || 0,
      prepaymentPercent: parseFloat(prepaymentPercent) || 0,
      leadTimeWeeks: parseInt(leadTimeWeeks) || 0,
      estPrepayDate,
      status
    });
    setPoReference('');
    setTotalOrderCost('');
  };

  const handleCSVImport = (parsedRows: string[][]) => {
    onBulkImport(parsedRows);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="heading-eb text-2xl text-[#051C2C] font-semibold flex items-center gap-2">
            <Package className="text-[#2251FF]" size={22} />
            Inventory Procurements & PO Plans (Inventory_Purchases)
          </h2>
          <p className="text-[#888888] text-xs mt-1">
            Purchase Orders (PO) for inventory manufacturing. Tracks both upfront prepayments and final delivery settlements.
          </p>
        </div>

        <button
          id="toggle-purchases-importer-btn"
          onClick={() => setShowImporter(!showImporter)}
          className="px-4 py-2 border border-[#E8E8E6] text-[#051C2C] hover:border-[#051C2C] rounded-[10px] text-xs font-semibold transition-colors"
        >
          {showImporter ? 'Hide Importer' : 'Bulk CSV Import'}
        </button>
      </div>

      {showImporter && (
        <CSVImporter
          title="Inventory Purchases"
          expectedHeaders={['PO Reference', 'Total Cost', 'Prepayment %', 'Lead Time', 'Est Prepay Date', 'Status']}
          onImport={handleCSVImport}
        />
      )}

      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-[14px] shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">PO Ref</label>
          <input
            id="po-ref-input"
            type="text"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            placeholder="PO-2026-05"
            value={poReference}
            onChange={(e) => setPoReference(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Total Cost (USD)</label>
          <input
            id="po-cost-input"
            type="number"
            step="0.01"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            placeholder="25000.00"
            value={totalOrderCost}
            onChange={(e) => setTotalOrderCost(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Prepay %</label>
          <input
            id="po-prepay-percent-input"
            type="number"
            min="0"
            max="100"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            value={prepaymentPercent}
            onChange={(e) => setPrepaymentPercent(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Lead Weeks</label>
          <input
            id="po-lead-time-input"
            type="number"
            min="0"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            value={leadTimeWeeks}
            onChange={(e) => setLeadTimeWeeks(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[130px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Est Prepay Date</label>
          <input
            id="po-prepay-date-input"
            type="date"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            value={estPrepayDate}
            onChange={(e) => setEstPrepayDate(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">PO Status</label>
          <select
            id="po-status-select"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="Planned">Planned</option>
            <option value="Prepaid">Prepaid</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <button
          id="po-add-btn"
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
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">PO Ref</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Prepay Date</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Calculated Final Date</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Lead Time</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-center" style={{ width: '130px' }}>Status</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-right" style={{ width: '280px' }}>Total Cost & Allocation</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-center" style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[#888888] text-xs">
                    No active Purchase Orders found. Create a PO or bulk import a CSV.
                  </td>
                </tr>
              ) : (
                purchases.map((purchase, idx) => {
                  const pct = Math.min(100, Math.max(0, (purchase.totalOrderCost / maxVal) * 100));
                  const prepayAmt = purchase.totalOrderCost * (purchase.prepaymentPercent / 100);
                  const finalAmt = purchase.totalOrderCost * (1 - purchase.prepaymentPercent / 100);
                  const finalDate = addWeeksToDate(purchase.estPrepayDate, purchase.leadTimeWeeks);

                  return (
                    <tr 
                      key={purchase.id}
                      className={`border-b border-[#E8E8E6] hover:bg-gray-50/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F2]/50'
                      }`}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-xs text-[#051C2C]">
                        {purchase.poReference}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-[#888888]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {purchase.estPrepayDate}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-[#888888]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {finalDate}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-[#051C2C]">
                        {purchase.leadTimeWeeks} weeks
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          id={`select-po-status-${purchase.id}`}
                          className="px-2.5 py-1 text-xs border border-[#E8E8E6] rounded-[6px] text-[#051C2C] bg-[#FFFDE7]"
                          value={purchase.status}
                          onChange={(e) => onUpdatePurchaseStatus(purchase.id, e.target.value as any)}
                        >
                          <option value="Planned">Planned</option>
                          <option value="Prepaid">Prepaid</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-block w-full">
                          <div className="text-xs font-mono font-semibold text-[#051C2C] mb-0.5">
                            {formatCurrency(purchase.totalOrderCost)}
                          </div>
                          <div className="text-[10px] text-[#888888] font-mono mb-1">
                            {purchase.prepaymentPercent}% Prepay: {formatCurrency(prepayAmt)} / Bal: {formatCurrency(finalAmt)}
                          </div>
                          {/* Inline Magnitude Data Bar */}
                          <div 
                            className="w-full h-1.5 rounded-full overflow-hidden" 
                            style={{ backgroundColor: 'rgba(5, 12, 44, 0.10)' }}
                            title={`${pct.toFixed(1)}% of max PO`}
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
                          id={`delete-po-${purchase.id}`}
                          onClick={() => onDeletePurchase(purchase.id)}
                          className="p-1.5 text-red-100 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete PO"
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
