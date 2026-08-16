import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rwrmgipaswpncoisbuae.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cm1naXBhc3dwbmNvaXNidWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTUyNzIsImV4cCI6MjA5Mjg3MTI3Mn0.D0xA8mghRHqLDTvnPgX3QeISjxn0zNlGOYuhAIpmWFA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: convert username → internal email for Supabase Auth
// We strip non-alphanumeric characters so spaces don't create invalid emails
export const usernameToEmail = (username: string) => {
  const safeName = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  return `${safeName}@manoveda.com`;
};

// Helper: extract username from internal email
export const emailToUsername = (email: string) =>
  email.replace('@manoveda.com', '');
