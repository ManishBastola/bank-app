export type AccountType = 'SAVINGS' | 'CHECKING' | 'FIXED_DEPOSIT';

export interface Account {
  id: number;
  userId: number;
  accountType: AccountType;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountRequest {
  userId: number;
  accountType: AccountType;
  balance: number;
} 