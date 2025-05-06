import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';

type Role = 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';

interface User {
  id: number;
  username: string;
  role: Role;
  token: string;
}

interface DecodedToken {
  sub: string;
  role: Role;
  exp: number;
}

// Function to validate JWT token
function validateToken(token: string): boolean {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize user state from localStorage
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role') as Role | null;

    if (token && username && role && validateToken(token)) {
      const decoded = jwtDecode<DecodedToken>(token);
      return { id: parseInt(decoded.sub), username, role, token };
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role') as Role | null;

    if (token && username && role) {
      // Validate token
      if (validateToken(token)) {
        const decoded = jwtDecode<DecodedToken>(token);
        setUser({ id: parseInt(decoded.sub), username, role, token });
      } else {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        toast.error('Your session has expired. Please login again.');
        navigate('/login');
      }
    }
    setLoading(false);
  }, [navigate]);

  const register = async (username: string, password: string, role: Role) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const message = await response.text();
      toast.success(message || 'Registration successful. Please login.');
      navigate('/login');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      // Get the JWT token as plain text
      const token = await response.text();
      
      // Parse the JWT token
      const decoded = jwtDecode<DecodedToken>(token);

      // Save auth info
      localStorage.setItem('token', token);
      localStorage.setItem('role', decoded.role);
      localStorage.setItem('username', decoded.sub);
      
      setUser({ 
        id: parseInt(decoded.sub), 
        username: decoded.sub, 
        role: decoded.role, 
        token: token 
      });

      toast.success(`Welcome back, ${decoded.sub}!`);

      // Redirect based on role
      switch (decoded.role) {
        case 'CUSTOMER':
        navigate('/customer-dashboard');
          break;
        case 'EMPLOYEE':
        navigate('/employee-dashboard');
          break;
        case 'ADMIN':
        navigate('/admin-dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
    toast.info('You have been logged out');
    navigate('/login');
  };

  const isAuthenticated = () => {
    if (!user) return false;
    
    // Check if token is still valid
    if (!validateToken(user.token)) {
      logout();
      return false;
    }
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
