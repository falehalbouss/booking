"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { findRoom } from "./rooms";
import type { Booking, NewBookingInput } from "./types";

const STORAGE_KEY = "layali-store-v1";

type AuthUser = {
  name: string;
  email: string;
};

type PersistedState = {
  bookings: Booking[];
  user: AuthUser | null;
};

type AppContextValue = {
  bookings: Booking[];
  addBooking: (input: NewBookingInput) => Booking | null;
  markDone: (id: string) => void;
  getBooking: (id: string) => Booking | undefined;
  user: AuthUser | null;
  isSignedIn: boolean;
  signIn: (email: string) => void;
  signUp: (name: string, email: string) => void;
  signOut: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function generateRef() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `LH-${num}`;
}

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function deriveNameFromEmail(email: string) {
  const local = email.split("@")[0] || "Guest";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function loadFromStorage(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.bookings)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode errors
  }
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persisted = loadFromStorage();
    if (persisted) {
      setBookings(persisted.bookings);
      setUser(persisted.user);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage({ bookings, user });
  }, [bookings, user, hydrated]);

  const addBooking = useCallback((input: NewBookingInput): Booking | null => {
    const room = findRoom(input.roomId);
    if (!room) return null;
    const booking: Booking = {
      id: generateId(),
      ref: generateRef(),
      roomId: room.id,
      roomNameEn: room.nameEn,
      roomNameAr: room.nameAr,
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      checkIn: input.checkIn,
      notes: input.notes?.trim() || undefined,
      status: "done",
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [booking, ...prev]);
    return booking;
  }, []);

  const markDone = useCallback((id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "done" } : b))
    );
  }, []);

  const getBooking = useCallback(
    (id: string) => bookings.find((b) => b.id === id),
    [bookings]
  );

  const signIn = useCallback((email: string) => {
    setUser({ name: deriveNameFromEmail(email), email: email.trim() });
  }, []);

  const signUp = useCallback((name: string, email: string) => {
    setUser({ name: name.trim(), email: email.trim() });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        bookings,
        addBooking,
        markDone,
        getBooking,
        user,
        isSignedIn: user !== null,
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
  if (!ctx) {
    throw new Error("useBookings must be used inside <BookingProvider>");
  }
  return ctx;
}

export function useAuth() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <BookingProvider>");
  }
  return {
    user: ctx.user,
    isSignedIn: ctx.isSignedIn,
    signIn: ctx.signIn,
    signUp: ctx.signUp,
    signOut: ctx.signOut,
  };
}
