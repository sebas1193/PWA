export type PaymentMethod = "cash" | "credit" | "savings";

export type Transaction = {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string | null;
  transactionDate: string;
  location?: { lat: number; lng: number } | null;
  createdAt?: unknown;
};

export type UserProfile = {
  displayName: string;
  email: string;
  createdAt?: unknown;
};
