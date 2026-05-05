"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { findRoom } from "./rooms";
import { getSupabaseBrowserClient } from "./supabase";
import type { Booking, NewBookingInput } from "./types";
import type { Database } from "./database.types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type ActionResult = { error: string | null; needsConfirmation?: boolean };

type AppContextValue = {
  bookings: Booking[];
  addBooking: (input: NewBookingInput) => Promise<Booking | null>;
  getBooking: (id: string) => Booking | undefined;
  user: AuthUser | null;
  isSignedIn: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<ActionResult>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<ActionResult>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function generateRef() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `LH-${num}`;
}

function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    ref: row.ref,
    roomId: row.room_id,
    roomNameEn: row.room_name_en,
    roomNameAr: row.room_name_ar,
    fullName: row.full_name,
    phone: row.phone,
    checkIn: row.check_in,
    notes: row.notes ?? undefined,
    status: row.status === "pending" ? "pending" : "done",
    createdAt: row.created_at,
  };
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadForAuthUser = useCallback(
    async (authUser: { id: string; email?: string } | null) => {
      if (!authUser) {
        setUser(null);
        setBookings([]);
        return;
      }

      const [profileRes, bookingsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, name, email")
          .eq("id", authUser.id)
          .maybeSingle(),
        supabase
          .from("bookings")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false }),
      ]);

      if (profileRes.data) {
        setUser({
          id: profileRes.data.id,
          name: profileRes.data.name,
          email: profileRes.data.email,
        });
      } else {
        setUser({
          id: authUser.id,
          name: authUser.email?.split("@")[0] ?? "Guest",
          email: authUser.email ?? "",
        });
      }

      setBookings((bookingsRes.data ?? []).map(rowToBooking));
    },
    [supabase]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      await loadForAuthUser(session?.user ?? null);
      if (mounted) setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      await loadForAuthUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadForAuthUser]);

  const signIn = useCallback<AppContextValue["signIn"]>(
    async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const signUp = useCallback<AppContextValue["signUp"]>(
    async (name, email, password) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: name.trim() },
        },
      });
      if (error) return { error: error.message };
      const needsConfirmation = !data.session;
      return { error: null, needsConfirmation };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const addBooking = useCallback(
    async (input: NewBookingInput): Promise<Booking | null> => {
      if (!user) return null;
      const room = findRoom(input.roomId);
      if (!room) return null;

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          ref: generateRef(),
          user_id: user.id,
          room_id: room.id,
          room_name_en: room.nameEn,
          room_name_ar: room.nameAr,
          full_name: input.fullName.trim(),
          phone: input.phone.trim(),
          check_in: input.checkIn,
          notes: input.notes?.trim() || null,
          status: "done",
        })
        .select("*")
        .single();

      if (error || !data) return null;
      const booking = rowToBooking(data);
      setBookings((prev) => [booking, ...prev]);
      return booking;
    },
    [supabase, user]
  );

  const getBooking = useCallback(
    (id: string) => bookings.find((b) => b.id === id),
    [bookings]
  );

  return (
    <AppContext.Provider
      value={{
        bookings,
        addBooking,
        getBooking,
        user,
        isSignedIn: user !== null,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useBookings must be used inside <BookingProvider>");
  return ctx;
}

export function useAuth() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAuth must be used inside <BookingProvider>");
  return {
    user: ctx.user,
    isSignedIn: ctx.isSignedIn,
    loading: ctx.loading,
    signIn: ctx.signIn,
    signUp: ctx.signUp,
    signOut: ctx.signOut,
  };
}
