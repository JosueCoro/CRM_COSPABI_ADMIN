import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lfatlzsysqninvtcnmdb.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmYXRsenN5c3FuaW52dGNubWRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNzcyODIsImV4cCI6MjA4Njc1MzI4Mn0.uUQl_S1pP32505KzRL1CeVa9EWYFUvQMRxVcmiGG720';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
