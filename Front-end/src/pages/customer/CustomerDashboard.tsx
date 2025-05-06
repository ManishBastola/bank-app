import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { StatCard } from '../../components/ui/StatCard';
import { 
  CreditCard, 
  BarChart, 
  ArrowUp, 
  ArrowDown, 
  Send, 
  Clock, 
  FileText,
  Plus,
  PiggyBank,
  Receipt,
  Building2,
  ArrowRightLeft,
  Wallet
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Account, accountService } from '../../services/accountService';
import { toast } from 'sonner';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getUserAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Fetch accounts error:', error);
      toast.error('Failed to fetch accounts');
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

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const quickActions = [
    {
      title: 'Deposit Money',
      icon: <ArrowDown className="h-5 w-5 text-green-500" />,
      description: 'Add funds to your account',
      onClick: () => navigate('/customer-transactions'),
      color: 'bg-green-500/10 hover:bg-green-500/20'
    },
    {
      title: 'Withdraw Money',
      icon: <ArrowUp className="h-5 w-5 text-red-500" />,
      description: 'Withdraw funds from your account',
      onClick: () => navigate('/customer-transactions'),
      color: 'bg-red-500/10 hover:bg-red-500/20'
    },
    {
      title: 'Transfer Money',
      icon: <ArrowRightLeft className="h-5 w-5 text-blue-500" />,
      description: 'Send money to another account',
      onClick: () => navigate('/customer-transactions'),
      color: 'bg-blue-500/10 hover:bg-blue-500/20'
    },
    {
      title: 'Pay Bills',
      icon: <Receipt className="h-5 w-5 text-purple-500" />,
      description: 'Pay your utility bills',
      onClick: () => navigate('/pay-bills'),
      color: 'bg-purple-500/10 hover:bg-purple-500/20'
    },
    {
      title: 'Apply for Loan',
      icon: <Building2 className="h-5 w-5 text-orange-500" />,
      description: 'Get a loan for your needs',
      onClick: () => navigate('/loans'),
      color: 'bg-orange-500/10 hover:bg-orange-500/20'
    },
    {
      title: 'Credit Cards',
      icon: <Wallet className="h-5 w-5 text-cyan-500" />,
      description: 'Manage your credit cards',
      onClick: () => navigate('/credit-cards'),
      color: 'bg-cyan-500/10 hover:bg-cyan-500/20'
    }
  ];

  return (
    <DashboardLayout title="Customer Dashboard">
      <div className="grid gap-6">
        {/* Stats overview section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Balance"
            value={formatCurrency(totalBalance)}
            icon={<CreditCard className="h-5 w-5" />}
          />
          <StatCard
            title="Number of Accounts"
            value={accounts.length.toString()}
            icon={<BarChart className="h-5 w-5" />}
          />
          <StatCard
            title="Quick Actions"
            value="View All"
            icon={<Send className="h-5 w-5" />}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`h-auto p-4 flex flex-col items-start gap-2 ${action.color} transition-colors`}
                  onClick={action.onClick}
                >
                  <div className="flex items-center gap-2">
                    {action.icon}
                    <span className="font-medium">{action.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    {action.description}
                  </p>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accounts section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Your Accounts
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/create-account')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Account
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No accounts found</p>
                <Button onClick={() => navigate('/create-account')}>
                  Create Your First Account
                </Button>
              </div>
            ) : (
            <div className="grid gap-4">
              {accounts.map((account) => (
                  <div 
                    key={account.id} 
                    className="bg-muted/40 p-4 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
                    onClick={() => navigate(`/accounts/${account.id}`)}
                  >
                    <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium">{account.accountType} Account</h3>
                        <p className="text-sm text-muted-foreground">{account.accountNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(account.balance)}</p>
                      <p className="text-xs text-muted-foreground">Available Balance</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
