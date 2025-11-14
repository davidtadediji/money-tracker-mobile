import { supabase } from '@/lib/supabase';
import { SmartEntry, SmartEntryInsert, TransactionInsert } from '@/types/database';

export class SmartEntryServiceError extends Error {
  public code: string;
  public originalError?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', originalError?: any) {
    super(message);
    this.name = 'SmartEntryServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

export interface ServiceResponse<T> {
  data: T | null;
  error: SmartEntryServiceError | null;
}

export interface ExtractedTransaction {
  amount: number;
  category: string;
  date: string;
  description?: string;
  type: 'income' | 'expense';
}

export interface ProcessingResult {
  transactions: ExtractedTransaction[];
  confidence_score: number;
  raw_data: any;
}

// ========================================
// RECEIPT SCANNING (OCR)
// ========================================

export async function processReceiptImage(
  imageUri: string,
  userId: string
): Promise<ServiceResponse<SmartEntry>> {
  const startTime = Date.now();

  try {
    if (!userId) {
      throw new SmartEntryServiceError('User ID is required', 'AUTH_ERROR');
    }

    // Create initial entry
    const { data: entry, error: createError } = await supabase
      .from('smart_entries')
      .insert({
        user_id: userId,
        entry_type: 'receipt_scan',
        status: 'processing',
        original_data: { imageUri },
      })
      .select()
      .single();

    if (createError) {
      throw new SmartEntryServiceError(
        `Failed to create smart entry: ${createError.message}`,
        createError.code,
        createError
      );
    }

    // Process receipt (placeholder for actual OCR)
    const processed = await simulateReceiptOCR(imageUri);
    const processingTime = Date.now() - startTime;

    // Update entry with results
    const { data: updatedEntry, error: updateError } = await supabase
      .from('smart_entries')
      .update({
        status: 'completed',
        processed_data: processed.raw_data,
        extracted_transactions: processed.transactions,
        confidence_score: processed.confidence_score,
        processing_time_ms: processingTime,
        processed_at: new Date().toISOString(),
      })
      .eq('id', entry.id)
      .select()
      .single();

    if (updateError) {
      throw new SmartEntryServiceError(
        `Failed to update smart entry: ${updateError.message}`,
        updateError.code,
        updateError
      );
    }

    return { data: updatedEntry, error: null };
  } catch (error) {
    if (error instanceof SmartEntryServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new SmartEntryServiceError(
        'An unexpected error occurred while processing receipt',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// Placeholder OCR function - Replace with actual OCR service (e.g., Google Vision, AWS Textract)
async function simulateReceiptOCR(imageUri: string): Promise<ProcessingResult> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock extracted data
  return {
    transactions: [
      {
        amount: 45.99,
        category: '🍔 Food & Dining',
        date: new Date().toISOString().split('T')[0],
        description: 'Restaurant - Main Street',
        type: 'expense',
      },
    ],
    confidence_score: 0.85,
    raw_data: {
      merchant: 'Main Street Restaurant',
      total: 45.99,
      date: new Date().toISOString().split('T')[0],
      items: ['Burger', 'Fries', 'Drink'],
    },
  };
}

// ========================================
// VOICE ENTRY
// ========================================

export async function processVoiceEntry(
  audioUri: string,
  userId: string
): Promise<ServiceResponse<SmartEntry>> {
  const startTime = Date.now();

  try {
    if (!userId) {
      throw new SmartEntryServiceError('User ID is required', 'AUTH_ERROR');
    }

    const { data: entry, error: createError } = await supabase
      .from('smart_entries')
      .insert({
        user_id: userId,
        entry_type: 'voice_entry',
        status: 'processing',
        original_data: { audioUri },
      })
      .select()
      .single();

    if (createError) {
      throw new SmartEntryServiceError(
        `Failed to create smart entry: ${createError.message}`,
        createError.code,
        createError
      );
    }

    const processed = await simulateVoiceToText(audioUri);
    const processingTime = Date.now() - startTime;

    const { data: updatedEntry, error: updateError } = await supabase
      .from('smart_entries')
      .update({
        status: 'completed',
        processed_data: processed.raw_data,
        extracted_transactions: processed.transactions,
        confidence_score: processed.confidence_score,
        processing_time_ms: processingTime,
        processed_at: new Date().toISOString(),
      })
      .eq('id', entry.id)
      .select()
      .single();

    if (updateError) {
      throw new SmartEntryServiceError(
        `Failed to update smart entry: ${updateError.message}`,
        updateError.code,
        updateError
      );
    }

    return { data: updatedEntry, error: null };
  } catch (error) {
    if (error instanceof SmartEntryServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new SmartEntryServiceError(
        'An unexpected error occurred while processing voice entry',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// Placeholder voice-to-text - Replace with actual service (e.g., Google Speech-to-Text, AWS Transcribe)
async function simulateVoiceToText(audioUri: string): Promise<ProcessingResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    transactions: [
      {
        amount: 25.50,
        category: '🚗 Transportation',
        date: new Date().toISOString().split('T')[0],
        description: 'Uber ride',
        type: 'expense',
      },
    ],
    confidence_score: 0.78,
    raw_data: {
      transcript: 'I spent twenty five dollars and fifty cents on an uber ride',
      keywords: ['spent', 'uber', 'ride'],
    },
  };
}

// ========================================
// BULK IMPORT (CSV/EXCEL)
// ========================================

export async function processBulkImport(
  csvData: string,
  userId: string
): Promise<ServiceResponse<SmartEntry>> {
  const startTime = Date.now();

  try {
    if (!userId) {
      throw new SmartEntryServiceError('User ID is required', 'AUTH_ERROR');
    }

    const { data: entry, error: createError } = await supabase
      .from('smart_entries')
      .insert({
        user_id: userId,
        entry_type: 'bulk_import',
        status: 'processing',
        original_data: { csvData },
      })
      .select()
      .single();

    if (createError) {
      throw new SmartEntryServiceError(
        `Failed to create smart entry: ${createError.message}`,
        createError.code,
        createError
      );
    }

    const processed = await parseCSVTransactions(csvData);
    const processingTime = Date.now() - startTime;

    const { data: updatedEntry, error: updateError } = await supabase
      .from('smart_entries')
      .update({
        status: 'completed',
        processed_data: processed.raw_data,
        extracted_transactions: processed.transactions,
        confidence_score: processed.confidence_score,
        processing_time_ms: processingTime,
        processed_at: new Date().toISOString(),
      })
      .eq('id', entry.id)
      .select()
      .single();

    if (updateError) {
      throw new SmartEntryServiceError(
        `Failed to update smart entry: ${updateError.message}`,
        updateError.code,
        updateError
      );
    }

    return { data: updatedEntry, error: null };
  } catch (error) {
    if (error instanceof SmartEntryServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new SmartEntryServiceError(
        'An unexpected error occurred while processing bulk import',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

async function parseCSVTransactions(csvData: string): Promise<ProcessingResult> {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  
  const transactions: ExtractedTransaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim();
    });

    if (row.amount && row.category && row.date) {
      transactions.push({
        amount: parseFloat(row.amount),
        category: row.category,
        date: row.date,
        description: row.description || undefined,
        type: (row.type || 'expense') as 'income' | 'expense',
      });
    }
  }

  return {
    transactions,
    confidence_score: 1.0, // CSV parsing is deterministic
    raw_data: {
      totalRows: lines.length - 1,
      parsedRows: transactions.length,
      headers,
    },
  };
}

// ========================================
// SCREENSHOT PROCESSING
// ========================================

export async function processScreenshot(
  imageUri: string,
  userId: string
): Promise<ServiceResponse<SmartEntry>> {
  const startTime = Date.now();

  try {
    if (!userId) {
      throw new SmartEntryServiceError('User ID is required', 'AUTH_ERROR');
    }

    const { data: entry, error: createError } = await supabase
      .from('smart_entries')
      .insert({
        user_id: userId,
        entry_type: 'screenshot',
        status: 'processing',
        original_data: { imageUri },
      })
      .select()
      .single();

    if (createError) {
      throw new SmartEntryServiceError(
        `Failed to create smart entry: ${createError.message}`,
        createError.code,
        createError
      );
    }

    const processed = await simulateScreenshotOCR(imageUri);
    const processingTime = Date.now() - startTime;

    const { data: updatedEntry, error: updateError } = await supabase
      .from('smart_entries')
      .update({
        status: 'completed',
        processed_data: processed.raw_data,
        extracted_transactions: processed.transactions,
        confidence_score: processed.confidence_score,
        processing_time_ms: processingTime,
        processed_at: new Date().toISOString(),
      })
      .eq('id', entry.id)
      .select()
      .single();

    if (updateError) {
      throw new SmartEntryServiceError(
        `Failed to update smart entry: ${updateError.message}`,
        updateError.code,
        updateError
      );
    }

    return { data: updatedEntry, error: null };
  } catch (error) {
    if (error instanceof SmartEntryServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new SmartEntryServiceError(
        'An unexpected error occurred while processing screenshot',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

async function simulateScreenshotOCR(imageUri: string): Promise<ProcessingResult> {
  await new Promise((resolve) => setTimeout(resolve, 1800));

  return {
    transactions: [
      {
        amount: 15.00,
        category: '☕ Coffee',
        date: new Date().toISOString().split('T')[0],
        description: 'Coffee Shop',
        type: 'expense',
      },
    ],
    confidence_score: 0.82,
    raw_data: {
      extractedText: 'Payment Confirmation\nCoffee Shop\n$15.00\nPaid',
      detectedFormat: 'payment_confirmation',
    },
  };
}

// ========================================
// SMART ENTRY CRUD
// ========================================

export async function getUserSmartEntries(
  userId: string,
  limit: number = 50
): Promise<ServiceResponse<SmartEntry[]>> {
  try {
    if (!userId) {
      throw new SmartEntryServiceError('User ID is required', 'AUTH_ERROR');
    }

    const { data, error } = await supabase
      .from('smart_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new SmartEntryServiceError(
        `Failed to fetch smart entries: ${error.message}`,
        error.code,
        error
      );
    }

    return { data: data || [], error: null };
  } catch (error) {
    if (error instanceof SmartEntryServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new SmartEntryServiceError(
        'An unexpected error occurred while fetching smart entries',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

export async function deleteSmartEntry(entryId: string): Promise<ServiceResponse<boolean>> {
  try {
    if (!entryId) {
      throw new SmartEntryServiceError('Entry ID is required', 'VALIDATION_ERROR');
    }

    const { error } = await supabase
      .from('smart_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      throw new SmartEntryServiceError(
        `Failed to delete smart entry: ${error.message}`,
        error.code,
        error
      );
    }

    return { data: true, error: null };
  } catch (error) {
    if (error instanceof SmartEntryServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new SmartEntryServiceError(
        'An unexpected error occurred while deleting smart entry',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

export async function approveAndSaveTransactions(
  entryId: string,
  transactions: ExtractedTransaction[],
  userId: string
): Promise<ServiceResponse<boolean>> {
  try {
    if (!userId) {
      throw new SmartEntryServiceError('User ID is required', 'AUTH_ERROR');
    }

    // Insert transactions into transactions table
    const transactionsToInsert = transactions.map((t) => ({
      user_id: userId,
      amount: t.amount,
      category: t.category,
      date: t.date,
      description: t.description || null,
      type: t.type,
    }));

    const { error: insertError } = await supabase
      .from('transactions')
      .insert(transactionsToInsert);

    if (insertError) {
      throw new SmartEntryServiceError(
        `Failed to save transactions: ${insertError.message}`,
        insertError.code,
        insertError
      );
    }

    // Mark smart entry as completed
    const { error: updateError } = await supabase
      .from('smart_entries')
      .update({ status: 'completed' })
      .eq('id', entryId);

    if (updateError) {
      throw new SmartEntryServiceError(
        `Failed to update smart entry status: ${updateError.message}`,
        updateError.code,
        updateError
      );
    }

    return { data: true, error: null };
  } catch (error) {
    if (error instanceof SmartEntryServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new SmartEntryServiceError(
        'An unexpected error occurred while approving transactions',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

