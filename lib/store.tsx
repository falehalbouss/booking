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
import type { Booking, BookingStatus, NewBookingInput } from "./types";
import type { Database } from "./database.types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type AuthUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

type ActionResult = { error: string | null; needsConfirmation?: boolean };

type AdminProfile = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
};

type AppContextValue = {
  bookings: Booking[];
  addBooking: (input: NewBookingInput) => Promise<Booking | null>;
  getBooking: (id: string) => Booking | undefined;
  user: AuthUser | null;
  isSignedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<ActionResult>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<ActionResult>;
  signOut: () => Promise<void>;
  fetchAllBookings: () => Promise<Booking[]>;
  fetchAllProfiles: () => Promise<AdminProfile[]>;
  updateBookingStatus: (
    id: string,
    status: BookingStatus
  ) => Promise<{ error: string | null }>;
  deleteBooking: (id: string) => Promise<{ error: string | null }>;
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

      const profileRes = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      const bookingsRes = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      const profile = profileRes.data as ProfileRow | null;
      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          isAdmin: profile.is_admin,
        });
      } else {
        setUser({
          id: authUser.id,
          name: authUser.email?.split("@")[0] ?? "Guest",
          email: authUser.email ?? "",
          isAdmin: false,
        });
      }

      const rows = (bookingsRes.data ?? []) as BookingRow[];
      setBookings(rows.map(rowToBooking));
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
      // Some networks (Kaspersky/Norton HTTPS scan, corporate proxies, parental
      // controls) accept the POST but never deliver the response back to the
      // browser. Race the call against an 8s timeout, then fall back to
      // checking whether a session was actually established locally.
      const trimmedEmail = email.trim();
      const signInPromise = supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      const timeout = new Promise<"timeout">((resolve) =>
        setTimeout(() => resolve("timeout"), 8000)
      );

      const result = await Promise.race([signInPromise, timeout]);

      if (result === "timeout") {
        // Give the supabase client another beat to process the response
        // (sometimes it lands but takes longer than 8s) and then verify.
        await new Promise((r) => setTimeout(r, 800));
        const { data } = await supabase.auth.getSession();
        if (data.session) return { error: null };
        return {
          error:
            "Your network blocked the response. Try mobile data, a VPN, or disable HTTPS scanning. · شبكتك حجبت الرد. جرّب بيانات الجوال أو VPN أو عطّل HTTPS scan في برنامج الحماية.",
        };
      }

      return { error: result.error?.message ?? null };
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
    setUser(null);
    setBookings([]);
    try {
      await supabase.auth.signOut();
    } catch {
      // Even if the network call fails, the local session is already cleared.
    }
  }, [supabase]);

  const addBooking = useCallback(
    async (input: NewBookingInput): Promise<Booking | null> => {
      if (!user) return null;
      const room = findRoom(input.roomId);
      if (!room) return null;

      // The strict RLS lets anyone INSERT but only admins SELECT, so we
      // can't .select() the inserted row back. Generate the id client-side
      // and reconstruct the Booking locally on success.
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const ref = generateRef();
      const createdAt = new Date().toISOString();

      const { error } = await supabase.from("bookings").insert({
        id,
        ref,
        user_id: user.id,
        room_id: room.id,
        room_name_en: room.nameEn,
        room_name_ar: room.nameAr,
        full_name: input.fullName.trim(),
        phone: input.phone.trim(),
        check_in: input.checkIn,
        notes: input.notes?.trim() || null,
        status: "done",
      });

      if (error) return null;

      const booking: Booking = {
        id,
        ref,
        roomId: room.id,
        roomNameEn: room.nameEn,
        roomNameAr: room.nameAr,
        fullName: input.fullName.trim(),
        phone: input.phone.trim(),
        checkIn: input.checkIn,
        notes: input.notes?.trim() || undefined,
        status: "done",
        createdAt,
      };
      setBookings((prev) => [booking, ...prev]);
      return booking;
    },
    [supabase, user]
  );

  const getBooking = useCallback(
    (id: string) => bookings.find((b) => b.id === id),
    [bookings]
  );

  const fetchAllBookings = useCallback(async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as BookingRow[]).map(rowToBooking);
  }, [supabase]);

  const fetchAllProfiles = useCallback(async (): Promise<AdminProfile[]> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as ProfileRow[]).map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      isAdmin: p.is_admin,
      createdAt: p.created_at,
    }));
  }, [supabase]);

  const updateBookingStatus = useCallback(
    async (id: string, status: BookingStatus) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);
      if (error) return { error: error.message };
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
      return { error: null };
    },
    [supabase]
  );

  const deleteBooking = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) return { error: error.message };
      setBookings((prev) => prev.filter((b) => b.id !== id));
      return { error: null };
    },
    [supabase]
  );

  return (
    <AppContext.Provider
      value={{
        bookings,
        addBooking,
        getBooking,
        user,
        isSignedIn: user !== null,
        isAdmin: user?.isAdmin ?? false,
        loading,
        signIn,
        signUp,
        signOut,
        fetchAllBookings,
        fetchAllProfiles,
        updateBookingStatus,
        deleteBooking,
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
    isAdmin: ctx.isAdmin,
    loading: ctx.loading,
    signIn: ctx.signIn,
    signUp: ctx.signUp,
    signOut: ctx.signOut,
  };
}

export function useAdmin() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAdmin must be used inside <BookingProvider>");
  return {
    isAdmin: ctx.isAdmin,
    loading: ctx.loading,
    fetchAllBookings: ctx.fetchAllBookings,
    fetchAllProfiles: ctx.fetchAllProfiles,
    updateBookingStatus: ctx.updateBookingStatus,
    deleteBooking: ctx.deleteBooking,
  };
}
