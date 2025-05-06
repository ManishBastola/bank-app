import axios from 'axios';

export type LoanType = 'HOME' | 'CAR' | 'PERSONAL';
export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Loan {
  id: number;
  amount: number;
  durationMonths: number;
  interestRate: number;
  status: LoanStatus;
  type: LoanType;
  username: string;
  appliedDate: string;
}

const API_BASE = 'http://localhost:8080/loan';

export const loanService = {
  async applyForLoan(amount: number, type: LoanType, durationMonths: number): Promise<string> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.post(
        `${API_BASE}/apply`,
        null,
        {
          params: {
            amount,
            type,
            durationMonths
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please login to continue');
      }
      throw new Error(error.response?.data?.message || 'Failed to apply for loan');
    }
  },

  async getMyLoans(): Promise<Loan[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.get(`${API_BASE}/my`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please login to continue');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch loans');
    }
  },

  async approveLoan(loanId: number): Promise<string> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.put(
        `${API_BASE}/${loanId}/approve`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please login to continue');
      }
      if (error.response?.status === 403) {
        throw new Error('Only employees can approve loans');
      }
      throw new Error(error.response?.data?.message || 'Failed to approve loan');
    }
  },

  async rejectLoan(loanId: number): Promise<string> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.put(
        `${API_BASE}/${loanId}/reject`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please login to continue');
      }
      if (error.response?.status === 403) {
        throw new Error('Only employees can reject loans');
      }
      throw new Error(error.response?.data?.message || 'Failed to reject loan');
    }
  }
}; 