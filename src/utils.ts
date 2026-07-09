/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple robust CSV parser
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentValue.trim());
      currentValue = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      row.push(currentValue.trim());
      lines.push(row);
      row = [];
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  if (currentValue || row.length > 0) {
    row.push(currentValue.trim());
    lines.push(row);
  }

  // Filter out completely empty lines
  return lines.filter(r => r.length > 0 && r.some(cell => cell !== ''));
}

// Format numbers as Currency (USD)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format as percentage
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Generate an array of dates starting from base, incremented by 7 days
export function getSequenceOfWeeks(startDateStr: string, count: number): string[] {
  const dates: string[] = [];
  const baseDate = new Date(startDateStr);
  
  for (let i = 0; i < count; i++) {
    const nextDate = new Date(baseDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    dates.push(nextDate.toISOString().split('T')[0]);
  }
  
  return dates;
}

// Helper to check if a date falls within a week interval
export function isDateInWeek(dateStr: string, weekStartStr: string): boolean {
  const date = new Date(dateStr).getTime();
  const weekStart = new Date(weekStartStr).getTime();
  const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
  
  return date >= weekStart && date < weekEnd;
}

// Add weeks to a date string
export function addWeeksToDate(dateStr: string, weeks: number): string {
  const date = new Date(dateStr);
  const futureDate = new Date(date.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
  return futureDate.toISOString().split('T')[0];
}
