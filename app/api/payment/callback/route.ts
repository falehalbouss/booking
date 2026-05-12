import { NextResponse } from "next/server";
import { z } from "zod";
import { getPaymentStatus } from "@/lib/myfatoorah";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const BookingIdSchema = z.string().uuid();
const PaymentIdSchema = z.string().min(1).max(64);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// MyFatoorah redirects the user to this route after they finish paying.
// We verify the payment server-side AND verify that the paymentId
// actually belongs to the booking referenced in the URL (otherwise an
// attacker could craft a callback URL using someone else's paid
// paymentId to mark their own booking as paid).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawBookingId = url.searchParams.get("bookingId");
  const rawPaymentId = url.searchParams.get("paymentId");
  const isError = url.searchParams.get("error") === "1";
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;

  const bookingIdResult = BookingIdSchema.safeParse(rawBookingId);
  if (!bookingIdResult.success) {
    return NextResponse.redirect(`${origin}/`);
  }
  const bookingId = bookingIdResult.data;

  // Customer hit the error url (cancelled, declined, etc).
  const paymentIdResult = PaymentIdSchema.safeParse(rawPaymentId);
  if (isError || !paymentIdResult.success) {
    return NextResponse.redirect(
      `${origin}/confirmation/${bookingId}?payment=failed`
    );
  }
  const paymentId = paymentIdResult.data;

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

  const isPaid = status.invoiceStatus === "Paid";

  // Persist the verified payment outcome server-side. The client used to
  // do this from the confirmation page based on URL query params, which
  // let any signed-in user mark their own booking as paid by hand-typing
  // ?payment=paid in the URL bar — a complete payment bypass.
  const { error: updateError } = await admin
    .from("bookings")
    .update({
      payment_status: isPaid ? "paid" : "failed",
      status: isPaid ? "done" : "pending",
      payment_id: paymentId,
    })
    .eq("id", bookingId);

  if (updateError) {
    return NextResponse.redirect(
      `${origin}/confirmation/${bookingId}?payment=failed`
    );
  }

  return NextResponse.redirect(
    `${origin}/confirmation/${bookingId}?payment=${isPaid ? "paid" : "failed"}`
  );
}
