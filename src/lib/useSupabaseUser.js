"use client";

import { useEffect, useState } from "react";
import { createClient } from "./supabase/browserClient";

export function useSupabaseUser() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const applySession = async (session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setIsAdmin(false);
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
      setIsAdmin(profile?.role === "admin");
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await applySession(session);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isAdmin, ready };
}
