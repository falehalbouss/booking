"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/lib/store";

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please fill in all required fields. الرجاء تعبئة الحقول المطلوبة.");
      return;
    }
    signIn(email);
    router.push("/");
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-md mx-auto px-5 py-8">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-soft text-brand flex items-center justify-center text-xl font-bold">
              L
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500" dir="rtl">مرحباً بعودتك</p>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to continue booking your stay.
            </p>
            <p className="text-sm text-slate-600" dir="rtl">
              سجّل الدخول لمتابعة حجز إقامتك.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-7 card p-5 space-y-4">
            <Field labelEn="Email" labelAr="البريد الإلكتروني" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input-base"
                placeholder="you@example.com"
              />
            </Field>

            <Field labelEn="Password" labelAr="كلمة المرور" required>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="input-base"
                placeholder="••••••••"
              />
            </Field>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full">
              Sign in · تسجيل الدخول
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-brand font-semibold hover:underline">
                Create one
              </Link>
            </p>
            <p dir="rtl">
              ما عندك حساب؟{" "}
              <Link href="/signup" className="text-brand font-semibold hover:underline">
                أنشئ حساب
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  labelEn,
  labelAr,
  required,
  children,
}: {
  labelEn: string;
  labelAr: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-800">
        {labelEn}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <span className="block text-xs text-slate-500 mb-1.5" dir="rtl">{labelAr}</span>
      {children}
    </label>
  );
}
