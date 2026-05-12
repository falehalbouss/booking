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
import type {
  Booking,
  BookingStatus,
  NewBookingInput,
  PaymentStatus,
} from "./types";
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

type AddBookingResult =
  | { booking: Booking; paymentUrl: string }
  | { error: string };

type AppContextValue = {
  bookings: Booking[];
  addBooking: (input: NewBookingInput) => Promise<AddBookingResult>;
  getBooking: (id: string) => Booking | undefined;
  refreshBooking: (id: string) => Promise<Booking | null>;
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

// Booking reference: LH- prefix + 8 hex chars from a cryptographically
// secure source (~4.3 billion values), so refs cannot be enumerated and
// effectively never collide. Falls back to Math.random() only in old
// runtimes where crypto.getRandomValues isn't available.
function generateRef() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
  const len = 8;
  let out = "";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buf = new Uint32Array(len);
    crypto.getRandomValues(buf);
    for (let i = 0; i < len; i++) out += alphabet[buf[i] % alphabet.length];
  } else {
    for (let i = 0; i < len; i++)
      out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `LH-${out}`;
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
    nights: row.nights ?? 1,
    totalKWD: Number(row.total_kwd ?? 0),
    paymentStatus: (row.payment_status ?? "pending") as PaymentStatus,
    paymentId: row.payment_id ?? undefined,
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

      // Set basic user info immediately from the auth payload so the UI
      // doesn't wait for the profile + bookings round-trip. We refine it
      // below if those calls succeed.
      setUser((prev) =>
        prev?.id === authUser.id
          ? prev
          : {
              id: authUser.id,
              name: authUser.email?.split("@")[0] ?? "Guest",
              email: authUser.email ?? "",
              isAdmin: false,
            }
      );

      try {
        const profileRes = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();
        const profile = profileRes.data as ProfileRow | null;
        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            isAdmin: profile.is_admin,
          });
        }
      } catch {
        // ignore, basic user info is already set
      }

      try {
        const bookingsRes = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false });
        const rows = (bookingsRes.data ?? []) as BookingRow[];
        setBookings(rows.map(rowToBooking));
      } catch {
        // ignore — bookings stay as they were (possibly local additions)
      }
    },
    [supabase]
  );

  useEffect(() => {
    let mounted = true;

    // Always release the loading flag within 3s so the UI can render
    // even if auth.getSession() never resolves on a flaky network.
    const loadingFallback = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;
        await loadForAuthUser(session?.user ?? null);
      } catch {
        // ignore — UI proceeds in signed-out state
      } finally {
        if (mounted) {
          clearTimeout(loadingFallback);
          setLoading(false);
        }
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      // Fire-and-forget: never block on this.
      void loadForAuthUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      clearTimeout(loadingFallback);
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
      const signUpPromise = supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: name.trim() },
        },
      });
      const timeout = new Promise<"timeout">((resolve) =>
        setTimeout(() => resolve("timeout"), 8000)
      );

      const result = await Promise.race([signUpPromise, timeout]);

      if (result === "timeout") {
        await new Promise((r) => setTimeout(r, 800));
        const { data } = await supabase.auth.getSession();
        if (data.session) return { error: null };
        return {
          error:
            "Your network blocked the response. Try mobile data, a VPN, or disable HTTPS scanning. · شبكتك حجبت الرد. جرّب بيانات الجوال أو VPN أو عطّل HTTPS scan في برنامج الحماية.",
        };
      }

      if (result.error) return { error: result.error.message };
      const needsConfirmation = !result.data.session;
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
    async (input: NewBookingInput): Promise<AddBookingResult> => {
      if (!user) return { error: "Please sign in first." };
      const room = findRoom(input.roomId);
      if (!room) return { error: "Room not found." };

      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const ref = generateRef();
      const createdAt = new Date().toISOString();
      const nights = Math.max(1, Math.min(30, input.nights || 1));
      const totalKWD = Number((nights * room.priceKWD).toFixed(3));

      const { error: insertError } = await supabase.from("bookings").insert({
        id,
        ref,
        user_id: user.id,
        room_id: room.id,
        room_name_en: room.nameEn,
        room_name_ar: room.nameAr,
        full_name: input.fullName.trim(),
        phone: input.phone.trim(),
        check_in: input.checkIn,
        nights,
        total_kwd: totalKWD,
        notes: input.notes?.trim() || null,
        status: "pending",
        payment_status: "pending",
      });

      if (insertError) {
        return { error: insertError.message };
      }

      const booking: Booking = {
        id,
        ref,
        roomId: room.id,
        roomNameEn: room.nameEn,
        roomNameAr: room.nameAr,
        fullName: input.fullName.trim(),
        phone: input.phone.trim(),
        checkIn: input.checkIn,
        nights,
        totalKWD,
        paymentStatus: "pending",
        notes: input.notes?.trim() || undefined,
        status: "pending",
        createdAt,
      };
      setBookings((prev) => [booking, ...prev]);

      // Initiate payment via our API route (server-side keeps the
      // MyFatoorah token secret AND recomputes the amount from roomId
      // + nights so the client cannot tamper with the price).
      try {
        const res = await fetch("/api/payment/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: id,
            bookingRef: ref,
            roomId: room.id,
            nights,
            customerName: input.fullName.trim(),
            customerMobile: input.phone.trim(),
            language: "en",
          }),
        });
        const json = (await res.json()) as
          | { invoiceUrl: string; invoiceId: number }
          | { error: string };

        if (!res.ok || "error" in json) {
          const msg =
            "error" in json ? json.error : `Payment init failed (${res.status})`;
          return { error: msg };
        }

        // The MyFatoorah callback now writes the verified payment_id
        // server-side after the user pays, so we no longer need a
        // client-side UPDATE on bookings (which the dropped RLS policy
        // would block anyway).
        const paymentId = String(json.invoiceId);
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, paymentId } : b))
        );

        return { booking: { ...booking, paymentId }, paymentUrl: json.invoiceUrl };
      } catch (e) {
        return {
          error: e instanceof Error ? e.message : "Network error",
        };
      }
    },
    [supabase, user]
  );

  const refreshBooking = useCallback(
    async (id: string): Promise<Booking | null> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) return null;
      const booking = rowToBooking(data as BookingRow);
      setBookings((prev) => {
        const exists = prev.some((b) => b.id === booking.id);
        return exists
          ? prev.map((b) => (b.id === booking.id ? booking : b))
          : [booking, ...prev];
      });
      return booking;
    },
    [supabase]
  );

  // Note: the previous applyPaymentResult() helper was removed. It let
  // the client mark its own booking as paid based on URL query params,
  // which any signed-in user could forge by typing ?payment=paid into
  // the browser. The MyFatoorah callback now performs the verified DB
  // write server-side using a service-role client. The confirmation
  // page only re-reads the booking row to render the result.

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
        refreshBooking,
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
