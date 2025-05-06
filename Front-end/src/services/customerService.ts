import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = 'http://localhost:8080';

export interface Customer {
  username: string;
}

// Helper function to get token
const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage');
    throw new Error('Authentication required. Please login again.');
  }
  try {
    // Verify token is valid by attempting to decode it
    jwtDecode(token);
    return token;
  } catch (error) {
    console.error('Invalid token format:', error);
    localStorage.removeItem('token');
    throw new Error('Invalid authentication token');
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  try {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401/403 errors for non-delete operations
    if (error.config.method !== 'delete' && (error.response?.status === 401 || error.response?.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data?.message || 'An error occurred');
  }
);

export const customerService = {
  // Get all customers
  getAllCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await api.get('/auth/all-customers');
      return response.data.map((username: string) => ({ username }));
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get customer by ID
  getCustomerById: async (customerId: number): Promise<Customer> => {
    const response = await api.get(`/${customerId}`);
    return response.data;
  },

  // Update customer status
  updateCustomerStatus: async (customerId: number, status: Customer['status']): Promise<Customer> => {
    const response = await api.patch(`/${customerId}/status`, { status });
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (username: string): Promise<void> => {
    try {
      const response = await api.delete(`/auth/delete-customer/${username}`);
      if (response.status !== 200) {
        throw new Error('Failed to delete customer');
      }
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('You do not have permission to delete customers');
      }
      throw new Error(error.response?.data?.message || 'Failed to delete customer');
    }
  },
}; 