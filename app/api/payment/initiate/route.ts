import { NextResponse } from "next/server";
import { sendPayment } from "@/lib/myfatoorah";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Body = {
  bookingId: string;
  bookingRef: string;
  totalKWD: number;
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
    typeof body.totalKWD !== "number" ||
    !body.customerName ||
    !body.customerMobile
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (body.totalKWD <= 0) {
    return NextResponse.json(
      { error: "Invalid amount" },
      { status: 400 }
    );
  }

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const callbackUrl = `${origin}/api/payment/callback?bookingId=${body.bookingId}`;
  const errorUrl = `${origin}/api/payment/callback?bookingId=${body.bookingId}&error=1`;

  const result = await sendPayment({
    invoiceValue: body.totalKWD,
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
  });
}
