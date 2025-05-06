import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Account } from '../../services/accountService';
import { paymentService, TransferRequest, TransferResponse } from '../../services/paymentService';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function Transfer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState<TransferRequest>({
    senderAccountId: 0,
    recipientName: '',
    recipientAccountNumber: '',
    amount: 0
  });
  const [transferConfirmation, setTransferConfirmation] = useState<TransferResponse | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await paymentService.getUserAccounts();
      if (data.length === 0) {
        toast.error('No accounts found. Please create an account first.');
        navigate('/create-account');
        return;
      }
      setAccounts(data);
    } catch (error) {
      console.error('Fetch accounts error:', error);
      toast.error('Failed to fetch accounts. Please try again.');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.senderAccountId) {
      toast.error('Please select a source account');
      return false;
    }

    const selectedAccount = accounts.find(acc => acc.id === formData.senderAccountId);
    if (!selectedAccount) {
      toast.error('Selected account not found');
      return false;
    }

    if (formData.amount > selectedAccount.balance) {
      toast.error('Insufficient balance in the selected account');
      return false;
    }

    if (!formData.recipientAccountNumber.trim()) {
      toast.error('Please enter recipient account number');
      return false;
    }

    if (formData.recipientAccountNumber === selectedAccount.accountNumber) {
      toast.error('Cannot transfer to the same account');
      return false;
    }

    if (!formData.recipientName.trim()) {
      toast.error('Please enter recipient name');
      return false;
    }

    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }

    if (formData.amount < 1) {
      toast.error('Minimum transfer amount is $1.00');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const transferRequest: TransferRequest = {
        senderAccountId: formData.senderAccountId,
        recipientAccountNumber: formData.recipientAccountNumber.trim(),
        recipientName: formData.recipientName.trim(),
        amount: Number(formData.amount)
      };

      const response = await paymentService.makeTransfer(transferRequest);
      setTransferConfirmation(response);
      toast.success('Transfer successful!');
      
      // Refresh accounts to update balances
      await fetchAccounts();
    } catch (error) {
      console.error('Transfer error:', error);
      if (error instanceof Error) {
        if (error.message.includes('session has expired') || error.message.includes('Authentication required')) {
          navigate('/login');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Transfer failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewTransfer = () => {
    setTransferConfirmation(null);
    setFormData({
      senderAccountId: 0,
      recipientName: '',
      recipientAccountNumber: '',
      amount: 0
    });
  };

  if (transferConfirmation) {
    return (
      <DashboardLayout title="Transfer Confirmation">
        <div className="container mx-auto py-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Transfer Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>From Account</Label>
                    <p className="text-sm text-muted-foreground">
                      {accounts.find(a => a.id === transferConfirmation.senderAccountId)?.accountNumber}
                    </p>
                  </div>
                  <div>
                    <Label>To Account</Label>
                    <p className="text-sm text-muted-foreground">
                      {transferConfirmation.recipientAccountNumber}
                    </p>
                  </div>
                  <div>
                    <Label>Recipient</Label>
                    <p className="text-sm text-muted-foreground">
                      {transferConfirmation.recipientName}
                    </p>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <p className="text-sm text-muted-foreground">
                      ${transferConfirmation.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transferConfirmation.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/customer-dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleNewTransfer}
                  >
                    New Transfer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Transfer Money">
      <div className="container mx-auto py-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Transfer Money</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fromAccount">From Account</Label>
                  <Select
                    value={formData.senderAccountId ? formData.senderAccountId.toString() : ''}
                    onValueChange={(value) => setFormData({ ...formData, senderAccountId: parseInt(value) })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountType} - {account.accountNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="toAccount">To Account Number</Label>
                  <Input
                    id="toAccount"
                    type="text"
                    placeholder="Enter recipient's account number"
                    value={formData.recipientAccountNumber}
                    onChange={(e) => setFormData({ ...formData, recipientAccountNumber: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    type="text"
                    placeholder="Enter recipient's name"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Enter amount"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/customer-dashboard')}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Processing...' : 'Transfer Money'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 