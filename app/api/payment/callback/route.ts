import { NextResponse } from "next/server";
import { getPaymentStatus } from "@/lib/myfatoorah";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// MyFatoorah redirects the user to this route after they finish paying.
// We verify the payment server-side, then send them to the confirmation
// page with a status query string. The client uses that to update the
// booking row in Supabase (RLS allows the booking owner to do so).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const bookingId = url.searchParams.get("bookingId");
  const paymentId = url.searchParams.get("paymentId");
  const isError = url.searchParams.get("error") === "1";
  const origin = url.origin;

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
    return NextResponse.redirect(
      `${origin}/confirmation/${bookingId}?payment=failed&reason=${encodeURIComponent(
        status.error
      )}`
    );
  }

  const paymentParam =
    status.invoiceStatus === "Paid" ? "paid" : "failed";

  return NextResponse.redirect(
    `${origin}/confirmation/${bookingId}?payment=${paymentParam}&paymentId=${paymentId}`
  );
}
