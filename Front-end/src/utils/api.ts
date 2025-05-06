import { toast } from 'sonner';

// Base API configuration
const API_BASE_URL = 'http://localhost:8081/api';  // Spring Boot backend URL

// Get JWT token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Handle API errors
const handleError = (error: any) => {
  console.error('API Error:', error);
  
  if (error.status === 401) {
    // Unauthorized: Token might be expired
    toast.error('Your session has expired. Please log in again.');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = '/login';
    return;
  }
  
  // Generic error message
  toast.error(error.message || 'An error occurred. Please try again later.');
};

// API request wrapper with JWT
export const apiRequest = async <T>(
  endpoint: string,
  method: string = 'GET',
  data?: any
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add JWT token to headers if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // Include cookies if needed
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || response.statusText,
      };
    }

    // For responses with no content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    handleError(error);
    throw error;
  }
};
