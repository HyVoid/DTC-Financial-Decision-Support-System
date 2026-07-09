/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BankTransaction } from '../types';
import { Landmark, Plus, Trash2, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency } from '../utils';
import CSVImporter from './CSVImporter';

interface BankTransactionsViewProps {
  transactions: BankTransaction[];
  onAddTransaction: (tx: Omit<BankTransaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onBulkImport: (rows: string[][]) => void;
}

export default function BankTransactionsView({ transactions, onAddTransaction, onDeleteTransaction, onBulkImport }: BankTransactionsViewProps) {
  const [referenceId, setReferenceId] = useState('');
  const [date, setDate] = useState('2026-07-07');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showImporter, setShowImporter] = useState(false);

  // For inline data bars, use the absolute value max
  const maxVal = transactions.reduce((max, t) => Math.max(max, Math.abs(t.amount)), 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount.trim() || !description.trim()) return;
    onAddTransaction({
      referenceId: referenceId.trim(),
      date,
      amount: parseFloat(amount) || 0,
      description: description.trim()
    });
    setReferenceId('');
    setAmount('');
    setDescription('');
  };

  const handleCSVImport = (parsedRows: string[][]) => {
    onBulkImport(parsedRows);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="heading-eb text-2xl text-[#051C2C] font-semibold flex items-center gap-2">
            <Landmark className="text-[#2251FF]" size={22} />
            Bank Flow & Cash Ledger (Bank_Transactions)
          </h2>
          <p className="text-[#888888] text-xs mt-1">
            Real-world bank statement line items. This includes PayPal transfers, wire vendor bills, and credit card settlements.
          </p>
        </div>

        <button
          id="toggle-bank-importer-btn"
          onClick={() => setShowImporter(!showImporter)}
          className="px-4 py-2 border border-[#E8E8E6] text-[#051C2C] hover:border-[#051C2C] rounded-[10px] text-xs font-semibold transition-colors"
        >
          {showImporter ? 'Hide Importer' : 'Bulk CSV Import'}
        </button>
      </div>

      {showImporter && (
        <CSVImporter
          title="Bank Transactions"
          expectedHeaders={['Reference ID', 'Date', 'Amount', 'Description']}
          onImport={handleCSVImport}
        />
      )}

      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-[14px] shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Reference ID (Match Key)</label>
          <input
            id="bank-ref-input"
            type="text"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            placeholder="SH-1010 or INV-99"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Post Date</label>
          <input
            id="bank-date-input"
            type="date"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Amount (+ Inflow / - Outflow)</label>
          <input
            id="bank-amount-input"
            type="number"
            step="0.01"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            placeholder="-1500.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="flex-[2] min-w-[200px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Ledger Description</label>
          <input
            id="bank-desc-input"
            type="text"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            placeholder="Facebook Ads Bill #827"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button
          id="bank-add-tx-btn"
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
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Ref Match Key</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Date</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Description</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-right" style={{ width: '320px' }}>Amount</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-center" style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#888888] text-xs">
                    No bank ledger transactions found. Bulk import or use the form to enter records.
                  </td>
                </tr>
              ) : (
                transactions.map((tx, idx) => {
                  const isPositive = tx.amount >= 0;
                  const absAmt = Math.abs(tx.amount);
                  const pct = Math.min(100, Math.max(0, (absAmt / maxVal) * 100));

                  return (
                    <tr 
                      key={tx.id}
                      className={`border-b border-[#E8E8E6] hover:bg-gray-50/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F2]/50'
                      }`}
                    >
                      <td className="px-6 py-4 font-mono font-medium text-xs text-[#051C2C]">
                        {tx.referenceId || <span className="text-[#888888] italic">Unreferenced</span>}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-[#888888]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {tx.date}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-[#051C2C]">
                        {tx.description}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-block w-full">
                          <div className={`text-xs font-mono font-bold flex items-center justify-end gap-1 mb-1 ${
                            isPositive ? 'text-[#051C2C]' : 'text-[#888888]'
                          }`}>
                            {isPositive ? (
                              <ArrowUpRight size={12} className="text-[#00C853]" />
                            ) : (
                              <ArrowDownLeft size={12} className="text-[#D32F2F]" />
                            )}
                            {isPositive ? '+' : '-'}{formatCurrency(absAmt)}
                          </div>
                          {/* Proportional Magnitude Data Bar */}
                          <div 
                            className="w-full h-1.5 rounded-full overflow-hidden" 
                            style={{ backgroundColor: 'rgba(5, 12, 44, 0.10)' }}
                            title={`${pct.toFixed(1)}% of maximum transaction size`}
                          >
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ 
                                width: `${pct}%`,
                                backgroundColor: isPositive ? 'var(--color-primary)' : 'rgba(5, 28, 44, 0.50)'
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          id={`delete-bank-tx-${tx.id}`}
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 text-red-100 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Bank Record"
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
