import { NextResponse } from "next/server";
import { getPaymentStatus } from "@/lib/myfatoorah";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// MyFatoorah redirects the user to this route after they finish paying.
// We verify the payment server-side AND verify that the paymentId
// actually belongs to the booking referenced in the URL (otherwise an
// attacker could craft a callback URL using someone else's paid
// paymentId to mark their own booking as paid).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const bookingId = url.searchParams.get("bookingId");
  const paymentId = url.searchParams.get("paymentId");
  const isError = url.searchParams.get("error") === "1";
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;

  if (!bookingId) {
    return NextResponse.redirect(`${origin}/`);
  }

  // Customer hit the error url (cancelled, declined, etc).
  if (isError || !paymentId) {
    return NextResponse.redirect(
      `${origin}/confirmation/${bookingId}?payment=failed`
    );
  }

  const status = await getPaymentStatus(paymentId);

  if ("error" in status) {
    // Map upstream error details to an opaque code so we don't leak
    // gateway internals into the browser history / referrer header.
    return NextResponse.redirect(
      `${origin}/confirmation/${bookingId}?payment=failed`
    );
  }

  // Look the booking up via service role so we can validate the payment
  // even when no user session is attached to this request.
  let admin;
  try {
    admin = getSupabaseAdminClient();
  } catch {
    // Service role key missing — fail closed.
    return NextResponse.redirect(
      `${origin}/confirmation/${bookingId}?payment=failed`
    );
  }

  const { data: booking, error: fetchError } = await admin
    .from("bookings")
    .select("id, ref, total_kwd")
    .eq("id", bookingId)
    .maybeSingle();

  if (fetchError || !booking) {
    return NextResponse.redirect(`${origin}/confirmation/${bookingId}?payment=failed`);
  }

  // Bind the paymentId to this specific booking by comparing the
  // customer reference MyFatoorah recorded against the booking's own
  // ref, AND the amount paid against the booking's total. Either
  // mismatch means the URL was forged with someone else's paymentId.
  const refMatches = status.customerReference === booking.ref;
  const amountMatches =
    Math.abs(Number(booking.total_kwd) - status.invoiceValue) < 0.001;

  if (!refMatches || !amountMatches) {
    return NextResponse.redirect(
      `${origin}/confirmation/${bookingId}?payment=failed`
    );
  }

  const paymentParam = status.invoiceStatus === "Paid" ? "paid" : "failed";

  return NextResponse.redirect(
    `${origin}/confirmation/${bookingId}?payment=${paymentParam}&paymentId=${paymentId}`
  );
}
