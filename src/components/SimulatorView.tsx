/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  SystemParameter, 
  ShopifyOrder, 
  BankTransaction, 
  InventoryPurchase, 
  AdvertisingSpend,
  SimulatorItem 
} from '../types';
import { ShieldQuestion, Play, AlertTriangle, CheckCircle, Flame, Calendar } from 'lucide-react';
import { formatCurrency, addWeeksToDate, getSequenceOfWeeks } from '../utils';

interface SimulatorViewProps {
  parameters: SystemParameter[];
  shopifyData: ShopifyOrder[];
  bankTransactions: BankTransaction[];
  inventoryPurchases: InventoryPurchase[];
  advertisingSpend: AdvertisingSpend[];
}

export default function SimulatorView({
  parameters,
  shopifyData,
  bankTransactions,
  inventoryPurchases,
  advertisingSpend
}: SimulatorViewProps) {

  // Form states for manual simulation
  const [simPoRef, setSimPoRef] = useState('SIM-PO-100');
  const [simCost, setSimCost] = useState('35000');
  const [simPrepayPct, setSimPrepayPct] = useState('30');
  const [simLeadTime, setSimLeadTime] = useState('4');
  const [simPrepayDate, setSimPrepayDate] = useState('2026-07-15');

  const initialBalanceParam = parameters.find(p => p.id === 'param_initial_cash')?.value ?? 125000;
  const safetyReserveParam = parameters.find(p => p.id === 'param_safety_reserve')?.value ?? 50000;
  const weeklyOpexParam = parameters.find(p => p.id === 'param_weekly_overhead')?.value ?? 4500;

  // Calculate current liquid balance
  const currentCash = initialBalanceParam + bankTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Core simulation engine function to calculate projected cash on a given date, including all existing obligations
  const calculateCashOnDate = (targetDateStr: string): number => {
    const targetMs = new Date(targetDateStr).getTime();
    const baseDate = '2026-07-07';
    const baseMs = new Date(baseDate).getTime();

    if (targetMs <= baseMs) return currentCash;

    // Calculate number of full weeks between base and target
    const diffMs = targetMs - baseMs;
    const weeksPassed = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));

    // Calculate sales inflows up to target date
    const shopifyInflows = shopifyData
      .filter(o => new Date(o.date).getTime() >= baseMs && new Date(o.date).getTime() <= targetMs)
      .reduce((sum, o) => sum + o.netPayment, 0);

    // Calculate other inflows
    const otherInflows = bankTransactions
      .filter(tx => {
        if (tx.amount <= 0) return false;
        const isShopify = shopifyData.some(o => o.orderId === tx.referenceId);
        if (isShopify) return false;
        return new Date(tx.date).getTime() >= baseMs && new Date(tx.date).getTime() <= targetMs;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate advertising outflows
    const adOutflows = advertisingSpend
      .filter(ad => new Date(ad.date).getTime() >= baseMs && new Date(ad.date).getTime() <= targetMs)
      .reduce((sum, ad) => sum + ad.cost, 0);

    // Calculate existing inventory cash drains
    const inventoryPrepayOutflows = inventoryPurchases
      .filter(p => p.status !== 'Completed' && new Date(p.estPrepayDate).getTime() >= baseMs && new Date(p.estPrepayDate).getTime() <= targetMs)
      .reduce((sum, p) => sum + (p.totalOrderCost * (p.prepaymentPercent / 100)), 0);

    const inventoryFinalOutflows = inventoryPurchases
      .filter(p => {
        if (p.status === 'Completed') return false;
        const finalDate = addWeeksToDate(p.estPrepayDate, p.leadTimeWeeks);
        return new Date(finalDate).getTime() >= baseMs && new Date(finalDate).getTime() <= targetMs;
      })
      .reduce((sum, p) => sum + (p.totalOrderCost * (1 - p.prepaymentPercent / 100)), 0);

    // Calculate fixed overhead outflows (weeklyOpexParam times weeks elapsed)
    const overheadOutflows = weeksPassed * weeklyOpexParam;

    return currentCash + shopifyInflows + otherInflows - adOutflows - inventoryPrepayOutflows - inventoryFinalOutflows - overheadOutflows;
  };

  // Perform Simulation for active input parameters
  const runSimulation = (): SimulatorItem => {
    const cost = parseFloat(simCost) || 0;
    const prepayPct = parseFloat(simPrepayPct) || 0;
    const leadWeeks = parseInt(simLeadTime) || 0;
    
    const prepayAmount = cost * (prepayPct / 100);
    const finalAmount = cost * (1 - prepayPct / 100);
    const finalPaymentDate = addWeeksToDate(simPrepayDate, leadWeeks);

    // Calculate theoretical cash level right before payments are made, then subtract
    const basePrepayCash = calculateCashOnDate(simPrepayDate);
    const prepayCashAfter = basePrepayCash - prepayAmount;

    const baseFinalCash = calculateCashOnDate(finalPaymentDate);
    // Subtract prepayAmount too if final date is after prepay date
    const finalCashAfter = baseFinalCash - (finalPaymentDate >= simPrepayDate ? prepayAmount : 0) - finalAmount;

    const isPrepaySafe = prepayCashAfter >= safetyReserveParam;
    const isFinalSafe = finalCashAfter >= safetyReserveParam;

    let statusMessage = '';
    let statusType: SimulatorItem['statusType'] = 'success';

    if (!isPrepaySafe) {
      statusMessage = '❌ DANGER: Initial prepayment alone will immediately crash liquid cash reserves below safety floor!';
      statusType = 'danger';
    } else if (!isFinalSafe) {
      statusMessage = '⚠️ CAUTION: Prepayment is viable, but final invoice settlement will breach the safety threshold during lead-time!';
      statusType = 'warning';
    } else {
      statusMessage = '✅ SAFE: Proposed Purchase Order has negligible cash-drain risk. Well within buffer zones.';
      statusType = 'success';
    }

    return {
      poReference: simPoRef,
      totalOrderCost: cost,
      prepaymentPercent: prepayPct,
      leadTimeWeeks: leadWeeks,
      estPrepayDate: simPrepayDate,
      prepayAmount,
      finalAmount,
      finalPaymentDate,
      prepayCashAfter,
      finalCashAfter,
      isPrepaySafe,
      isFinalSafe,
      statusMessage,
      statusType
    };
  };

  const simResult = runSimulation();

  // Mapped scenario runs for preset comparison
  const presetScenarios: Omit<SimulatorItem, 'statusMessage' | 'statusType'>[] = [
    {
      poReference: 'Small Replenishment PO',
      totalOrderCost: 15000,
      prepaymentPercent: 30,
      leadTimeWeeks: 3,
      estPrepayDate: '2026-07-12',
      prepayAmount: 4500,
      finalAmount: 10500,
      finalPaymentDate: '2026-08-02',
      prepayCashAfter: calculateCashOnDate('2026-07-12') - 4500,
      finalCashAfter: calculateCashOnDate('2026-08-02') - 15000,
      isPrepaySafe: (calculateCashOnDate('2026-07-12') - 4500) >= safetyReserveParam,
      isFinalSafe: (calculateCashOnDate('2026-08-02') - 15000) >= safetyReserveParam,
    },
    {
      poReference: 'Standard Manufacturing Batch',
      totalOrderCost: 50000,
      prepaymentPercent: 50,
      leadTimeWeeks: 4,
      estPrepayDate: '2026-07-20',
      prepayAmount: 25000,
      finalAmount: 25000,
      finalPaymentDate: '2026-08-17',
      prepayCashAfter: calculateCashOnDate('2026-07-20') - 25000,
      finalCashAfter: calculateCashOnDate('2026-08-17') - 50000,
      isPrepaySafe: (calculateCashOnDate('2026-07-20') - 25000) >= safetyReserveParam,
      isFinalSafe: (calculateCashOnDate('2026-08-17') - 50000) >= safetyReserveParam,
    },
    {
      poReference: 'Peak Q4 Cargo Stock PO',
      totalOrderCost: 120000,
      prepaymentPercent: 30,
      leadTimeWeeks: 6,
      estPrepayDate: '2026-07-25',
      prepayAmount: 36000,
      finalAmount: 84000,
      finalPaymentDate: '2026-09-05',
      prepayCashAfter: calculateCashOnDate('2026-07-25') - 36000,
      finalCashAfter: calculateCashOnDate('2026-09-05') - 120000,
      isPrepaySafe: (calculateCashOnDate('2026-07-25') - 36000) >= safetyReserveParam,
      isFinalSafe: (calculateCashOnDate('2026-09-05') - 120000) >= safetyReserveParam,
    }
  ];

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h2 className="heading-eb text-2xl text-[#051C2C] font-semibold flex items-center gap-2">
          <ShieldQuestion className="text-[#2251FF]" size={22} />
          Procurement Cash Pressure Test (Inventory_Impact_Simulator)
        </h2>
        <p className="text-[#888888] text-xs mt-1">
          Perform digital dry-runs before signing supply contracts. Gauge how upfront deposits and final bill clearings impact projected bank balance margins.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Input Card */}
        <div className="bg-white p-6 rounded-[14px] shadow-sm lg:col-span-1">
          <h3 className="heading-eb text-lg text-[#051C2C] font-semibold mb-4 flex items-center gap-2">
            <Play className="text-[#2251FF]" size={16} fill="var(--color-accent)" />
            Simulation Parameters
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[#888888] text-[10px] font-semibold uppercase mb-1.5">Simulation Name / PO Ref</label>
              <input
                id="sim-po-ref"
                type="text"
                className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
                value={simPoRef}
                onChange={(e) => setSimPoRef(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[#888888] text-[10px] font-semibold uppercase mb-1.5">Total PO Cost (USD)</label>
              <input
                id="sim-cost"
                type="number"
                step="500"
                className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
                value={simCost}
                onChange={(e) => setSimCost(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#888888] text-[10px] font-semibold uppercase mb-1.5">Prepay %</label>
                <input
                  id="sim-prepay-pct"
                  type="number"
                  min="0"
                  max="100"
                  className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
                  value={simPrepayPct}
                  onChange={(e) => setSimPrepayPct(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[#888888] text-[10px] font-semibold uppercase mb-1.5">Lead Weeks</label>
                <input
                  id="sim-lead-time"
                  type="number"
                  min="0"
                  className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
                  value={simLeadTime}
                  onChange={(e) => setSimLeadTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[#888888] text-[10px] font-semibold uppercase mb-1.5">Estimated Prepay Date</label>
              <input
                id="sim-prepay-date"
                type="date"
                className="interactive-input w-full px-3 py-2 rounded-[8px] text-xs text-[#051C2C]"
                value={simPrepayDate}
                onChange={(e) => setSimPrepayDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Live Audit Evaluation Result */}
        <div className="bg-white p-6 rounded-[14px] shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="heading-eb text-lg text-[#051C2C] font-semibold mb-4">Live Liquidity Pressure Result</h3>
            
            {/* Dynamic Alarm Box */}
            <div className={`p-4 rounded-[10px] border mb-6 ${
              simResult.statusType === 'success' 
                ? 'bg-green-50/50 border-green-200 text-green-900' 
                : simResult.statusType === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-900'
                  : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <div className="flex gap-2 items-start text-xs font-medium">
                {simResult.statusType === 'success' ? (
                  <CheckCircle className="text-[#00C853] shrink-0 mt-0.5" size={16} />
                ) : simResult.statusType === 'warning' ? (
                  <AlertTriangle className="text-yellow-700 shrink-0 mt-0.5" size={16} />
                ) : (
                  <Flame className="text-[#D32F2F] shrink-0 mt-0.5" size={16} />
                )}
                <div>
                  <strong className="block font-semibold mb-1">
                    Simulation Outcome: {simResult.statusType.toUpperCase()}
                  </strong>
                  {simResult.statusMessage}
                </div>
              </div>
            </div>

            {/* Calculated Cash Drain Milestones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-4">
              <div className="space-y-3">
                <div className="border-b border-[#E8E8E6] pb-1 font-semibold uppercase text-[#888888] text-[10px] tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#2251FF] rounded-full" />
                  Milestone 1: Deposit Clearance
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#888888]">Due Date:</span>
                  <span className="font-mono font-medium text-[#051C2C] flex items-center gap-1">
                    <Calendar size={12} />
                    {simResult.estPrepayDate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#888888]">Prepayment amount:</span>
                  <span className="font-mono font-bold text-[#D32F2F]">
                    -{formatCurrency(simResult.prepayAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#888888]">Bank Cushion Remaining:</span>
                  <span className={`font-mono font-semibold ${simResult.isPrepaySafe ? 'text-[#051C2C]' : 'text-[#D32F2F]'}`}>
                    {formatCurrency(simResult.prepayCashAfter)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border-b border-[#E8E8E6] pb-1 font-semibold uppercase text-[#888888] text-[10px] tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#051C2C] rounded-full" />
                  Milestone 2: Cargo Shipment Balance
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#888888]">Due Date:</span>
                  <span className="font-mono font-medium text-[#051C2C] flex items-center gap-1">
                    <Calendar size={12} />
                    {simResult.finalPaymentDate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#888888]">Final amount due:</span>
                  <span className="font-mono font-bold text-[#D32F2F]">
                    -{formatCurrency(simResult.finalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#888888]">Bank Cushion Remaining:</span>
                  <span className={`font-mono font-semibold ${simResult.isFinalSafe ? 'text-[#051C2C]' : 'text-[#D32F2F]'}`}>
                    {formatCurrency(simResult.finalCashAfter)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#888888] border-t border-[#E8E8E6] pt-3 mt-4">
            * Pressure tests factor in active overhead parameters (${weeklyOpexParam}/week) and forecast trends, but do not automatically add this PO to the actual database unless entered under the Procurement view.
          </div>
        </div>
      </div>

      {/* Preset Scenario Benchmarks */}
      <div className="bg-white rounded-[14px] shadow-sm overflow-hidden border-b border-[#E8E8E6]">
        <div className="p-5 border-b border-[#E8E8E6]">
          <h3 className="heading-eb text-md text-[#051C2C] font-semibold">Standard Supply Contract Benchmarks</h3>
          <p className="text-[#888888] text-xs">Pre-run simulations matching standard supplier terms for ready assessment.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[rgba(5,28,44,0.04)] border-b border-[rgba(5,28,44,0.12)]">
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C]">Supply Scenario Type</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-right">Contract Size</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-center">Structure</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-center">Lead weeks</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-center">Cash Cushion 1 (Prepay)</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-center">Cash Cushion 2 (Final)</th>
                <th className="px-6 py-4 label-uppercase text-xs text-[#051C2C] text-center" style={{ width: '150px' }}>Risk Assessment</th>
              </tr>
            </thead>
            <tbody>
              {presetScenarios.map((sc, i) => {
                let statusLabel = 'Safe';
                let badgeClass = 'bg-green-50 text-[#00C853]';
                
                if (!sc.isPrepaySafe) {
                  statusLabel = 'Critical Risk';
                  badgeClass = 'bg-red-50 text-[#D32F2F] border border-red-200';
                } else if (!sc.isFinalSafe) {
                  statusLabel = 'Caution Advice';
                  badgeClass = 'bg-yellow-50 text-yellow-800 border border-yellow-200';
                }

                return (
                  <tr 
                    key={sc.poReference}
                    className={`border-b border-[#E8E8E6] hover:bg-gray-50/50 transition-colors ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F2]/50'
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-xs text-[#051C2C]">
                      {sc.poReference}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-[#051C2C]">
                      {formatCurrency(sc.totalOrderCost)}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-[#888888]">
                      {sc.prepaymentPercent}% / {100 - sc.prepaymentPercent}%
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-[#051C2C]">
                      {sc.leadTimeWeeks} weeks
                    </td>
                    <td className={`px-6 py-4 text-center font-mono text-xs font-semibold ${sc.isPrepaySafe ? 'text-[#051C2C]' : 'text-[#D32F2F]'}`}>
                      {formatCurrency(sc.prepayCashAfter)}
                    </td>
                    <td className={`px-6 py-4 text-center font-mono text-xs font-semibold ${sc.isFinalSafe ? 'text-[#051C2C]' : 'text-[#D32F2F]'}`}>
                      {formatCurrency(sc.finalCashAfter)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
