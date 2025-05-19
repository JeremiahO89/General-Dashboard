export const transactionTypes = ["income", "expense"] as const;
export type TransactionType = typeof transactionTypes[number];

export const categories = [
  "General", "Food", "Transport", "Utilities", "Shopping", "Salary", "Investment", "Savings", "Other"
] as const;
export type CategoryType = typeof categories[number];

export interface Transaction {
  id: number;
  name: string;
  category: string;
  amount: number;
  type: TransactionType;
  date: string;
}

export interface NewTransaction {
  name: string;
  category: string;
  amount: number;
  type: TransactionType;
  date: string;
}
