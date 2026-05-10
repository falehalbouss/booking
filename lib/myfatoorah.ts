// Server-side helper for MyFatoorah payment integration.
// Docs: https://docs.myfatoorah.com/docs/api-cards

const TEST_BASE_URL = "https://apitest.myfatoorah.com";
const LIVE_BASE_URL = "https://api.myfatoorah.com";

// Public test token from MyFatoorah documentation. Used as the default so
// the integration works out of the box. Override in production via the
// MYFATOORAH_API_KEY env var.
const TEST_TOKEN =
  "rLtt6JWvbUHDDhsZnfpAhpYk4dxYDQkbcPTyGaKp2TYqQgG7FGZ5Th_WD53Oq8Ebz6A53njUoo1w3pjU1D4vs_ZMqFiz_j0urb_BH9Oq9VZoKFoJEDAbRZepGcQanImyYrry7Kt6MnMdgfG5jn4HngWoRdKduNNyP4kzcp3mRv7x00ahkm9LAK7ZRieg7k1PDAnBIOG3EyVSJ5kK4WLMvYr7sCwHbHcu4A5WwelxYK0GMJy37bNAarSJDFQsJ2ZvJjvMDmfWwDVFEVe_5tOomfVNt6bOg9mexbGjMrnHBnKnZR1vQbBtQieDlQepzTZMuQrSuKn-t5XZM7V6fCW7oP-uXGX-sMOajeX65JOf6XVpk29DP6ro8WTuZcUJpo7Gj7p84Hi9OZlugn4DGEoOzpdAW4yPoy0Y1JVtVMG6q9CukZ4-VmOQNsSEpVEGZuhB4ZySCxIz1FZxhTqg64bLtg2lLwQk7uZi7sluaYRzWSF-OapyaQymq3MqUz9rfTC1AkDC5_d3uYLxeLwIv4uhDH9pRC_C_8d1OmCzAVQRNGBWayp1Cj-tT9eyYuS8Q5UV3Y4z3oR6PZjFL9WQK4XLnJWy1WX4z9eEC4dkHOXtMGw5LQOmOYkKPF6cHLAk5wQUlF-zlyRxvFA6oETV3RZk6r6CXHmkHvfvg2D_PnLZWO9oFLE3KJaa_S2dfRIKCLI3vWk6Lhpp9o7gNoIcimkKv4HOZGDNECwqMdo3kIY_HzRfaO9HpVvfbR3HX5sk1AjC2KxxWSlsvJEfIhnsj";

function getConfig() {
  const isLive = process.env.MYFATOORAH_MODE === "live";
  return {
    baseUrl: isLive ? LIVE_BASE_URL : TEST_BASE_URL,
    token: process.env.MYFATOORAH_API_KEY || TEST_TOKEN,
  };
}

// Demo mode is enabled when the merchant hasn't configured their own
// MyFatoorah API key. The booking flow then bypasses MyFatoorah and
// goes straight to the success page so the site is still usable for
// demos / family preview without a real merchant account.
export function isDemoMode(): boolean {
  return !process.env.MYFATOORAH_API_KEY;
}

type SendPaymentInput = {
  invoiceValue: number;
  customerName: string;
  customerMobile: string;
  customerReference: string;
  callbackUrl: string;
  errorUrl: string;
  language?: "en" | "ar";
};

type SendPaymentResponse = {
  IsSuccess: boolean;
  Message?: string;
  Data?: {
    InvoiceId: number;
    InvoiceURL: string;
    CustomerReference: string;
  };
};

export async function sendPayment(
  input: SendPaymentInput
): Promise<{ invoiceId: number; invoiceUrl: string } | { error: string }> {
  const { baseUrl, token } = getConfig();

  const body = {
    InvoiceValue: input.invoiceValue,
    CustomerName: input.customerName,
    CustomerMobile: input.customerMobile,
    CustomerReference: input.customerReference,
    CallBackUrl: input.callbackUrl,
    ErrorUrl: input.errorUrl,
    Language: (input.language ?? "en").toUpperCase(),
    DisplayCurrencyIso: "KWD",
    NotificationOption: "LNK",
    MobileCountryCode: "+965",
  };

  try {
    const res = await fetch(`${baseUrl}/v2/SendPayment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (res.status === 401) {
      return {
        error:
          "MyFatoorah rejected the API token (401). Set MYFATOORAH_API_KEY in Vercel to a valid sandbox/production token from https://portal.myfatoorah.com",
      };
    }

    if (!text) {
      return {
        error: `MyFatoorah returned ${res.status} with empty body. Check the API token + base URL.`,
      };
    }

    let json: SendPaymentResponse;
    try {
      json = JSON.parse(text) as SendPaymentResponse;
    } catch {
      return {
        error: `MyFatoorah returned non-JSON (status ${res.status}): ${text.slice(0, 200)}`,
      };
    }

    if (!json.IsSuccess || !json.Data) {
      return { error: json.Message || "MyFatoorah SendPayment failed" };
    }

    return {
      invoiceId: json.Data.InvoiceId,
      invoiceUrl: json.Data.InvoiceURL,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Network error" };
  }
}

type PaymentStatus = {
  invoiceStatus: "Paid" | "Pending" | "Failed" | "Expired";
  invoiceValue: number;
  customerReference: string | null;
  paymentMethod: string | null;
};

type GetPaymentStatusResponse = {
  IsSuccess: boolean;
  Message?: string;
  Data?: {
    InvoiceId: number;
    InvoiceStatus: string;
    InvoiceValue: number;
    CustomerReference: string | null;
    InvoiceTransactions?: Array<{
      PaymentGateway: string;
      TransactionStatus: string;
    }>;
  };
};

export async function getPaymentStatus(
  paymentId: string
): Promise<PaymentStatus | { error: string }> {
  const { baseUrl, token } = getConfig();

  try {
    const res = await fetch(`${baseUrl}/v2/getPaymentStatus`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Key: paymentId, KeyType: "PaymentId" }),
    });

    const text = await res.text();
    if (res.status === 401) {
      return { error: "MyFatoorah rejected the API token (401)" };
    }
    if (!text) {
      return { error: `MyFatoorah returned ${res.status} with empty body.` };
    }

    let json: GetPaymentStatusResponse;
    try {
      json = JSON.parse(text) as GetPaymentStatusResponse;
    } catch {
      return {
        error: `MyFatoorah returned non-JSON (status ${res.status}): ${text.slice(0, 200)}`,
      };
    }

    if (!json.IsSuccess || !json.Data) {
      return { error: json.Message || "MyFatoorah getPaymentStatus failed" };
    }

    const status = json.Data.InvoiceStatus as PaymentStatus["invoiceStatus"];
    return {
      invoiceStatus: status,
      invoiceValue: json.Data.InvoiceValue,
      customerReference: json.Data.CustomerReference,
      paymentMethod: json.Data.InvoiceTransactions?.[0]?.PaymentGateway ?? null,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Network error" };
  }
}
