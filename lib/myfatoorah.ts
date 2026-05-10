// Server-side helper for MyFatoorah payment integration.
// Docs: https://docs.myfatoorah.com/docs/api-cards

const TEST_BASE_URL = "https://apitest.myfatoorah.com";
const LIVE_BASE_URL = "https://api.myfatoorah.com";

// Public test token from the MyFatoorah documentation
// (https://docs.myfatoorah.com/docs/api-key). Used as the default so the
// integration works out of the box without a merchant account. Override
// in production via the MYFATOORAH_API_KEY env var.
const TEST_TOKEN =
  "SK_KWT_vVZlnnAqu8jRByOWaRPNId4ShzEDNt256dvnjebuyzo52dXjAfRx2ixW5umjWSUx";

function getConfig() {
  const isLive = process.env.MYFATOORAH_MODE === "live";
  return {
    baseUrl: isLive ? LIVE_BASE_URL : TEST_BASE_URL,
    token: process.env.MYFATOORAH_API_KEY || TEST_TOKEN,
  };
}

// Kept for backwards-compat with the API route, but always returns false
// now: the bundled public sandbox token works for testing without a real
// account, so we no longer need a fake-payment shortcut.
export function isDemoMode(): boolean {
  return false;
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
