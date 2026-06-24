// src/lib/supabase.js
//
// The Supabase client singleton.
//
// WHY a singleton?
// Every time your app talks to Supabase (fetching vehicles, saving customers,
// uploading files) it goes through this ONE client instance. If you created
// a new client inside every component, you'd have hundreds of separate
// connections open, which is wasteful and causes bugs.
//
// "Singleton" just means: create it once, export it, import it everywhere.
//
// HOW it works:
// createClient() connects to your Supabase project using the URL and key
// from .env.local. The anon key tells Supabase "this is a browser request
// from the public-facing app." Supabase then applies its security rules
// (Row Level Security) to decide what that user can see and do.
//
// import.meta.env is how Vite exposes .env.local variables to your code.
// The VITE_ prefix is what makes them visible here.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Guard: if either variable is missing, fail loudly at startup rather than
// showing a confusing error somewhere deep in the app later.
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables.\n" +
      "Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Persist the user's login session in localStorage so they stay
    // logged in across browser refreshes. Without this, every refresh
    // would log the user out.
    persistSession: true,

    // Automatically refresh the auth token before it expires.
    // Supabase tokens last 1 hour. With this on, the client silently
    // refreshes it in the background — the user never sees a logout.
    autoRefreshToken: true,

    // When the app loads, check localStorage for an existing session
    // and restore it. This is what makes "remember me" work.
    detectSessionInUrl: true,
  },
});
