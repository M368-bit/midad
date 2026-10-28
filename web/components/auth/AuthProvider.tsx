"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, UserRole } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  setDevRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEV_PROFILE_KEY = "midad_dev_profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      // وضع التطوير بدون بيانات اعتماد سوبابيز
      try {
        const saved = localStorage.getItem(DEV_PROFILE_KEY);
        if (saved) {
          const p = JSON.parse(saved);
          setProfile(p);
          setUser({ id: p.id, email: p.email });
        } else {
          // زائر غير مسجل افتراضياً - لا يتم تسجيل دخوله كمدير تلقائياً
          setProfile(null);
          setUser(null);
        }
      } catch {
        setProfile(null);
        setUser(null);
      }
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    // جلب الجلسة الحالية
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data as UserProfile);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .single();
          if (data) setProfile(data as UserProfile);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = async (email: string, password: string) => {
    if (!configured) {
      // محاكاة تسجيل دخول محلي
      const devProfile: UserProfile = {
        id: "usr-dev-admin",
        email,
        full_name: email.split("@")[0] || "مستخدم مداد",
        role_id: email.includes("admin") ? "admin" : "viewer",
        avatar_url: null,
        bio: "مستخدم محلي مسجل",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(devProfile);
      setUser({ id: devProfile.id, email });
      localStorage.setItem(DEV_PROFILE_KEY, JSON.stringify(devProfile));
      return {};
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!configured) {
      const devProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: fullName,
        role_id: "viewer",
        avatar_url: null,
        bio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(devProfile);
      setUser({ id: devProfile.id, email });
      localStorage.setItem(DEV_PROFILE_KEY, JSON.stringify(devProfile));
      return {};
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    if (configured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    try {
      localStorage.removeItem(DEV_PROFILE_KEY);
    } catch {}
  };

  const resetPassword = async (email: string) => {
    if (!configured) {
      return {};
    }
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    });
    if (error) return { error: error.message };
    return {};
  };

  const setDevRole = (role: UserRole) => {
    if (profile) {
      const updated = { ...profile, role_id: role };
      setProfile(updated);
      try {
        localStorage.setItem(DEV_PROFILE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        setDevRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
