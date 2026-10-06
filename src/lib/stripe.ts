import Stripe from "stripe";

export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export const appUrl = () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
