import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;  // userId
  role: string;
  exp: number;
}

export const getToken = () => {
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
    if (!decoded.sub) {
      console.error('Token missing userId claim');
      throw new Error('Invalid token format: missing userId');
    }

    return token;
  } catch (error) {
    console.error('Token validation error:', error);
    localStorage.removeItem('token');
    throw new Error('Invalid authentication token');
  }
}; 