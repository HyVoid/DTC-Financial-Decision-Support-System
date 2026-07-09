/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Settings, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  ShoppingBag, 
  Landmark, 
  FileText, 
  Megaphone, 
  Package, 
  Activity,
  ShieldQuestion
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onSetTab: (tab: string) => void;
  lastSaved: string;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}

export default function Header({
  activeTab,
  onSetTab,
  lastSaved,
  onExport,
  onImport,
  onReset
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity size={14} /> },
    { id: 'forecast', label: 'Forecast', icon: <TrendingUp size={14} /> },
    { id: 'simulator', label: 'PO Simulator', icon: <ShieldQuestion size={14} /> },
    { id: 'reconciliation', label: 'Rec Engine', icon: <ShieldCheck size={14} /> },
    { id: 'paymentReview', label: 'Pay Review', icon: <ShieldAlert size={14} /> },
    { id: 'shopify', label: 'Shopify Sales', icon: <ShoppingBag size={14} /> },
    { id: 'bank', label: 'Bank Flow', icon: <Landmark size={14} /> },
    { id: 'invoices', label: 'Invoices', icon: <FileText size={14} /> },
    { id: 'purchases', label: 'Purchases', icon: <Package size={14} /> },
    { id: 'marketing', label: 'Ad Spend', icon: <Megaphone size={14} /> },
    { id: 'parameters', label: 'Parameters', icon: <Settings size={14} /> }
  ];

  return (
    <header className="sticky top-0 z-50 w-full h-[56px] bg-white border-b border-[#E0E0E0] shadow-nav flex items-center justify-between px-6">
      
      {/* Brand Identification */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-[8px] bg-[#051C2C] flex items-center justify-center text-white shadow-sm">
          <Database size={16} />
        </div>
        <div className="hidden sm:block">
          <h1 className="heading-eb text-base font-bold text-[#051C2C] tracking-tight leading-none">FDSS</h1>
          <span className="text-[9px] text-[#888888] font-mono leading-none tracking-wider">DTC Finance Desk</span>
        </div>
      </div>

      {/* Center Tabs: Scrollable spreadsheet tabs switcher */}
      <div className="flex-1 max-w-[800px] h-full overflow-x-auto no-scrollbar mx-5">
        <div className="flex items-center h-full gap-5">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onSetTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-1 h-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive 
                    ? 'text-[#051C2C]' 
                    : 'text-[#888888] hover:text-[#051C2C]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2251FF]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Controls: Auto-save, Backups, and Reset */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Autosave timestamp */}
        <div className="hidden md:flex flex-col items-end text-right">
          <span className="text-[9px] uppercase tracking-wider text-[#888888] font-bold">Auto-Saved</span>
          <span id="last-saved-indicator" className="text-[10px] font-mono font-semibold text-[#051C2C]">
            {lastSaved || 'Saved'}
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#E0E0E0] hidden md:block" />

        {/* Backups Panel */}
        <div className="flex items-center gap-1.5">
          <button
            id="export-backup-btn"
            onClick={onExport}
            className="p-2 text-[#051C2C] hover:bg-gray-100 rounded-[8px] transition-colors"
            title="Export JSON Backup"
          >
            <Download size={14} />
          </button>

          <button
            id="trigger-import-btn"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[#051C2C] hover:bg-gray-100 rounded-[8px] transition-colors"
            title="Import JSON Backup"
          >
            <Upload size={14} />
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              className="hidden"
              onChange={onImport}
            />
          </button>

          <button
            id="reset-data-btn"
            onClick={onReset}
            className="p-2 text-[#D32F2F] hover:bg-red-50 rounded-[8px] transition-colors"
            title="Reset to Factory Seed Data"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
