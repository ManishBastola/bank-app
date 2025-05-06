import { jwtDecode } from 'jwt-decode';
import { Account } from './accountService';
import { api } from './api';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/transaction';

export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';

export interface Transaction {
  id: number;
  accountId: number;
  amount: number;
  type: TransactionType;
  description: string;
  timestamp: string;
}

export interface CreateTransactionRequest {
  userId: number;
  accountId: number;
  type: TransactionType;
  amount: number;
  recipientName?: string;
  recipientAccountNo?: string;
}

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

// Helper function to get token
const getToken = () => localStorage.getItem('token');

// Helper function to get headers
const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Helper function to handle API errors
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('API error:', error);
    
    if (response.status === 401 || response.status === 403) {
      // Instead of redirecting, just throw an error
      throw new Error('Authentication required. Please login again.');
    }
    
    throw new Error(error.message || 'An error occurred');
  }
  return response;
};

class TransactionService {
  private baseUrl = 'http://localhost:8080/account';

  private getToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
    return token;
  }

  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${this.baseUrl}/transaction/history`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    return response.json();
  }

  async getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
    const response = await fetch(`${this.baseUrl}/transactions/${accountId}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Please login again');
      throw new Error('Failed to fetch transactions');
    }

    return response.json();
  }

  // Create a new transaction
  async createTransaction(request: CreateTransactionRequest): Promise<Transaction> {
    try {
      const response = await api.post('/transactions/add', request);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to create transaction');
    }
  }

  // Get a single transaction by ID
  async getTransactionById(transactionId: number): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/${transactionId}`, {
      headers: getHeaders(),
    });

    await handleApiError(response);
    return response.json();
  }

  // Transfer money between accounts
  async transferMoney(
    accountId: number,
    recipientName: string,
    recipientAccountNumber: string,
    amount: number
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transfer/${accountId}`,
        {},
        {
          params: {
            recipientName,
            recipientAccountNumber,
            amount
          },
          headers: {
            Authorization: `Bearer ${this.getToken()}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to process transfer');
    }
  }

  // Deposit money to an account
  async depositMoney(accountId: number, amount: number): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/deposit/${accountId}/${amount}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to process deposit');
    }
  }

  // Withdraw money from an account
  async withdrawMoney(accountId: number, amount: number): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/withdraw/${accountId}/${amount}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to process withdrawal');
    }
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    try {
      const response = await api.get(`/transactions/user/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }

  async getTransactionsByAccountNumber(accountNumber: string): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/transactions/${accountNumber}`, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
}

export const transactionService = new TransactionService(); 