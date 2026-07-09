/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ShopifyView from './components/ShopifyView';
import BankTransactionsView from './components/BankTransactionsView';
import AccountingInvoicesView from './components/AccountingInvoicesView';
import AdvertisingSpendView from './components/AdvertisingSpendView';
import InventoryPurchasesView from './components/InventoryPurchasesView';
import ReconciliationView from './components/ReconciliationView';
import PaymentReviewView from './components/PaymentReviewView';
import CashForecastView from './components/CashForecastView';
import SimulatorView from './components/SimulatorView';
import ParametersView from './components/ParametersView';

import { AppState, ShopifyOrder, BankTransaction, AccountingInvoice, AdvertisingSpend, InventoryPurchase } from './types';
import { defaultState } from './defaultData';

const LOCAL_STORAGE_KEY = 'fdss_workspace_state';

export default function App() {
  const [state, setState] = useState<AppState>(defaultState);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [lastSaved, setLastSaved] = useState<string>('');

  // 1. Initial State Load
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Basic validation of fields to ensure backward compatibility
        if (parsed.parameters && parsed.shopifyData && parsed.bankTransactions) {
          setState(parsed);
          const now = new Date();
          setLastSaved(now.toLocaleTimeString('en-US', { hour12: false }));
          return;
        }
      } catch (e) {
        console.error('Failed to parse local storage', e);
      }
    }
    // Default fallback
    setState(defaultState);
    saveState(defaultState);
  }, []);

  // 2. Persist state changes helper
  const saveState = (newState: AppState) => {
    setState(newState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
    const now = new Date();
    setLastSaved(now.toLocaleTimeString('en-US', { hour12: false }));
  };

  // 3. State update handlers
  const handleUpdateParameter = (id: string, value: number) => {
    const updatedParams = state.parameters.map(p => 
      p.id === id ? { ...p, value } : p
    );
    saveState({ ...state, parameters: updatedParams });
  };

  // Shopify Orders Add/Delete/Bulk
  const handleAddShopifyOrder = (order: Omit<ShopifyOrder, 'id'>) => {
    const newOrder: ShopifyOrder = {
      ...order,
      id: `sh_${Math.random().toString(36).substring(2, 9)}`
    };
    saveState({ ...state, shopifyData: [newOrder, ...state.shopifyData] });
  };

  const handleDeleteShopifyOrder = (id: string) => {
    const filtered = state.shopifyData.filter(o => o.id !== id);
    saveState({ ...state, shopifyData: filtered });
  };

  const handleBulkImportShopify = (rows: string[][]) => {
    if (rows.length < 2) return;
    const headers = rows[0].map(h => h.toLowerCase().trim());
    
    // Find index of expected headers
    const orderIdIdx = headers.findIndex(h => h.includes('order id') || h === 'id');
    const dateIdx = headers.findIndex(h => h.includes('date'));
    const netPaymentIdx = headers.findIndex(h => h.includes('net payment') || h.includes('payout') || h.includes('amount'));

    if (orderIdIdx === -1 || dateIdx === -1 || netPaymentIdx === -1) {
      alert('Could not match expected columns: Order ID, Date, and Net Payment.');
      return;
    }

    const imported: ShopifyOrder[] = rows.slice(1).map((row, i) => {
      return {
        id: `sh_import_${i}_${Math.random().toString(36).substring(2, 9)}`,
        orderId: row[orderIdIdx] || `IMPORT-${i}`,
        date: row[dateIdx] || '2026-07-07',
        netPayment: parseFloat((row[netPaymentIdx] || '').replace(/[$,]/g, '')) || 0
      };
    });

    saveState({ ...state, shopifyData: [...imported, ...state.shopifyData] });
  };

  // Bank Transactions Add/Delete/Bulk
  const handleAddBankTransaction = (tx: Omit<BankTransaction, 'id'>) => {
    const newTx: BankTransaction = {
      ...tx,
      id: `bt_${Math.random().toString(36).substring(2, 9)}`
    };
    saveState({ ...state, bankTransactions: [newTx, ...state.bankTransactions] });
  };

  const handleDeleteBankTransaction = (id: string) => {
    const filtered = state.bankTransactions.filter(t => t.id !== id);
    saveState({ ...state, bankTransactions: filtered });
  };

  const handleBulkImportBank = (rows: string[][]) => {
    if (rows.length < 2) return;
    const headers = rows[0].map(h => h.toLowerCase().trim());

    const refIdx = headers.findIndex(h => h.includes('reference id') || h.includes('ref') || h.includes('order id'));
    const dateIdx = headers.findIndex(h => h.includes('date'));
    const amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('money'));
    const descIdx = headers.findIndex(h => h.includes('description') || h.includes('desc'));

    if (dateIdx === -1 || amountIdx === -1 || descIdx === -1) {
      alert('Could not match expected columns: Date, Amount, and Description.');
      return;
    }

    const imported: BankTransaction[] = rows.slice(1).map((row, i) => {
      return {
        id: `bt_import_${i}_${Math.random().toString(36).substring(2, 9)}`,
        referenceId: refIdx !== -1 ? row[refIdx] : '',
        date: row[dateIdx] || '2026-07-07',
        amount: parseFloat((row[amountIdx] || '').replace(/[$,]/g, '')) || 0,
        description: row[descIdx] || 'Imported Transaction'
      };
    });

    saveState({ ...state, bankTransactions: [...imported, ...state.bankTransactions] });
  };

  // Accounting Invoices Add/Update/Delete/Bulk
  const handleAddInvoice = (inv: Omit<AccountingInvoice, 'id'>) => {
    const newInv: AccountingInvoice = {
      ...inv,
      id: `ac_${Math.random().toString(36).substring(2, 9)}`
    };
    saveState({ ...state, accountingInvoices: [newInv, ...state.accountingInvoices] });
  };

  const handleUpdateInvoiceStatus = (id: string, status: 'Pending' | 'Approved' | 'Paid') => {
    const updated = state.accountingInvoices.map(i => 
      i.id === id ? { ...i, status } : i
    );
    saveState({ ...state, accountingInvoices: updated });
  };

  const handleDeleteInvoice = (id: string) => {
    const filtered = state.accountingInvoices.filter(i => i.id !== id);
    saveState({ ...state, accountingInvoices: filtered });
  };

  const handleBulkImportInvoices = (rows: string[][]) => {
    if (rows.length < 2) return;
    const headers = rows[0].map(h => h.toLowerCase().trim());

    const invNoIdx = headers.findIndex(h => h.includes('invoice') || h.includes('no') || h === 'id');
    const dateIdx = headers.findIndex(h => h.includes('date'));
    const vendorIdx = headers.findIndex(h => h.includes('vendor') || h.includes('supplier'));
    const amountIdx = headers.findIndex(h => h.includes('amount'));
    const statusIdx = headers.findIndex(h => h.includes('status'));

    if (invNoIdx === -1 || dateIdx === -1 || vendorIdx === -1 || amountIdx === -1) {
      alert('Could not match expected columns: Invoice No, Date, Vendor, and Amount.');
      return;
    }

    const imported: AccountingInvoice[] = rows.slice(1).map((row, i) => {
      let rawStatus: any = 'Pending';
      if (statusIdx !== -1) {
        const val = (row[statusIdx] || '').trim().toLowerCase();
        if (val === 'paid' || val === 'completed') rawStatus = 'Paid';
        else if (val === 'approved') rawStatus = 'Approved';
      }
      return {
        id: `ac_import_${i}_${Math.random().toString(36).substring(2, 9)}`,
        invoiceNo: row[invNoIdx] || `INV-${i}`,
        date: row[dateIdx] || '2026-07-07',
        vendor: row[vendorIdx] || 'Unknown Vendor',
        amount: parseFloat((row[amountIdx] || '').replace(/[$,]/g, '')) || 0,
        status: rawStatus
      };
    });

    saveState({ ...state, accountingInvoices: [...imported, ...state.accountingInvoices] });
  };

  // Advertising Spend Add/Delete/Bulk
  const handleAddAdSpend = (spend: Omit<AdvertisingSpend, 'id'>) => {
    const newSpend: AdvertisingSpend = {
      ...spend,
      id: `ad_${Math.random().toString(36).substring(2, 9)}`
    };
    saveState({ ...state, advertisingSpend: [newSpend, ...state.advertisingSpend] });
  };

  const handleDeleteAdSpend = (id: string) => {
    const filtered = state.advertisingSpend.filter(s => s.id !== id);
    saveState({ ...state, advertisingSpend: filtered });
  };

  const handleBulkImportAdSpend = (rows: string[][]) => {
    if (rows.length < 2) return;
    const headers = rows[0].map(h => h.toLowerCase().trim());

    const channelIdx = headers.findIndex(h => h.includes('channel') || h.includes('platform'));
    const dateIdx = headers.findIndex(h => h.includes('date'));
    const costIdx = headers.findIndex(h => h.includes('cost') || h.includes('spend'));

    if (channelIdx === -1 || dateIdx === -1 || costIdx === -1) {
      alert('Could not match expected columns: Channel, Date, and Cost.');
      return;
    }

    const imported: AdvertisingSpend[] = rows.slice(1).map((row, i) => {
      return {
        id: `ad_import_${i}_${Math.random().toString(36).substring(2, 9)}`,
        channel: row[channelIdx] || 'General Channel',
        date: row[dateIdx] || '2026-07-07',
        cost: parseFloat((row[costIdx] || '').replace(/[$,]/g, '')) || 0
      };
    });

    saveState({ ...state, advertisingSpend: [...imported, ...state.advertisingSpend] });
  };

  // Inventory Purchases Add/Update/Delete/Bulk
  const handleAddPurchase = (purchase: Omit<InventoryPurchase, 'id'>) => {
    const newPurchase: InventoryPurchase = {
      ...purchase,
      id: `ip_${Math.random().toString(36).substring(2, 9)}`
    };
    saveState({ ...state, inventoryPurchases: [newPurchase, ...state.inventoryPurchases] });
  };

  const handleUpdatePurchaseStatus = (id: string, status: 'Planned' | 'Prepaid' | 'Completed') => {
    const updated = state.inventoryPurchases.map(p => 
      p.id === id ? { ...p, status } : p
    );
    saveState({ ...state, inventoryPurchases: updated });
  };

  const handleDeletePurchase = (id: string) => {
    const filtered = state.inventoryPurchases.filter(p => p.id !== id);
    saveState({ ...state, inventoryPurchases: filtered });
  };

  const handleBulkImportPurchases = (rows: string[][]) => {
    if (rows.length < 2) return;
    const headers = rows[0].map(h => h.toLowerCase().trim());

    const poIdx = headers.findIndex(h => h.includes('po reference') || h.includes('po') || h.includes('ref'));
    const costIdx = headers.findIndex(h => h.includes('total cost') || h.includes('amount') || h.includes('cost'));
    const prepayIdx = headers.findIndex(h => h.includes('prepayment %') || h.includes('prepay'));
    const leadIdx = headers.findIndex(h => h.includes('lead time') || h.includes('weeks'));
    const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('prepay date'));
    const statusIdx = headers.findIndex(h => h.includes('status'));

    if (poIdx === -1 || costIdx === -1 || dateIdx === -1) {
      alert('Could not match expected columns: PO Reference, Total Cost, and Est Prepay Date.');
      return;
    }

    const imported: InventoryPurchase[] = rows.slice(1).map((row, i) => {
      let rawStatus: any = 'Planned';
      if (statusIdx !== -1) {
        const val = (row[statusIdx] || '').trim().toLowerCase();
        if (val === 'completed' || val === 'delivered') rawStatus = 'Completed';
        else if (val === 'prepaid') rawStatus = 'Prepaid';
      }
      return {
        id: `ip_import_${i}_${Math.random().toString(36).substring(2, 9)}`,
        poReference: row[poIdx] || `PO-${i}`,
        totalOrderCost: parseFloat((row[costIdx] || '').replace(/[$,]/g, '')) || 0,
        prepaymentPercent: prepayIdx !== -1 ? parseFloat(row[prepayIdx]) || 30 : 30,
        leadTimeWeeks: leadIdx !== -1 ? parseInt(row[leadIdx]) || 4 : 4,
        estPrepayDate: row[dateIdx] || '2026-07-10',
        status: rawStatus
      };
    });

    saveState({ ...state, inventoryPurchases: [...imported, ...state.inventoryPurchases] });
  };

  // 4. Backup Operations
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute("download", `fdss_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.parameters && parsed.shopifyData && parsed.bankTransactions) {
          saveState(parsed);
          alert('Backup database imported successfully! All ledger records have been updated.');
        } else {
          alert('Invalid backup schema. Required variables or tables are missing.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  const handleResetData = () => {
    if (window.confirm('Are you absolutely sure you want to reset all current spreadsheets? This will overwrite existing records with high-fidelity default seed data.')) {
      saveState(defaultState);
    }
  };

  // 5. Active workspace sheet router
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            parameters={state.parameters}
            shopifyData={state.shopifyData}
            bankTransactions={state.bankTransactions}
            accountingInvoices={state.accountingInvoices}
            inventoryPurchases={state.inventoryPurchases}
            advertisingSpend={state.advertisingSpend}
            onSetTab={setActiveTab}
          />
        );
      case 'forecast':
        return (
          <CashForecastView
            parameters={state.parameters}
            shopifyData={state.shopifyData}
            bankTransactions={state.bankTransactions}
            inventoryPurchases={state.inventoryPurchases}
            advertisingSpend={state.advertisingSpend}
          />
        );
      case 'simulator':
        return (
          <SimulatorView
            parameters={state.parameters}
            shopifyData={state.shopifyData}
            bankTransactions={state.bankTransactions}
            inventoryPurchases={state.inventoryPurchases}
            advertisingSpend={state.advertisingSpend}
          />
        );
      case 'reconciliation':
        return (
          <ReconciliationView
            orders={state.shopifyData}
            transactions={state.bankTransactions}
          />
        );
      case 'paymentReview':
        return (
          <PaymentReviewView
            invoices={state.accountingInvoices}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
          />
        );
      case 'shopify':
        return (
          <ShopifyView
            orders={state.shopifyData}
            onAddOrder={handleAddShopifyOrder}
            onDeleteOrder={handleDeleteShopifyOrder}
            onBulkImport={handleBulkImportShopify}
          />
        );
      case 'bank':
        return (
          <BankTransactionsView
            transactions={state.bankTransactions}
            onAddTransaction={handleAddBankTransaction}
            onDeleteTransaction={handleDeleteBankTransaction}
            onBulkImport={handleBulkImportBank}
          />
        );
      case 'invoices':
        return (
          <AccountingInvoicesView
            invoices={state.accountingInvoices}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onDeleteInvoice={handleDeleteInvoice}
            onBulkImport={handleBulkImportInvoices}
          />
        );
      case 'purchases':
        return (
          <InventoryPurchasesView
            purchases={state.inventoryPurchases}
            onAddPurchase={handleAddPurchase}
            onUpdatePurchaseStatus={handleUpdatePurchaseStatus}
            onDeletePurchase={handleDeletePurchase}
            onBulkImport={handleBulkImportPurchases}
          />
        );
      case 'marketing':
        return (
          <AdvertisingSpendView
            adSpend={state.advertisingSpend}
            onAddSpend={handleAddAdSpend}
            onDeleteSpend={handleDeleteAdSpend}
            onBulkImport={handleBulkImportAdSpend}
          />
        );
      case 'parameters':
        return (
          <ParametersView
            parameters={state.parameters}
            onUpdate={handleUpdateParameter}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F2] flex flex-col">
      
      {/* 56px sticky top navbar */}
      <Header
        activeTab={activeTab}
        onSetTab={setActiveTab}
        lastSaved={lastSaved}
        onExport={handleExportBackup}
        onImport={handleImportBackup}
        onReset={handleResetData}
      />

      {/* Main Workspace Frame (Centered with Max Width 1400px and 40px left-right padding) */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-10 py-10">
        <div className="w-full">
          {renderTabContent()}
        </div>
      </main>

    </div>
  );
}
