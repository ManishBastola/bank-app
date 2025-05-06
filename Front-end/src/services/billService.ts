import { jwtDecode } from 'jwt-decode';

export type BillType = 'UTILITY' | 'RENT' | 'INSURANCE' | 'SUBSCRIPTION';

export interface Bill {
  id: number;
  userId: number;
  billType: BillType;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  description?: string;
  recipientName: string;
  recipientAccountNo: string;
}

export interface CreateBillRequest {
  billType: BillType;
  amount: number;
  dueDate: string;
  description?: string;
  recipientName: string;
  recipientAccountNo: string;
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

class BillService {
  private baseUrl = 'http://localhost:8080';

  async createBill(request: CreateBillRequest): Promise<Bill> {
    try {
      const response = await fetch(`${this.baseUrl}/bill`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Bill service is currently unavailable. Please try again later.');
        }
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to create bill payment');
      }

      return response.json();
    } catch (error: any) {
      if (error.message.includes('token')) {
        throw new Error('Authentication required. Please login again.');
      }
      throw error;
    }
  }

  async getUserBills(): Promise<Bill[]> {
    try {
      const response = await fetch(`${this.baseUrl}/bill`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Bill service is currently unavailable. Please try again later.');
        }
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch bills');
      }

      return response.json();
    } catch (error: any) {
      if (error.message.includes('token')) {
        throw new Error('Authentication required. Please login again.');
      }
      throw error;
    }
  }
}

export const billService = new BillService(); 