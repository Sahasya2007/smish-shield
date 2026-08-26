// ==========================================
// SUPABASE DATABASE CONNECTION & HELPERS
// ==========================================

import { createClient } from '@supabase/supabase-js';

// 1. Fetch environment variables (Ensure these are in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. Safety Check: Stop execution if keys are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

// 3. Initialize and export the Supabase Client
// This 'supabase' object is the bridge between our app and the cloud database.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// ==========================================
// HELPER FUNCTIONS FOR FRONTEND / BACKEND
// ==========================================
// Teams can import these directly instead of writing raw database queries.


/**
 * @function getQuarantinedLogs
 * @description Fetches all SMS logs that have been marked as 'quarantined' (phishing/scam).
 * @returns {Array} Array of SMS objects, sorted newest first. Returns empty array on error.
 * @example
 * // In a React Component:
 * import { getQuarantinedLogs } from '@/lib/supabase';
 * const logs = await getQuarantinedLogs();
 */
export async function getQuarantinedLogs() {
  const { data, error } = await supabase
    .from('sms_logs')
    .select('*')
    .eq('verification_status', 'quarantined')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Database Error (Fetching logs):', error.message);
    return [];
  }
  return data ?? [];
}


/**
 * @function getAllSafeLogs
 * @description Fetches all legitimate SMS messages marked as 'safe'.
 * @returns {Array} Array of safe SMS objects.
 */
export async function getAllSafeLogs() {
  const { data, error } = await supabase
    .from('sms_logs')
    .select('*')
    .eq('verification_status', 'safe')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Database Error (Fetching safe logs):', error.message);
    return [];
  }
  return data ?? [];
}


/**
 * @function insertSmsLog
 * @description Inserts a newly scanned SMS into the database.
 * @param {string} sender - The phone number or sender ID (e.g., 'SBI-NETBK').
 * @param {string} content - The actual text message content.
 * @param {'safe' | 'quarantined' | 'pending'} status - The classification of the message.
 * @returns {Object|null} Returns the newly created row data, or null if it fails.
 * @example
 * // In an API Route or Next.js Action:
 * import { insertSmsLog } from '@/lib/supabase';
 * const newRecord = await insertSmsLog('0xScamBot', 'Click here to win!', 'quarantined');
 */
export async function insertSmsLog(
  sender: string, 
  content: string, 
  status: 'safe' | 'quarantined' | 'pending'
) {
  const { data, error } = await supabase
    .from('sms_logs')
    .insert([
      { 
        sender_number: sender, 
        message_content: content, 
        verification_status: status 
      }
    ])
    .select(); // .select() ensures it returns the inserted data back to the app

  if (error) {
    console.error('Database Error (Inserting log):', error.message);
    return null;
  }
  return data;
}


/**
 * @function getDashboardStats
 * @description Gets a quick count of Safe vs Quarantined messages for the police dashboard.
 * @returns {Object} { total: number, safe: number, quarantined: number }
 */
export async function getDashboardStats() {
  const { data, error } = await supabase
    .from('sms_logs')
    .select('verification_status');

  if (error) {
    console.error('Database Error (Fetching stats):', error.message);
    return { total: 0, safe: 0, quarantined: 0 };
  }

  const safe = data.filter(d => d.verification_status === 'safe').length;
  const quarantined = data.filter(d => d.verification_status === 'quarantined').length;

  return {
    total: data.length,
    safe,
    quarantined
  };
}
