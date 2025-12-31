"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            if (options?.httpOnly) cookieString += `; HttpOnly`;
            document.cookie = cookieString;
          });
        },
      },
    }
  );
}

