/**
 * Supabase Service
 * Securely initializes and exports a Supabase client instance using credentials
 * ONLY from environment variables (never hardcoded).
 * IMPORTANT:
 *   - Requires SUPABASE_URL and SUPABASE_KEY to be set in the environment.
 *   - Load environment variables using dotenv in entrypoints (if needed).
 *   - Do NOT hardcode credentials or commit them to code.
 */

const { createClient } = require('@supabase/supabase-js');

// Lazy singleton initialization, safe for import everywhere
let supabaseClient = null;

// PUBLIC_INTERFACE
/**
 * Returns the Supabase client instance.
 * Automatically initializes on first use, with credentials read from process.env.
 * Throws if required environment variables are missing.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function getClient() {
  // Don't load dotenv here -- it should be loaded once in the entrypoint for security/clarity
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (!url || !key) {
      throw new Error(
        'Supabase configuration not found. Please set SUPABASE_URL and SUPABASE_KEY in your environment (.env file or server env).'
      );
    }
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

module.exports = { getClient };
