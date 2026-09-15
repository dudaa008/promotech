import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://qcrxxdtilgoivebeyyph.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjcnh4ZHRpbGdvaXZlYmV5eXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDYwODUsImV4cCI6MjA5NDcyMjA4NX0.vMvwrMiRlExz8e5jzD2slXUiQlxi2nyrNBMODu1D7I4"
);
