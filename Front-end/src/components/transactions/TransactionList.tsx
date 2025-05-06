import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction, transactionService } from '@/services/transactionService';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';

interface TransactionListProps {
  accountId?: number;
}

export function TransactionList({ accountId }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, [accountId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = accountId 
        ? await transactionService.getAccountTransactions(accountId)
        : await transactionService.getUserTransactions();
      
      setTransactions(data);
    } catch (error) {
      console.error('Fetch transactions error:', error);
      if (error instanceof Error) {
        if (error.message.includes('token') || error.message.includes('login')) {
          setError('Please login to view transactions');
          toast.error('Please login to view transactions');
        } else {
          setError(error.message);
          toast.error(error.message);
        }
      } else {
        setError('Failed to fetch transactions');
        toast.error('Failed to fetch transactions');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'TRANSFER':
        return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
        return 'text-green-500';
      case 'WITHDRAWAL':
        return 'text-red-500';
      case 'TRANSFER':
        return 'text-blue-500';
      default:
        return '';
    }
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

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              {getTransactionIcon(transaction.type)}
              <CardTitle className={`text-lg ${getTransactionColor(transaction.type)}`}>
                {transaction.type}
              </CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDate(transaction.timestamp)}
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className={`font-medium ${getTransactionColor(transaction.type)}`}>
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              {transaction.description && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium">{transaction.description}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${
                  transaction.status === 'COMPLETED' ? 'text-green-500' :
                  transaction.status === 'FAILED' ? 'text-red-500' :
                  'text-yellow-500'
                }`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 