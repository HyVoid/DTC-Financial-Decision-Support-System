/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AccountingInvoice, PaymentReviewItem } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils';

interface PaymentReviewViewProps {
  invoices: AccountingInvoice[];
  onUpdateInvoiceStatus: (id: string, status: 'Pending' | 'Approved' | 'Paid') => void;
}

export default function PaymentReviewView({ invoices, onUpdateInvoiceStatus }: PaymentReviewViewProps) {
  
  // Custom smart auditing algorithm to spot duplicate invoice references and payment matching
  const auditItems: PaymentReviewItem[] = invoices.map(inv => {
    let trigger = 'Good';
    let status: PaymentReviewItem['status'] = 'Pending';

    // 1. Check for exact duplicate invoice number
    const dupInvoiceNo = invoices.some(other => 
      other.id !== inv.id && 
      other.invoiceNo.trim().toLowerCase() === inv.invoiceNo.trim().toLowerCase() &&
      inv.invoiceNo.trim() !== ''
    );

    // 2. Check for exact same Vendor AND Amount within a 7-day period (potential double entry)
    const dupVendorAmount = invoices.some(other => {
      if (other.id === inv.id) return false;
      if (other.vendor.trim().toLowerCase() !== inv.vendor.trim().toLowerCase()) return false;
      if (other.amount !== inv.amount) return false;
      
      // Compute absolute day difference
      const diffTime = Math.abs(new Date(other.date).getTime() - new Date(inv.date).getTime());
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });

    if (dupInvoiceNo) {
      trigger = '⚠️ DUPLICATE INVOICE NUMBER: Potential Double Settlement';
      status = 'Flagged';
    } else if (dupVendorAmount) {
      trigger = '⚠️ SUSPICIOUS REPETITIVE TRANSACTION: Same Vendor, Same Amount within 7 days';
      status = 'Flagged';
    } else if (inv.status === 'Paid') {
      status = 'Cleared';
    }

    return {
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      vendor: inv.vendor,
      amount: inv.amount,
      trigger,
      status
    };
  });

  // Filter out the risk flags for the main section
  const riskFlags = auditItems.filter(item => item.status === 'Flagged');
  const safeItems = auditItems.filter(item => item.status !== 'Flagged');

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h2 className="heading-eb text-2xl text-[#051C2C] font-semibold flex items-center gap-2">
          <ShieldAlert className="text-[#2251FF]" size={22} />
          Accounts Payable Audit Room (Payment_Review)
        </h2>
        <p className="text-[#888888] text-xs mt-1">
          Automated double-billing interceptor. Cross-references vendor, invoice, date, and currency amounts to catch fraud or clerical errors.
        </p>
      </div>

      {/* Flagged Risks Section */}
      <div className="bg-white p-6 rounded-[14px] shadow-sm">
        <h3 className="heading-eb text-lg text-[#051C2C] mb-4 flex items-center gap-2 font-semibold">
          <AlertTriangle className="text-[#D32F2F]" size={20} />
          Active Double-Payment Risks Detected ({riskFlags.length})
        </h3>

        {riskFlags.length === 0 ? (
          <div className="bg-green-50 text-[#00C853] p-4 rounded-[10px] text-xs flex items-center gap-2 font-medium">
            <CheckCircle size={16} />
            No duplicate invoice numbers or identical vendor-amount overlaps detected. All vouchers are secure for payout.
          </div>
        ) : (
          <div className="space-y-4">
            {riskFlags.map(item => (
              <div 
                key={item.id} 
                className="p-4 bg-[rgba(211,47,47,0.04)] border-l-4 border-[#D32F2F] rounded-r-[10px] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-transform hover:scale-[1.01]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-red-100 text-[#D32F2F] px-2 py-0.5 rounded">
                      {item.invoiceNo}
                    </span>
                    <span className="text-xs font-semibold text-[#051C2C]">
                      {item.vendor} — {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <p className="text-[#D32F2F] font-semibold text-xs">{item.trigger}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id={`btn-approve-audit-${item.id}`}
                    onClick={() => onUpdateInvoiceStatus(item.id, 'Approved')}
                    className="px-3 py-1.5 bg-white border border-[#E8E8E6] text-[#051C2C] hover:border-[#051C2C] text-xs font-semibold rounded-[8px] transition-colors"
                  >
                    Clear For Payment
                  </button>
                  <button
                    id={`btn-markpaid-audit-${item.id}`}
                    onClick={() => onUpdateInvoiceStatus(item.id, 'Paid')}
                    className="px-3 py-1.5 bg-[#051C2C] hover:bg-opacity-90 text-white text-xs font-semibold rounded-[8px] transition-all"
                  >
                    Force Paid Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* General Vouchers Under Review */}
      <div className="bg-white rounded-[14px] shadow-sm overflow-hidden border-b border-[#E8E8E6]">
        <div className="p-5 border-b border-[#E8E8E6]">
          <h3 className="heading-eb text-md text-[#051C2C] font-semibold">General Vouchers Under Audit</h3>
          <p className="text-[#888888] text-xs">Standard operational invoices parsed with zero duplicate alerts.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[rgba(5,28,44,0.04)] border-b border-[rgba(5,28,44,0.12)]">
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Invoice ID</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Supplier Name</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-right">Invoice Amount</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-center" style={{ width: '180px' }}>Audit Status</th>
              </tr>
            </thead>
            <tbody>
              {safeItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#888888] text-xs">
                    All items are currently flagged or no invoice vouchers exist.
                  </td>
                </tr>
              ) : (
                safeItems.map((item, idx) => (
                  <tr 
                    key={item.id}
                    className={`border-b border-[#E8E8E6] hover:bg-gray-50/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F2]/50'
                    }`}
                  >
                    <td className="px-6 py-4 font-mono font-medium text-xs text-[#051C2C]">
                      {item.invoiceNo}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-[#051C2C]">
                      {item.vendor}
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-mono font-medium text-[#051C2C]">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold ${
                        item.status === 'Cleared' 
                          ? 'bg-green-50 text-[#00C853]' 
                          : 'bg-blue-50 text-[#2251FF]'
                      }`}>
                        {item.status === 'Cleared' ? (
                          <CheckCircle size={10} />
                        ) : (
                          <HelpCircle size={10} />
                        )}
                        {item.status === 'Cleared' ? 'Fully Cleared (Paid)' : 'Awaiting Audit'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
