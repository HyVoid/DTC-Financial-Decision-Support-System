/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SystemParameter } from '../types';
import { Settings, Info } from 'lucide-react';
import { formatCurrency } from '../utils';

interface ParametersViewProps {
  parameters: SystemParameter[];
  onUpdate: (id: string, value: number) => void;
}

export default function ParametersView({ parameters, onUpdate }: ParametersViewProps) {
  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="heading-eb text-2xl text-[#051C2C] font-semibold flex items-center gap-2">
            <Settings className="text-[#2251FF]" size={22} />
            System Parameters Configuration (参数表)
          </h2>
          <p className="text-[#888888] text-xs mt-1">
            Maintain critical operating parameters. All formulas and forecasting engines recalculate live on change.
          </p>
        </div>
      </div>

      <div className="insight-box flex gap-3 items-start">
        <Info className="text-[#2251FF] shrink-0 mt-0.5" size={16} />
        <div className="text-xs text-[#051C2C]">
          <strong className="font-semibold block mb-1">Spreadsheet Guidelines:</strong>
          These represent the single point of control for calculations. Avoid hardcoding exchange rates, opex assumptions, or cash reserve targets within calculations. Standard editable fields are highlighted in <span className="bg-[#FFFDE7] px-1 py-0.5 border border-yellow-200 text-yellow-800 rounded font-medium">soft yellow</span>.
        </div>
      </div>

      <div className="bg-white rounded-[14px] shadow-sm overflow-hidden border-b border-[#E8E8E6]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[rgba(5,28,44,0.04)] border-b border-[rgba(5,28,44,0.12)]">
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Parameter Name</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Variable Key</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-right" style={{ width: '180px' }}>Value</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Description</th>
              </tr>
            </thead>
            <tbody>
              {parameters.map((param, index) => (
                <tr 
                  key={param.id} 
                  className={`border-b border-[#E8E8E6] transition-colors hover:bg-gray-50/50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F2]/50'
                  }`}
                >
                  <td className="px-6 py-4 font-semibold text-[#051C2C] text-xs">
                    {param.name}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-[#888888]">
                    {param.id.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[#888888] text-xs">
                        {param.id === 'param_usd_rate' ? '×' : '$'}
                      </span>
                      <input
                        id={`input-${param.id}`}
                        type="number"
                        step={param.id === 'param_usd_rate' ? '0.01' : '100'}
                        className="interactive-input w-28 px-3 py-1.5 rounded-[6px] text-right text-xs font-mono text-[#051C2C]"
                        value={param.value}
                        onChange={(e) => onUpdate(param.id, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#888888] text-xs max-w-sm">
                    {param.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
