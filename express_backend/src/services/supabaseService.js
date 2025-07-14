require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

/**
 * Supabase Service
 * Initializes and exports a Supabase client instance using credentials from environment variables.
 */
class SupabaseService {
  constructor() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      throw new Error(
        'Missing Supabase credentials. Ensure SUPABASE_URL and SUPABASE_KEY are set in the environment.'
      );
    }
    this.client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  }

  /** Get the initialized Supabase client */
  // PUBLIC_INTERFACE
  getClient() {
    return this.client;
  }
}

module.exports = new SupabaseService();
