import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export type CreditCardType = 'PLATINUM' | 'GOLD' | 'TRAVEL';

const CREDIT_CARD_DEFAULTS = {
  PLATINUM: {
    limit: 50000,
    apr: 15.99
  },
  GOLD: {
    limit: 25000,
    apr: 18.99
  },
  TRAVEL: {
    limit: 30000,
    apr: 17.99
  }
} as const;

export interface CreditCard {
  id: number;
  type: CreditCardType;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  status: 'ACTIVE' | 'PENDING' | 'BLOCKED';
  creditLimit: number;
  availableCredit: number;
  userId: number;
  username: string;
  issueDate: string;
  interestRate: number;
  requestedLimit: number;
  approvedLimit?: number;
  applicationDate: string;
  lastPaymentDate?: string;
  minimumPayment: number;
  currentBalance: number;
  paymentDueDate?: string;
}

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

const API_BASE = 'http://localhost:8080/creditcard';

// Helper function to get and validate token
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

export const creditCardService = {
  async applyForCreditCard(type: CreditCardType): Promise<CreditCard> {
    try {
      console.log('Applying for credit card with type:', type);
      const defaults = CREDIT_CARD_DEFAULTS[type];
      const url = `${API_BASE}/apply?type=${type}&requestedLimit=${defaults.limit}&interestRate=${defaults.apr}`;
      console.log('Making POST request to:', url);
      
      const response = await axios.post(
        url,
        null,
        {
          headers: getHeaders(),
          method: 'POST'
        }
      );
      console.log('Credit card application response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Credit card application error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config,
        method: error.config?.method
      });
      
      if (error.response?.status === 401) {
        throw new Error('Please login to continue');
      }
      throw new Error(error.response?.data?.message || 'Failed to apply for credit card');
    }
  },

  async getMyCreditCards(): Promise<CreditCard[]> {
    try {
      const response = await axios.get(`${API_BASE}/my`, {
        headers: getHeaders()
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please login to continue');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch credit cards');
    }
  }
}; 