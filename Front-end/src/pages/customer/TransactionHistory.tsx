import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Account, accountService } from '../../services/accountService';
import { Transaction, TransactionType, transactionService } from '../../services/transactionService';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, Receipt, Loader2 } from 'lucide-react';

export default function TransactionHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await accountService.getUserAccounts();
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount(data[0].id.toString());
        fetchTransactions(data[0].id);
      }
    } catch (error) {
      console.error('Fetch accounts error:', error);
      toast.error('Failed to fetch accounts');
    }
  };

  const fetchTransactions = async (accountId: number) => {
    try {
      setLoading(true);
      const data = await transactionService.getTransactionsByAccount(accountId);
      setTransactions(data);
    } catch (error: any) {
      console.error('Fetch transactions error:', error);
      if (error.message.includes('login')) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error('Failed to fetch transactions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (value: string) => {
    setSelectedAccount(value);
    fetchTransactions(parseInt(value));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'TRANSFER':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'DEPOSIT':
        return <ArrowDownLeft className="h-4 w-4" />;
      case 'WITHDRAW':
        return <ArrowUpRight className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.description.toLowerCase().includes(searchLower) ||
      transaction.type.toLowerCase().includes(searchLower)
    );
  });

  if (accounts.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No Accounts Found</p>
              <p className="text-gray-500 mb-4">You need to have an account to view transactions.</p>
              <Button onClick={() => navigate('/create-account')}>
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="account">Select Account</Label>
                <Select value={selectedAccount} onValueChange={handleAccountChange}>
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
              <div className="flex-1">
                <Label htmlFor="search">Search Transactions</Label>
                <Input
                  id="search"
                  placeholder="Search by description or type"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/40 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {transaction.description}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'WITHDRAW' ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {transaction.type === 'WITHDRAW' ? '-' : '+'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 