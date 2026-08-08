import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { supabase } from "../db/client";

const LOCAL_KEY = "event_craft_user_id";

/** Reads (or lazily creates) the guest id. Safe to call outside the browser. */
function readLocalId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let localId = localStorage.getItem(LOCAL_KEY);
    if (!localId) {
      localId = `anon_${nanoid(12)}`;
      localStorage.setItem(LOCAL_KEY, localId);
    }
    return localId;
  } catch {
    // Private mode / storage disabled: fall back to a per-session id so the app still works.
    return `anon_${nanoid(12)}`;
  }
}

/**
 * The current user id: the Supabase user id when signed in, otherwise a local guest id.
 *
 * NOTE: for guests this value is self-assigned in localStorage. It identifies a browser, not a
 * verified principal, and must never be treated by the server as proof of identity. Routes that
 * need real identity verify a Supabase access token instead (see lib/utils/auth.ts).
 */
export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // `settled` prevents a slow getUser() response from overwriting a newer id that
    // onAuthStateChange already delivered, e.g. the user signs in while the initial request
    // is still in flight and the late response clobbers them back to the guest id.
    let settled = false;
    const localId = readLocalId();

    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (settled) return;
        if (session?.user) {
          setUserId(session.user.id);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (settled) return;
        setUserId(user ? user.id : localId);
      } catch {
        // Supabase unreachable / not configured: guests still get a usable id.
        if (!settled) setUserId(localId);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // An auth event is always fresher than the initial probe, so let it win.
      settled = true;
      setUserId(session?.user ? session.user.id : localId);
    });

    return () => {
      settled = true;
      subscription.unsubscribe();
    };
  }, []);

  return userId;
}
