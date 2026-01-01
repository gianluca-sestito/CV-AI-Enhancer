"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return document.cookie.split(";").map((cookie) => {
          const [name, ...rest] = cookie.trim().split("=");
          return {
            name: name.trim(),
            value: rest.join("="),
          };
        });
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          let cookieString = `${name}=${value}`;
          if (options?.path) cookieString += `; path=${options.path}`;
          if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`;
          if (options?.domain) cookieString += `; domain=${options.domain}`;
          if (options?.sameSite) cookieString += `; SameSite=${options.sameSite}`;
          if (options?.secure) cookieString += `; Secure`;
          // Note: httpOnly cookies cannot be set from client-side JavaScript
          // They are set by the server via Set-Cookie header
          document.cookie = cookieString;
        });
      },
    },
  });
}

