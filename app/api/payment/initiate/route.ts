import { NextResponse } from "next/server";
import { isDemoMode, sendPayment } from "@/lib/myfatoorah";
import { findRoom } from "@/lib/rooms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Body = {
  bookingId: string;
  bookingRef: string;
  roomId: string;
  nights: number;
  customerName: string;
  customerMobile: string;
  language?: "en" | "ar";
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body.bookingId ||
    !body.bookingRef ||
    !body.roomId ||
    typeof body.nights !== "number" ||
    !body.customerName ||
    !body.customerMobile
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Look up the room price server-side. The client must not be trusted to
  // tell us how much to charge — a tampered request could otherwise pay
  // 1 KWD for a 100 KWD stay.
  const room = findRoom(body.roomId);
  if (!room) {
    return NextResponse.json({ error: "Unknown room" }, { status: 400 });
  }

  const nights = Math.max(1, Math.min(30, Math.floor(body.nights)));
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
