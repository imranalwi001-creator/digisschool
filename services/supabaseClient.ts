import { createClient } from '@supabase/supabase-js';

// Menggunakan process.env untuk menghindari error TypeScript "Property 'env' does not exist on type 'ImportMeta'".
// Pastikan Environment Variables ini diatur di Vercel/Netlify saat deploy.
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Peringatan jika Key belum disetting
if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "⚠️ Supabase URL atau Anon Key belum disetting. " +
    "Pastikan Anda menambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env atau Environment Variables hosting Anda."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);