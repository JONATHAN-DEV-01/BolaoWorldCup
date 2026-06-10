import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://koinitpxilzwfxfhcgbx.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_0pRa6D4MGJn9LKdcIRe_Rg_ehOl0L4L'

export const supabase = createClient(supabaseUrl, supabaseKey)
