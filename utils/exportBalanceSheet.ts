import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Asset, Liability } from '@/types/database';

interface ExportOptions {
  assets: Asset[];
  liabilities: Liability[];
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

/**
 * Export balance sheet data to CSV format
 */
export async function exportToCSV({
  assets,
  liabilities,
  netWorth,
  totalAssets,
  totalLiabilities,
}: ExportOptions): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      return {
        success: false,
        error: 'Sharing is not available on this device',
      };
    }

    // Generate CSV content
    const csvContent = generateCSV({
      assets,
      liabilities,
      netWorth,
      totalAssets,
      totalLiabilities,
    });

    // Create filename with current date
    const date = new Date();
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `balance-sheet-${dateString}.csv`;

    // Write to file
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Balance Sheet',
      UTI: 'public.comma-separated-values-text',
    });

    return { success: true };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export balance sheet',
    };
  }
}

/**
 * Generate CSV content from balance sheet data
 */
function generateCSV({
  assets,
  liabilities,
  netWorth,
  totalAssets,
  totalLiabilities,
}: ExportOptions): string {
  const lines: string[] = [];

  // Add header with summary
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  lines.push(`Balance Sheet Export - ${date}`);
  lines.push('');

  // Add summary section
  lines.push('SUMMARY');
  lines.push(`Total Assets,${formatCurrency(totalAssets)}`);
  lines.push(`Total Liabilities,${formatCurrency(totalLiabilities)}`);
  lines.push(`Net Worth,${formatCurrency(netWorth)}`);
  lines.push('');

  // Add assets section
  lines.push('ASSETS');
  lines.push('Name,Type,Value,Currency,Description,Last Updated');
  
  assets.forEach((asset) => {
    const row = [
      escapeCSV(asset.name),
      escapeCSV(formatType(asset.type)),
      asset.current_value.toFixed(2),
      asset.currency,
      escapeCSV(asset.description || ''),
      formatDate(asset.updated_at),
    ];
    lines.push(row.join(','));
  });

  // Add empty line between sections
  lines.push('');

  // Add liabilities section
  lines.push('LIABILITIES');
  lines.push('Name,Type,Balance,Interest Rate,Currency,Description,Last Updated');
  
  liabilities.forEach((liability) => {
    const row = [
      escapeCSV(liability.name),
      escapeCSV(formatType(liability.type)),
      liability.current_balance.toFixed(2),
      liability.interest_rate ? `${liability.interest_rate}%` : 'N/A',
      liability.currency,
      escapeCSV(liability.description || ''),
      formatDate(liability.updated_at),
    ];
    lines.push(row.join(','));
  });

  return lines.join('\n');
}

/**
 * Escape CSV special characters
 */
function escapeCSV(value: string): string {
  if (!value) return '';
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}

/**
 * Format currency value
 */
function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format type enum to readable string
 */
function formatType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format date to readable string
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

