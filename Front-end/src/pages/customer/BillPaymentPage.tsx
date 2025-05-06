import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Account, accountService } from '../../services/accountService';
import { BillType, billPaymentService } from '../../services/billPaymentService';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface FormData {
  billType: BillType;
  amount: string;
  fromAccountId: string;
}

interface FormErrors {
  billType?: string;
  amount?: string;
  fromAccountId?: string;
}

export default function BillPaymentPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    billType: 'WiFi',
    amount: '',
    fromAccountId: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setAccountsLoading(true);
      const data = await accountService.getUserAccounts();
      setAccounts(data);
      // Set default account if available
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, fromAccountId: data[0].id.toString() }));
      }
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to fetch accounts');
    } finally {
      setAccountsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.billType) {
      newErrors.billType = 'Please select a bill type';
    }

    if (!formData.amount) {
      newErrors.amount = 'Please enter an amount';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.fromAccountId) {
      newErrors.fromAccountId = 'Please select an account';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await billPaymentService.payBill(
        Number(formData.fromAccountId),
        formData.billType,
        Number(formData.amount)
      );

      if (response === 'Bill payment successful') {
      toast.success('Bill payment successful!');
      setFormData({
          billType: 'WiFi',
        amount: '',
        fromAccountId: accounts[0]?.id.toString() || ''
      });
      fetchAccounts(); // Refresh account balances
      } else {
        toast.error('Insufficient funds');
      }
    } catch (error: any) {
      console.error('Error paying bill:', error);
      if (error.message.includes('login')) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to pay bill');
      }
    } finally {
      setLoading(false);
    }
  };

  if (accountsLoading) {
    return (
      <DashboardLayout title="Pay Bill">
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
      </DashboardLayout>
    );
  }

  if (accounts.length === 0) {
    return (
      <DashboardLayout title="Pay Bill">
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No Accounts Found</p>
              <p className="text-gray-500 mb-4">You need to have an account to make bill payments.</p>
              <Button onClick={() => navigate('/create-account')}>
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pay Bill">
      <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Pay Bill</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="billType">Bill Type</Label>
              <Select
                  value={formData.billType}
                  onValueChange={(value: BillType) => setFormData({ ...formData, billType: value })}
              >
                <SelectTrigger>
                    <SelectValue placeholder="Select bill type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="WiFi">Internet/WiFi</SelectItem>
                    <SelectItem value="Power">Electricity</SelectItem>
                    <SelectItem value="Rent">Rent</SelectItem>
                </SelectContent>
              </Select>
                {errors.billType && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                    {errors.billType}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              {errors.amount && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.amount}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromAccountId">From Account</Label>
              <Select
                value={formData.fromAccountId}
                onValueChange={(value) => setFormData({ ...formData, fromAccountId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.accountType} - {account.accountNumber} (Balance: ${account.balance.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fromAccountId && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.fromAccountId}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay Bill'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
            </div>
    </DashboardLayout>
  );
} 