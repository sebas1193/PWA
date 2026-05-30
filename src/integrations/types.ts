export type PaymentMethod = "cash" | "credit" | "savings";

export type BankType = "credit" | "savings";

export type Bank = {
  id: string;
  name: string;
  type: BankType;
  balance: number;
  createdAt?: unknown;
};

export type CategoryNature = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  nature: CategoryNature;
  createdAt?: unknown;
};

export type Transaction = {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  bankId: string | null;
  categoryId: string | null;
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
