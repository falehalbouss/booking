import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode, sendPayment } from "@/lib/myfatoorah";
import { findRoom } from "@/lib/rooms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Strict input schema: cap string lengths so an attacker can't bloat
// the DB or send oversized payloads to MyFatoorah, and enforce a
// phone-shaped customerMobile.
const InitiateSchema = z.object({
  bookingId: z.string().uuid(),
  bookingRef: z.string().min(3).max(32),
  roomId: z.string().min(1).max(32),
  nights: z.number().int().min(1).max(30),
  customerName: z.string().min(1).max(100),
  customerMobile: z
    .string()
    .min(6)
    .max(20)
    .regex(/^\+?[0-9]+$/, "Phone must be digits, optionally with +"),
  language: z.enum(["en", "ar"]).optional(),
});

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = InitiateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
  const body = parsed.data;

  // Look up the room price server-side. The client must not be trusted to
  // tell us how much to charge — a tampered request could otherwise pay
  // 1 KWD for a 100 KWD stay.
  const room = findRoom(body.roomId);
  if (!room) {
    return NextResponse.json({ error: "Unknown room" }, { status: 400 });
  }

  const nights = body.nights;
  const totalKWD = Number((nights * room.priceKWD).toFixed(3));

  if (totalKWD <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // Use the request URL's own origin (or the explicitly configured site URL)
  // rather than the client-supplied Origin header, which an attacker could
  // spoof to redirect the post-payment callback to a host they control.
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  // Demo mode: no MyFatoorah account configured, so simulate a successful
  // payment by sending the customer straight to the confirmation page
  // marked as paid. Set MYFATOORAH_API_KEY in env to switch to real
  // MyFatoorah processing.
  if (isDemoMode()) {
    const demoPaymentId = `DEMO-${Date.now()}`;
    const invoiceUrl = `${origin}/confirmation/${body.bookingId}?payment=paid&paymentId=${demoPaymentId}&demo=1`;
    return NextResponse.json({
      invoiceId: 0,
      invoiceUrl,
      demo: true,
    });
  }

  const callbackUrl = `${origin}/api/payment/callback?bookingId=${body.bookingId}`;
  const errorUrl = `${origin}/api/payment/callback?bookingId=${body.bookingId}&error=1`;

  const result = await sendPayment({
    invoiceValue: totalKWD,
    customerName: body.customerName,
    customerMobile: body.customerMobile,
    customerReference: body.bookingRef,
    callbackUrl,
    errorUrl,
    language: body.language ?? "en",
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    invoiceId: result.invoiceId,
    invoiceUrl: result.invoiceUrl,
    totalKWD,
  });
}
