/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AccountingInvoice } from '../types';
import { FileText, Plus, Trash2, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils';
import CSVImporter from './CSVImporter';

interface AccountingInvoicesViewProps {
  invoices: AccountingInvoice[];
  onAddInvoice: (inv: Omit<AccountingInvoice, 'id'>) => void;
  onUpdateInvoiceStatus: (id: string, status: 'Pending' | 'Approved' | 'Paid') => void;
  onDeleteInvoice: (id: string) => void;
  onBulkImport: (rows: string[][]) => void;
}

export default function AccountingInvoicesView({ invoices, onAddInvoice, onUpdateInvoiceStatus, onDeleteInvoice, onBulkImport }: AccountingInvoicesViewProps) {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState('2026-07-07');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'Pending' | 'Approved' | 'Paid'>('Pending');
  const [showImporter, setShowImporter] = useState(false);

  // Maximum value for inline data bars
  const maxVal = invoices.reduce((max, i) => Math.max(max, i.amount), 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNo.trim() || !vendor.trim() || !amount.trim()) return;
    onAddInvoice({
      invoiceNo: invoiceNo.trim(),
      date,
      vendor: vendor.trim(),
      amount: parseFloat(amount) || 0,
      status
    });
    setInvoiceNo('');
    setVendor('');
    setAmount('');
    setStatus('Pending');
  };

  const handleCSVImport = (parsedRows: string[][]) => {
    onBulkImport(parsedRows);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="heading-eb text-2xl text-[#051C2C] font-semibold flex items-center gap-2">
            <FileText className="text-[#2251FF]" size={22} />
            Overhead Invoices & General Ledger (Accounting_Data)
          </h2>
          <p className="text-[#888888] text-xs mt-1">
            Accounts payable records, including software bills, logistics partners, and office leases.
          </p>
        </div>

        <button
          id="toggle-invoice-importer-btn"
          onClick={() => setShowImporter(!showImporter)}
          className="px-4 py-2 border border-[#E8E8E6] text-[#051C2C] hover:border-[#051C2C] rounded-[10px] text-xs font-semibold transition-colors"
        >
          {showImporter ? 'Hide Importer' : 'Bulk CSV Import'}
        </button>
      </div>

      {showImporter && (
        <CSVImporter
          title="Accounting Invoices"
          expectedHeaders={['Invoice No', 'Date', 'Vendor', 'Amount', 'Status']}
          onImport={handleCSVImport}
        />
      )}

      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-[14px] shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Invoice No</label>
          <input
            id="invoice-no-input"
            type="text"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            placeholder="INV-2026-95"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[130px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Invoice Date</label>
          <input
            id="invoice-date-input"
            type="date"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="flex-[1.5] min-w-[160px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Vendor Name</label>
          <input
            id="invoice-vendor-input"
            type="text"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            placeholder="Logistics Partner Ltd"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Amount (USD)</label>
          <input
            id="invoice-amount-input"
            type="number"
            step="0.01"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            placeholder="1200.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Invoice Status</label>
          <select
            id="invoice-status-select"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
        <button
          id="invoice-add-btn"
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
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Invoice No</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Date</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Vendor</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-center" style={{ width: '130px' }}>Status</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-right" style={{ width: '300px' }}>Amount</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-center" style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#888888] text-xs">
                    No invoice records found. Create an invoice or bulk import a CSV statement.
                  </td>
                </tr>
              ) : (
                invoices.map((inv, idx) => {
                  const pct = Math.min(100, Math.max(0, (inv.amount / maxVal) * 100));

                  return (
                    <tr 
                      key={inv.id}
                      className={`border-b border-[#E8E8E6] hover:bg-gray-50/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F2]/50'
                      }`}
                    >
                      <td className="px-6 py-4 font-mono font-medium text-xs text-[#051C2C]">
                        {inv.invoiceNo}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-[#888888]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {inv.date}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-[#051C2C]">
                        {inv.vendor}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          id={`select-status-${inv.id}`}
                          className="px-2.5 py-1 text-xs border border-[#E8E8E6] rounded-[6px] text-[#051C2C] bg-[#FFFDE7]"
                          value={inv.status}
                          onChange={(e) => onUpdateInvoiceStatus(inv.id, e.target.value as any)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-block w-full">
                          <div className="text-xs font-mono font-semibold text-[#051C2C] mb-1">
                            {formatCurrency(inv.amount)}
                          </div>
                          {/* Inline Magnitude Data Bar */}
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
                          id={`delete-invoice-${inv.id}`}
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="p-1.5 text-red-100 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Invoice"
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
