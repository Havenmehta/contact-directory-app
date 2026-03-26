import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sdciwnqnmomwafpnqrjb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkY2l3bnFubW9td2FmcG5xcmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTU3NDQsImV4cCI6MjA5MDA5MTc0NH0.y_XPgHYVj8GLOX_HUeZz1mdxAWBLZHJLvUnddPV8c4A';

export const supabase = createClient(supabaseUrl, supabaseKey);