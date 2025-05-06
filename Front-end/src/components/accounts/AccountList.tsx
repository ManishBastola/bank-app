import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Account } from '@/services/accountService';
import { accountService } from '@/services/accountService';

export function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await accountService.getUserAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Fetch accounts error:', error);
      if (error instanceof Error) {
        if (error.message.includes('token') || error.message.includes('login')) {
          setError('Your session has expired. Please login again.');
          toast.error('Your session has expired. Please login again.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setError(error.message);
          toast.error(error.message);
        }
      } else {
        setError('Failed to fetch accounts');
        toast.error('Failed to fetch accounts');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No accounts found</p>
            <Button 
              variant="default" 
              onClick={() => navigate('/create-account')}
            >
              Create New Account
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {accounts.map((account) => (
        <Card key={account.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {account.accountType} Account
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => navigate(`/accounts/${account.id}`)}
            >
              View Details
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number</span>
                <span className="font-medium">{account.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-medium">{formatCurrency(account.balance)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 