import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { supabase } from "../db/client";

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get initial local storage anonymous ID
    let localId = localStorage.getItem("event_craft_user_id");
    if (!localId) {
      localId = `anon_${nanoid(12)}`;
      localStorage.setItem("event_craft_user_id", localId);
    }

    // 2. Fetch authenticated Supabase user using getSession for faster local check
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        } else {
          setUserId(localId);
        }
      }
    };

    checkUser();

    // 3. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(localId);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return userId;
}
