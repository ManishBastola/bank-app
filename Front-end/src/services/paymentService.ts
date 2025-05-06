import { Account } from './accountService';
import { jwtDecode } from 'jwt-decode';

export enum PaymentType {
  TRANSFER = 'TRANSFER',
  BILL = 'BILL'
}

export enum BillCategory {
  WIFI = 'WIFI',
  POWER = 'POWER',
  RENT = 'RENT'
}

export interface TransferRequest {
  senderAccountId: number;
  recipientName: string;
  recipientAccountNumber: string;
  amount: number;
}

export interface TransferResponse {
  id: number;
  senderAccountId: number;
  recipientName: string;
  recipientAccountNumber: string;
  amount: number;
  status: string;
}

export interface BillPaymentRequest {
  fromAccountId: number;
  category: BillCategory;
  amount: number;
}

export interface BillPaymentResponse {
  id: number;
  fromAccountId: number;
  category: BillCategory;
  amount: number;
  status: string;
  timestamp: string;
}

export type PaymentRequest = TransferRequest | BillPaymentRequest;

interface DecodedToken {
  sub: string;  // username
  role: string; // CUSTOMER, EMPLOYEE, or ADMIN
  exp: number;  // expiration timestamp
}

// Helper function to get token
const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage');
    throw new Error('No authentication token found');
  }
  try {
    // Verify token is valid by attempting to decode it
    const decoded = jwtDecode<DecodedToken>(token);
    
    // Check if token has expired
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      throw new Error('Token has expired');
    }

    // Verify required claims are present
    if (!decoded.sub || !decoded.role) {
      console.error('Token missing required claims');
      throw new Error('Invalid token format: missing required claims');
    }

    // Verify role is valid
    if (!['CUSTOMER', 'EMPLOYEE', 'ADMIN'].includes(decoded.role)) {
      console.error('Invalid role in token:', decoded.role);
      throw new Error('Invalid user role');
    }

    return token;
  } catch (error) {
    console.error('Token validation error:', error);
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
    console.error('API error:', error);
    
    if (response.status === 401 || response.status === 403) {
      // Clear token on auth errors
      localStorage.removeItem('token');
      throw new Error('Authentication required. Please login again.');
    }
    
    if (response.status === 500 && error.message === 'Insufficient balance') {
      throw new Error('Insufficient balance in the selected account');
    }
    
    throw new Error(error.message || 'An error occurred');
  }
  return response;
};

class PaymentService {
  private accountBaseUrl = 'http://localhost:8080';
  private billBaseUrl = 'http://localhost:8080/payment/api';

  async makeTransfer(request: TransferRequest): Promise<TransferResponse> {
    const token = getToken();
    
    // Verify user role from token
    const decoded = jwtDecode<DecodedToken>(token);
    console.log('User role:', decoded.role);

    // Validate account type
    const senderAccount = await this.getAccountById(request.senderAccountId);
    if (!senderAccount) {
      throw new Error('Sender account not found');
    }

    if (senderAccount.accountType !== 'SAVINGS' && senderAccount.accountType !== 'CHECKING') {
      throw new Error('Invalid account type. Only SAVINGS or CHECKING accounts are allowed.');
    }

    try {
      const response = await fetch(`${this.accountBaseUrl}/transfer/make`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          senderAccountId: request.senderAccountId,
          recipientName: request.recipientName,
          recipientAccountNumber: request.recipientAccountNumber,
          amount: request.amount
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Transfer failed');
      }

      const responseData = await response.json();
      console.log('Transfer response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Transfer request failed:', error);
      throw error;
    }
  }

  async makeBillPayment(request: BillPaymentRequest): Promise<BillPaymentResponse> {
    const token = getToken();
    
    // Verify user role from token
    const decoded = jwtDecode<DecodedToken>(token);
    console.log('User role:', decoded.role);

    // Validate account type
    const senderAccount = await this.getAccountById(request.fromAccountId);
    if (!senderAccount) {
      throw new Error('Account not found');
    }

    if (senderAccount.accountType !== 'SAVINGS' && senderAccount.accountType !== 'CHECKING') {
      throw new Error('Invalid account type. Only SAVINGS or CHECKING accounts are allowed.');
    }

    // Validate bill category
    if (!Object.values(BillCategory).includes(request.category)) {
      throw new Error('Invalid bill category. Must be WIFI, POWER, or RENT.');
    }

    try {
      const response = await fetch(`${this.billBaseUrl}/bills/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          fromAccountId: request.fromAccountId,
          category: request.category,
          amount: request.amount
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Bill payment failed');
      }

      const responseData = await response.json();
      console.log('Bill payment response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Bill payment request failed:', error);
      throw error;
    }
  }

  async getUserAccounts(): Promise<Account[]> {
    const response = await fetch(`${this.accountBaseUrl}/account/my`, {
      headers: getHeaders()
    });

    await handleApiError(response);
    return response.json();
  }

  private async getAccountById(accountId: number): Promise<Account | null> {
    try {
      const accounts = await this.getUserAccounts();
      return accounts.find(acc => acc.id === accountId) || null;
    } catch (error) {
      console.error('Error fetching account:', error);
      return null;
    }
  }

  async makePayment(request: PaymentRequest): Promise<void> {
    const response = await fetch(`${this.billBaseUrl}/bills/pay`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request)
    });

    await handleApiError(response);
  }

  async getUserPayments(): Promise<any[]> {
    const response = await fetch(`${this.billBaseUrl}/payments/my`, {
      headers: getHeaders()
    });

    await handleApiError(response);
    return response.json();
  }
}

export const paymentService = new PaymentService(); 