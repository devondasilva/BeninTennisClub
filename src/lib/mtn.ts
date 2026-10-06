// MTN Mobile Money — API Collection (requesttopay)
// Doc : https://momodeveloper.mtn.com/api-documentation
import { randomUUID } from "crypto";

const base = () => process.env.MTN_MOMO_BASE_URL || "https://sandbox.momodeveloper.mtn.com";

async function accessToken() {
  const auth = Buffer.from(`${process.env.MTN_MOMO_API_USER}:${process.env.MTN_MOMO_API_KEY}`).toString("base64");
  const res = await fetch(`${base()}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Ocp-Apim-Subscription-Key": process.env.MTN_MOMO_SUBSCRIPTION_KEY!,
    },
  });
  if (!res.ok) throw new Error(`MTN token: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

export async function requestToPay(amount: number, phone: string, externalId: string, note: string) {
  const ref = randomUUID();
  const token = await accessToken();
  const env = process.env.MTN_MOMO_TARGET_ENV || "sandbox";
  const res = await fetch(`${base()}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": ref,
      "X-Target-Environment": env,
      "Ocp-Apim-Subscription-Key": process.env.MTN_MOMO_SUBSCRIPTION_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(Math.round(amount)),
      currency: env === "sandbox" ? "EUR" : "XOF", // la sandbox MTN n'accepte que l'EUR
      externalId,
      payer: { partyIdType: "MSISDN", partyId: phone.replace(/\D/g, "") },
      payerMessage: note,
      payeeNote: note,
    }),
  });
  if (res.status !== 202) throw new Error(`MTN requesttopay: ${res.status} ${await res.text()}`);
  return ref;
}

export async function paymentStatus(ref: string): Promise<"PENDING" | "SUCCESSFUL" | "FAILED"> {
  const token = await accessToken();
  const res = await fetch(`${base()}/collection/v1_0/requesttopay/${ref}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Target-Environment": process.env.MTN_MOMO_TARGET_ENV || "sandbox",
      "Ocp-Apim-Subscription-Key": process.env.MTN_MOMO_SUBSCRIPTION_KEY!,
    },
  });
  const data = await res.json();
  return data.status;
}
