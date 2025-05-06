import { jwtDecode } from 'jwt-decode';
import { api } from './api';

const API_BASE_URL = 'http://localhost:8080/account';

export type AccountType = 'SAVINGS' | 'CHECKING';

export interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  customerId: number;
  username: string;
  status: string;
  createdAt: string;
}

export interface CreateAccountRequest {
  accountType: AccountType;
  balance: number;
}

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

// Helper function to get token
const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    // Verify token is valid by attempting to decode it
    jwtDecode(token);
    return token;
  } catch (error) {
    localStorage.removeItem('token');
    throw new Error('Invalid authentication token');
  }
};

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
    throw new Error(error.message || 'An error occurred');
  }
  return response;
};

class AccountService {
  async getAllAccounts(): Promise<Account[]> {
    const response = await api.get('/account/all');
    return response.data;
  }

  async getUserAccounts(): Promise<Account[]> {
    try {
      console.log('Fetching user accounts...');
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await api.get('/account/my');
      console.log('Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user accounts:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch user accounts');
    }
  }

  async createAccount(accountType: string): Promise<Account> {
    const response = await api.post('/account/create', { accountType });
    return response.data;
  }

  // Get a single account by ID
  async getAccountById(accountId: number): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/${accountId}`, {
      headers: getHeaders(),
    });

    await handleApiError(response);
    return response.json();
  }

  // Get account balance
  async getAccountBalance(accountId: number): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/${accountId}/balance`, {
      headers: getHeaders(),
    });

    await handleApiError(response);
    return response.json();
  }
}

export const accountService = new AccountService(); 