import { api } from './api';

export interface LoanApplication {
  id: number;
  customerId: number;
  username: string;
  amount: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface CreditCardApplication {
  id: number;
  customerId: number;
  username: string;
  type: 'PLATINUM' | 'GOLD' | 'TRAVEL';
  requestedLimit: number;
  interestRate: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedLimit?: number;
  createdAt: string;
}

class ApplicationService {
  async getPendingLoanApplications(): Promise<LoanApplication[]> {
    const response = await api.get('/loan/pending');
    return response.data;
  }

  async getPendingCreditCardApplications(): Promise<CreditCardApplication[]> {
    try {
      console.log('Fetching credit card applications...');
      const response = await api.get('/creditcard/pending');
      console.log('Credit card applications response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching credit card applications:', error);
      throw error;
    }
  }

  async updateLoanStatus(loanId: number, status: 'APPROVED' | 'REJECTED'): Promise<void> {
    if (status === 'APPROVED') {
      await api.put(`/loan/${loanId}/approve`);
    } else {
      await api.put(`/loan/${loanId}/reject`);
    }
  }

  async updateCreditCardStatus(
    applicationId: number, 
    status: 'APPROVED' | 'REJECTED',
    approvedLimit?: number
  ): Promise<void> {
    const payload = status === 'APPROVED' 
      ? { status, approvedLimit }
      : { status };
      
    await api.put(`/creditcard/update-status/${applicationId}`, payload);
  }
}

export const applicationService = new ApplicationService(); 