
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string; // ISO string
  categoryId: string;
  accountId: string;
}

export interface Account {
  id:string;
  name: string;
  balance: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO string
}

export enum ReportPeriod {
    WEEKLY = 'Tuần',
    MONTHLY = 'Tháng',
    QUARTERLY = 'Quý',
    YEARLY = 'Năm'
}
