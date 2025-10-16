
import { Account, Category, TransactionType } from './types';

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 'cash', name: 'Tiền mặt', balance: 5000000 },
  { id: 'bank', name: 'Tài khoản ngân hàng', balance: 20000000 },
  { id: 'credit', name: 'Thẻ tín dụng', balance: 0 },
];

export const INITIAL_CATEGORIES: Category[] = [
  // Expenses
  { id: 'food', name: 'Thực phẩm', type: TransactionType.EXPENSE },
  { id: 'transport', name: 'Di chuyển', type: TransactionType.EXPENSE },
  { id: 'housing', name: 'Nhà ở', type: TransactionType.EXPENSE },
  { id: 'utilities', name: 'Tiện ích', type: TransactionType.EXPENSE },
  { id: 'entertainment', name: 'Giải trí', type: TransactionType.EXPENSE },
  { id: 'health', name: 'Sức khỏe', type: TransactionType.EXPENSE },
  { id: 'shopping', name: 'Mua sắm', type: TransactionType.EXPENSE },
  { id: 'other_expense', name: 'Khác', type: TransactionType.EXPENSE },
  // Incomes
  { id: 'salary', name: 'Lương', type: TransactionType.INCOME },
  { id: 'bonus', name: 'Thưởng', type: TransactionType.INCOME },
  { id: 'investment', name: 'Đầu tư', type: TransactionType.INCOME },
  { id: 'other_income', name: 'Khác', type: TransactionType.INCOME },
];

export const PIE_CHART_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f97316', '#8b5cf6', '#ec4899', '#f59e0b', '#6b7280'];
