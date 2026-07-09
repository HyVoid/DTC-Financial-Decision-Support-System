/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AdvertisingSpend } from '../types';
import { Megaphone, Plus, Trash2, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils';
import CSVImporter from './CSVImporter';

interface AdvertisingSpendViewProps {
  adSpend: AdvertisingSpend[];
  onAddSpend: (spend: Omit<AdvertisingSpend, 'id'>) => void;
  onDeleteSpend: (id: string) => void;
  onBulkImport: (rows: string[][]) => void;
}

export default function AdvertisingSpendView({ adSpend, onAddSpend, onDeleteSpend, onBulkImport }: AdvertisingSpendViewProps) {
  const [channel, setChannel] = useState('Facebook Ads');
  const [date, setDate] = useState('2026-07-07');
  const [cost, setCost] = useState('');
  const [showImporter, setShowImporter] = useState(false);

  // Maximum value for inline data bars
  const maxVal = adSpend.reduce((max, s) => Math.max(max, s.cost), 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cost.trim()) return;
    onAddSpend({
      channel,
      date,
      cost: parseFloat(cost) || 0
    });
    setCost('');
  };

  const handleCSVImport = (parsedRows: string[][]) => {
    onBulkImport(parsedRows);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="heading-eb text-2xl text-[#051C2C] font-semibold flex items-center gap-2">
            <Megaphone className="text-[#2251FF]" size={22} />
            Advertising Campaigns & Ad Spend (Advertising_Spend)
          </h2>
          <p className="text-[#888888] text-xs mt-1">
            Track daily advertising spends across social channels. This feeds directly into the rolling Weekly Cash Outflows.
          </p>
        </div>

        <button
          id="toggle-ad-importer-btn"
          onClick={() => setShowImporter(!showImporter)}
          className="px-4 py-2 border border-[#E8E8E6] text-[#051C2C] hover:border-[#051C2C] rounded-[10px] text-xs font-semibold transition-colors"
        >
          {showImporter ? 'Hide Importer' : 'Bulk CSV Import'}
        </button>
      </div>

      {showImporter && (
        <CSVImporter
          title="Advertising Spend"
          expectedHeaders={['Channel', 'Date', 'Cost']}
          onImport={handleCSVImport}
        />
      )}

      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-[14px] shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Marketing Channel</label>
          <select
            id="ad-channel-select"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="Google Ads">Google Ads</option>
            <option value="TikTok Ads">TikTok Ads</option>
            <option value="Pinterest Ads">Pinterest Ads</option>
            <option value="Snapchat Ads">Snapchat Ads</option>
            <option value="Affiliate Network">Affiliate Network</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Log Date</label>
          <input
            id="ad-date-input"
            type="date"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[#888888] text-[11px] font-semibold uppercase mb-1.5">Cost Cost (USD)</label>
          <input
            id="ad-cost-input"
            type="number"
            step="0.01"
            className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
            placeholder="500.00"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
          />
        </div>
        <button
          id="ad-add-btn"
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
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Channel</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Date</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-right" style={{ width: '320px' }}>Daily Cost</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-center" style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adSpend.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-[#888888] text-xs">
                    No marketing campaign records found. Bulk import or insert spend lines above.
                  </td>
                </tr>
              ) : (
                adSpend.map((spend, idx) => {
                  const pct = Math.min(100, Math.max(0, (spend.cost / maxVal) * 100));

                  return (
                    <tr 
                      key={spend.id}
                      className={`border-b border-[#E8E8E6] hover:bg-gray-50/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F2]/50'
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-[#051C2C] text-xs">
                        {spend.channel}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-[#888888]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {spend.date}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-block w-full">
                          <div className="text-xs font-mono font-semibold text-[#051C2C] mb-1">
                            {formatCurrency(spend.cost)}
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
                          id={`delete-ad-${spend.id}`}
                          onClick={() => onDeleteSpend(spend.id)}
                          className="p-1.5 text-red-100 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Record"
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
