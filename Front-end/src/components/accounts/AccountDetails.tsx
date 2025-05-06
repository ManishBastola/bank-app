import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import DashboardLayout from '../layout/DashboardLayout';
import { Account, accountService } from '../../services/accountService';

export function AccountDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        if (!id) return;
        
        const [accountData, balanceData] = await Promise.all([
          accountService.getAccountById(Number(id)),
          accountService.getAccountBalance(Number(id))
        ]);
        
        setAccount(accountData);
        setBalance(balanceData);
      } catch (error: any) {
        console.error('Error fetching account details:', error);
        toast.error(error.message || 'Failed to fetch account details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountDetails();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Account Details">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!account) {
    return (
      <DashboardLayout title="Account Not Found">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Account Not Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                The account you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button 
                onClick={() => navigate('/accounts')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Accounts
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Account Details">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/accounts')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Accounts
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {account.accountType} Account
              </CardTitle>
              <CardDescription>
                Account Number: {account.accountNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <p className="text-lg font-medium">{account.accountType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="text-lg font-medium">{account.accountNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold">
                    {balance !== null ? formatCurrency(balance) : 'Loading...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add more cards for transactions, statements, etc. */}
        </div>
      </div>
    </DashboardLayout>
  );
} 