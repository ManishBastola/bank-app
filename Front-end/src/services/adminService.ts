import { getToken } from './authService';

export interface Employee {
  username: string;
}

class AdminService {
  private baseUrl = 'http://localhost:8080';

  async getAllEmployees(): Promise<string[]> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/auth/all-employees`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }

    return response.json();
  }

  async deleteEmployee(username: string): Promise<void> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/auth/delete-employee/${username}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete employee');
    }
  }

  async addEmployee(username: string, password: string): Promise<void> {
    const token = getToken();
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username,
        password,
        role: 'EMPLOYEE'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add employee');
    }
  }
}

export const adminService = new AdminService(); 