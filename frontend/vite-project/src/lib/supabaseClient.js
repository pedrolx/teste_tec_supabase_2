import { createClient } from '@supabase/supabase-js'

//console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
//console.log('Chave:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Carregada' : 'Faltando')

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)