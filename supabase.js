import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sdciwnqnmomwafpnqrjb.supabase.co';
const supabaseKey = 'sb_publishable_jL0VV67aRXDEGVS5WWOlnw_tNYgr_Yb';

export const supabase = createClient(supabaseUrl, supabaseKey);