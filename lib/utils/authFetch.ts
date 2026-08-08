"use client";

import { supabase } from "../db/client";

/**
 * fetch() that attaches the current Supabase access token as a bearer header.
 *
 * Routes that change roles, delete other people's data, or perform admin actions verify this
 * token server-side. A `userId` in the query string or body is self-asserted and is not, on
 * its own, proof of anything.
 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }
  } catch {
    // No session, send the request unauthenticated and let the server reject it.
  }

  return fetch(input, { ...init, headers });
}
