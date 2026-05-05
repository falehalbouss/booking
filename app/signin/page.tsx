"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/components/Header";
import { ambianceImageUrl } from "@/lib/rooms";
import { useAuth } from "@/lib/store";

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please fill in all required fields. الرجاء تعبئة الحقول المطلوبة.");
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    router.push("/");
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-page py-8 lg:py-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <aside className="hidden lg:block lg:col-span-6 relative rounded-3xl overflow-hidden bg-sand min-h-[600px]">
              <Image
                src={ambianceImageUrl}
                alt="Layali Hotel ambiance"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 0vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/15 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="eyebrow text-white/85">Welcome back · أهلاً بعودتك</span>
                <p className="display-serif mt-2 text-3xl font-extrabold leading-tight">
                  Pick up where you left off.
                </p>
                <p className="display-serif text-2xl text-white/90 mt-1" dir="rtl">
                  أكمل من حيث توقفت.
                </p>
              </div>
            </aside>

            <section className="lg:col-span-6 flex items-center">
              <div className="w-full max-w-md mx-auto">
                <span className="eyebrow text-brand">Sign in · دخول</span>
                <h1 className="display-serif mt-2 text-4xl font-extrabold text-ink">
                  Welcome back
                </h1>
                <p className="display-serif text-2xl text-ink-muted" dir="rtl">
                  مرحباً بعودتك
                </p>
                <p className="mt-3 text-sm text-ink-muted">
                  Sign in to continue booking your stay.
                </p>
                <p className="text-sm text-ink-muted" dir="rtl">
                  سجّل الدخول لمتابعة حجز إقامتك.
                </p>

                <form onSubmit={onSubmit} className="mt-6 card p-6 space-y-4">
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
                    <p className="text-sm text-brand-dark bg-brand-soft border border-brand/30 rounded-xl p-3">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Signing in…" : "Sign in · تسجيل الدخول"}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-ink-muted">
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
