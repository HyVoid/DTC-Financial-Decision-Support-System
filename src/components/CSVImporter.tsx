/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Upload, Check, AlertTriangle } from 'lucide-react';
import { parseCSV } from '../utils';

interface CSVImporterProps {
  title: string;
  expectedHeaders: string[];
  onImport: (data: string[][]) => void;
}

export default function CSVImporter({ title, expectedHeaders, onImport }: CSVImporterProps) {
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [rowCount, setRowCount] = useState<number>(0);

  const handleProcessText = () => {
    setError(null);
    setSuccess(false);
    
    if (!csvText.trim()) {
      setError('Please enter some CSV content first.');
      return;
    }

    try {
      const parsed = parseCSV(csvText);
      if (parsed.length === 0) {
        setError('No rows found in the provided CSV.');
        return;
      }

      const headers = parsed[0].map(h => h.toLowerCase().trim());
      // Check how many headers match
      const matchingHeaders = expectedHeaders.filter(h => 
        headers.includes(h.toLowerCase().trim())
      );

      if (matchingHeaders.length === 0) {
        setError(`Header row mismatch. Expected columns like: ${expectedHeaders.join(', ')}`);
        return;
      }

      // Pass all rows except the header row
      const dataRows = parsed.slice(1);
      if (dataRows.length === 0) {
        setError('CSV contains a header row but has no data rows.');
        return;
      }

      onImport(parsed);
      setRowCount(dataRows.length);
      setSuccess(true);
      setCsvText('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (e: any) {
      setError(`Failed to parse CSV: ${e.message || 'Unknown error'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white p-6 rounded-[14px] shadow-sm mb-6 floating-card">
      <h3 className="heading-eb text-lg text-[#051C2C] mb-2">Bulk CSV Import: {title}</h3>
      <p className="text-[#888888] text-xs mb-4">
        Paste CSV data directly from Excel, or select a `.csv` file. 
        Expected columns (order-independent): <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono font-medium text-[#051C2C]">{expectedHeaders.join(', ')}</code>
      </p>

      <div className="space-y-4">
        <textarea
          id={`csv-textarea-${title.replace(/\s+/g, '-')}`}
          className="w-full h-28 p-3 text-xs font-mono bg-[#FFFDE7] rounded-[10px] border border-transparent focus:outline-none focus:border-[#2251FF] resize-y"
          placeholder="Order ID,Date,Net Payment&#10;SH-1001,2026-07-01,4200.00&#10;SH-1002,2026-07-02,3800.00"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 px-4 py-2 border border-[#E8E8E6] hover:border-[#051C2C] rounded-[10px] cursor-pointer text-xs font-medium text-[#051C2C] transition-colors">
            <Upload size={14} />
            Upload File
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          <button
            id={`import-btn-${title.replace(/\s+/g, '-')}`}
            onClick={handleProcessText}
            className="px-6 py-2 bg-[#2251FF] hover:bg-opacity-90 active:scale-95 text-white rounded-[10px] text-xs font-semibold transition-all shadow-sm"
          >
            Process & Import Rows
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-[#D32F2F] p-3 rounded-[10px] text-xs mt-3">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 bg-green-50 text-[#00C853] p-3 rounded-[10px] text-xs mt-3">
            <Check size={16} className="shrink-0 mt-0.5" />
            <span>Successfully imported <strong>{rowCount}</strong> rows! Calculated values have been updated across all spreadsheets.</span>
          </div>
        )}
      </div>
    </div>
  );
}
