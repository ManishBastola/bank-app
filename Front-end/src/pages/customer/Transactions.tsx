import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Loader2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Receipt, 
  ArrowRightLeft, 
  ArrowLeft,
  PiggyBank,
  CreditCard
} from 'lucide-react';
import { Account, accountService } from '../../services/accountService';
import { transactionService, Transaction } from '../../services/transactionService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface FormData {
  accountId: string;
  amount: string;
}

interface TransferFormData extends FormData {
  recipientName: string;
  recipientAccountNumber: string;
}

export default function Transactions() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transactions, setTransactions] = useState<{ [key: string]: Transaction[] }>({});
  const [depositForm, setDepositForm] = useState<FormData>({
    accountId: '',
    amount: ''
  });
  const [withdrawForm, setWithdrawForm] = useState<FormData>({
    accountId: '',
    amount: ''
  });
  const [transferForm, setTransferForm] = useState<TransferFormData>({
    accountId: '',
    amount: '',
    recipientName: '',
    recipientAccountNumber: ''
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getUserAccounts();
      setAccounts(data);
      if (data.length > 0) {
        setDepositForm(prev => ({ ...prev, accountId: data[0].id.toString() }));
        setWithdrawForm(prev => ({ ...prev, accountId: data[0].id.toString() }));
        setTransferForm(prev => ({ ...prev, accountId: data[0].id.toString() }));
        // Fetch transactions for each account
        await Promise.all(data.map(account => fetchTransactions(account.accountNumber)));
      }
    } catch (error) {
      console.error('Fetch accounts error:', error);
      toast.error('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (accountNumber: string) => {
    try {
      const data = await transactionService.getTransactionsByAccountNumber(accountNumber);
      setTransactions(prev => ({ ...prev, [accountNumber]: data }));
    } catch (error: any) {
      console.error('Fetch transactions error:', error);
      if (error.message.includes('login')) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error('Failed to fetch transactions');
      }
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!depositForm.accountId || !depositForm.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(depositForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setDepositLoading(true);
      const response = await transactionService.depositMoney(
        parseInt(depositForm.accountId),
        amount
      );

      if (response === 'Deposit successful') {
        toast.success('Deposit successful!');
        setDepositForm(prev => ({ ...prev, amount: '' }));
        // Refresh accounts and transactions
        await fetchAccounts();
      } else {
        toast.error(response);
      }
    } catch (error: any) {
      console.error('Deposit error:', error);
      if (error.message.includes('login')) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to process deposit');
      }
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawForm.accountId || !withdrawForm.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(withdrawForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setWithdrawLoading(true);
      const response = await transactionService.withdrawMoney(
        parseInt(withdrawForm.accountId),
        amount
      );

      if (response === 'Withdraw successful') {
        toast.success('Withdrawal successful!');
        setWithdrawForm(prev => ({ ...prev, amount: '' }));
        // Refresh accounts and transactions
        await fetchAccounts();
      } else {
        toast.error(response);
      }
    } catch (error: any) {
      console.error('Withdraw error:', error);
      if (error.message.includes('login')) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to process withdrawal');
      }
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transferForm.accountId || !transferForm.amount || !transferForm.recipientName || !transferForm.recipientAccountNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(transferForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setTransferLoading(true);
      const response = await transactionService.transferMoney(
        parseInt(transferForm.accountId),
        transferForm.recipientName,
        transferForm.recipientAccountNumber,
        amount
      );

      if (response === 'Transfer successful') {
        toast.success('Transfer successful!');
        setTransferForm(prev => ({
          ...prev,
          amount: '',
          recipientName: '',
          recipientAccountNumber: ''
        }));
        // Refresh accounts and transactions
        await fetchAccounts();
      } else {
        toast.error(response);
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      if (error.message.includes('login')) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to process transfer');
      }
    } finally {
      setTransferLoading(false);
    }
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'WITHDRAW':
      case 'BILL_PAYMENT':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      default:
        return <Receipt className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Transactions">
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
      <DashboardLayout title="Transactions">
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No Accounts Found</p>
                <p className="text-gray-500 mb-4">You need to have an account to make transactions.</p>
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
    <DashboardLayout title="Transactions">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-primary/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-primary">Transactions</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Account Information */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Your Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div 
                      key={account.id} 
                      className="space-y-3 p-4 bg-white/50 rounded-lg border border-primary/10 hover:border-primary/20 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-primary">{account.accountType}</span>
                          <p className="text-xs text-muted-foreground font-mono tracking-wide">
                            {account.accountNumber}
                          </p>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-full">
                          {account.accountType === 'SAVINGS' ? (
                            <PiggyBank className="h-4 w-4 text-primary" />
                          ) : (
                            <CreditCard className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                      <div className="pt-3 border-t border-primary/10">
                        <p className="text-xs text-muted-foreground">Available Balance</p>
                        <p className="text-xl font-bold text-primary">
                          {formatCurrency(account.balance)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ArrowDownLeft className="h-3 w-3 text-green-500" />
                          <span>Deposits</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3 text-red-500" />
                          <span>Withdrawals</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Transaction Forms and History */}
          <div className="lg:col-span-3 space-y-8">
            {/* Transaction Forms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Deposit Form */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowDownLeft className="h-5 w-5 text-green-500" />
                    Deposit Money
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="depositAccount">Select Account</Label>
                      <Select
                        value={depositForm.accountId}
                        onValueChange={(value) => setDepositForm(prev => ({ ...prev, accountId: value }))}
                      >
                        <SelectTrigger className="w-full">
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="depositAmount">Amount ($)</Label>
                      <Input
                        id="depositAmount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter amount"
                        value={depositForm.amount}
                        onChange={(e) => setDepositForm(prev => ({ ...prev, amount: e.target.value }))}
                        required
                        className="w-full"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={depositLoading}>
                      {depositLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Deposit'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Withdraw Form */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5 text-red-500" />
                    Withdraw Money
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdrawAccount">Select Account</Label>
                      <Select
                        value={withdrawForm.accountId}
                        onValueChange={(value) => setWithdrawForm(prev => ({ ...prev, accountId: value }))}
                      >
                        <SelectTrigger className="w-full">
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="withdrawAmount">Amount ($)</Label>
                      <Input
                        id="withdrawAmount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter amount"
                        value={withdrawForm.amount}
                        onChange={(e) => setWithdrawForm(prev => ({ ...prev, amount: e.target.value }))}
                        required
                        className="w-full"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={withdrawLoading}>
                      {withdrawLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Withdraw'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Transfer Form */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-blue-500" />
                    Transfer Money
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTransfer} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="transferAccount">From Account</Label>
                      <Select
                        value={transferForm.accountId}
                        onValueChange={(value) => setTransferForm(prev => ({ ...prev, accountId: value }))}
                      >
                        <SelectTrigger className="w-full">
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipientName">Recipient Name</Label>
                      <Input
                        id="recipientName"
                        type="text"
                        placeholder="Enter recipient's full name"
                        value={transferForm.recipientName}
                        onChange={(e) => setTransferForm(prev => ({ ...prev, recipientName: e.target.value }))}
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipientAccountNumber">Recipient Account Number</Label>
                      <Input
                        id="recipientAccountNumber"
                        type="text"
                        placeholder="Enter recipient's account number"
                        value={transferForm.recipientAccountNumber}
                        onChange={(e) => setTransferForm(prev => ({ ...prev, recipientAccountNumber: e.target.value }))}
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transferAmount">Amount ($)</Label>
                      <Input
                        id="transferAmount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter amount"
                        value={transferForm.amount}
                        onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                        required
                        className="w-full"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={transferLoading}>
                      {transferLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Transfer'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Transaction History */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-primary">Transaction History</h2>
              {accounts.map((account) => (
                <Card key={account.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {account.accountType} - {account.accountNumber}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions[account.accountNumber]?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No transactions found</p>
                      ) : (
                        transactions[account.accountNumber]?.map((transaction, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-muted/40 rounded-lg hover:bg-muted/60 transition-colors"
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
                                transaction.type === 'DEPOSIT' ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {transaction.type === 'DEPOSIT' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {transaction.type}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 