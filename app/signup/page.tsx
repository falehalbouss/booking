"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Header from "@/components/Header";
import { heroImageUrl } from "@/lib/rooms";
import { useAuth } from "@/lib/store";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}

function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!fullName.trim() || !email.trim() || !password || !confirm) {
      setError("Please fill in all required fields. الرجاء تعبئة الحقول المطلوبة.");
      return;
    }
    if (password.length < 10) {
      setError(
        "Password must be at least 10 characters. كلمة المرور يجب أن تكون 10 أحرف على الأقل."
      );
      return;
    }
    const hasLetter = /[A-Za-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    if (!hasLetter || !hasDigit) {
      setError(
        "Password must contain letters and numbers. يجب أن تحتوي كلمة المرور على أحرف وأرقام."
      );
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match. كلمتا المرور غير متطابقتين.");
      return;
    }
    setSubmitting(true);
    const { error, needsConfirmation } = await signUp(fullName, email, password);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    if (needsConfirmation) {
      setInfo(
        "Check your inbox to confirm your email, then sign in. تحقق من بريدك لتأكيد الحساب ثم سجّل الدخول."
      );
      return;
    }
    router.push(next.startsWith("/") ? next : "/");
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-page py-8 lg:py-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <aside className="hidden lg:block lg:col-span-6 relative rounded-3xl overflow-hidden bg-sand min-h-[600px]">
              <Image
                src={heroImageUrl}
                alt="Layali Hotel"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 0vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/15 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="eyebrow text-white/85">Begin · ابدأ</span>
                <p className="display-serif mt-2 text-3xl font-extrabold leading-tight">
                  A warm welcome awaits.
                </p>
                <p className="display-serif text-2xl text-white/90 mt-1" dir="rtl">
                  ترحيب دافئ بانتظارك.
                </p>
              </div>
            </aside>

            <section className="lg:col-span-6 flex items-center">
              <div className="w-full max-w-md mx-auto">
                <span className="eyebrow text-brand">Create · إنشاء</span>
                <h1 className="display-serif mt-2 text-4xl font-extrabold text-ink">
                  Create account
                </h1>
                <p className="display-serif text-2xl text-ink-muted" dir="rtl">
                  إنشاء حساب
                </p>
                <p className="mt-3 text-sm text-ink-muted">
                  Join us and book your stay in seconds.
                </p>
                <p className="text-sm text-ink-muted" dir="rtl">
                  انضم إلينا واحجز إقامتك خلال ثوانٍ.
                </p>

                <form onSubmit={onSubmit} className="mt-6 card p-6 space-y-4">
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
                      minLength={10}
                      className="input-base"
                      placeholder="At least 10 chars, letters + numbers"
                    />
                  </Field>

                  <Field labelEn="Confirm password" labelAr="تأكيد كلمة المرور" required>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                      minLength={10}
                      className="input-base"
                      placeholder="••••••••"
                    />
                  </Field>

                  {error && (
                    <p className="text-sm text-brand-dark bg-brand-soft border border-brand/30 rounded-xl p-3">
                      {error}
                    </p>
                  )}
                  {info && (
                    <p className="text-sm text-accent-dark bg-accent-soft border border-accent/30 rounded-xl p-3">
                      {info}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Creating…" : "Create account · إنشاء حساب"}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-ink-muted">
                  <p>
                    Already have an account?{" "}
                    <Link
                      href={`/signin?next=${encodeURIComponent(next)}`}
                      className="text-brand font-semibold hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                  <p dir="rtl">
                    عندك حساب بالفعل؟{" "}
                    <Link
                      href={`/signin?next=${encodeURIComponent(next)}`}
                      className="text-brand font-semibold hover:underline"
                    >
                      سجّل دخول
                    </Link>
                  </p>
                </div>
              </div>
            </section>
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
      <span className="text-sm font-medium text-ink">
        {labelEn}
        {required && <span className="text-brand"> *</span>}
      </span>
      <span className="block text-xs text-ink-muted mb-1.5" dir="rtl">{labelAr}</span>
      {children}
    </label>
  );
}
