"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/lib/store";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !password || !confirm) {
      setError("Please fill in all required fields. الرجاء تعبئة الحقول المطلوبة.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters. كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match. كلمتا المرور غير متطابقتين.");
      return;
    }
    signUp(fullName, email);
    router.push("/");
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-md mx-auto px-5 py-8">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-accent-soft text-accent-dark flex items-center justify-center text-xl font-bold">
              ✨
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">
              Create account
            </h1>
            <p className="text-sm text-slate-500" dir="rtl">إنشاء حساب</p>
            <p className="mt-2 text-sm text-slate-600">
              Join us and book your stay in seconds.
            </p>
            <p className="text-sm text-slate-600" dir="rtl">
              انضم إلينا واحجز إقامتك خلال ثوانٍ.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-7 card p-5 space-y-4">
            <Field labelEn="Full name" labelAr="الاسم الكامل" required>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="input-base"
                placeholder="Mohammed Al-Saleh"
              />
            </Field>

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
                autoComplete="new-password"
                minLength={6}
                className="input-base"
                placeholder="At least 6 characters"
              />
            </Field>

            <Field labelEn="Confirm password" labelAr="تأكيد كلمة المرور" required>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
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
              Create account · إنشاء حساب
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>
              Already have an account?{" "}
              <Link href="/signin" className="text-brand font-semibold hover:underline">
                Sign in
              </Link>
            </p>
            <p dir="rtl">
              عندك حساب بالفعل؟{" "}
              <Link href="/signin" className="text-brand font-semibold hover:underline">
                سجّل دخول
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
