export type BillType = 'WiFi' | 'Power' | 'Rent';

const API_BASE = 'http://localhost:8080/account';

const getToken = () => localStorage.getItem('token');

export const billPaymentService = {
  payBill: async (accountId: number, billType: BillType, amount: number): Promise<string> => {
    const res = await fetch(`${API_BASE}/paybill/${accountId}?billType=${billType}&amount=${amount}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error('Please login again');
      if (res.status === 400) throw new Error('Insufficient funds');
      throw new Error('Failed to pay bill');
    }

    return res.text(); // Returns "Bill payment successful" or "Insufficient funds"
  }
}; 