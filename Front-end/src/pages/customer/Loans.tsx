import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Building2, Car, Wallet, AlertCircle, Loader2, Clock, CheckCircle2, XCircle, LucideIcon } from 'lucide-react';
import { loanService, Loan, LoanType } from '../../services/loanService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

interface LoanTypeConfig {
  type: LoanType;
  name: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

const LOAN_TYPES: LoanTypeConfig[] = [
  {
    type: 'HOME',
    name: 'Home Loan',
    description: 'Finance your dream home',
    icon: Building2,
    features: ['Competitive rates', 'Long terms', 'Flexible payments']
  },
  {
    type: 'CAR',
    name: 'Car Loan',
    description: 'Get your new vehicle',
    icon: Car,
    features: ['Quick approval', 'Low interest', 'Easy process']
  },
  {
    type: 'PERSONAL',
    name: 'Personal Loan',
    description: 'For your personal needs',
    icon: Wallet,
    features: ['Flexible terms', 'Quick disbursal', 'No collateral']
  }
];

export default function Loans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedType, setSelectedType] = useState<LoanType>('PERSONAL');
  const [amount, setAmount] = useState('');
  const [durationMonths, setDurationMonths] = useState('12');
  const [processingLoanId, setProcessingLoanId] = useState<number | null>(null);

  const isEmployee = user?.role === 'EMPLOYEE';

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await loanService.getMyLoans();
      setLoans(data);
    } catch (error: any) {
      console.error('Fetch loans error:', error);
      if (error.message.includes('login')) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to fetch loans');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!durationMonths || parseInt(durationMonths) <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    try {
      setApplying(true);
      await loanService.applyForLoan(
        parseFloat(amount),
        selectedType,
        parseInt(durationMonths)
      );
      toast.success('Loan application submitted successfully!');
      setAmount('');
      setDurationMonths('12');
      fetchLoans(); // Refresh the loans list
    } catch (error: any) {
      console.error('Apply loan error:', error);
      if (error.message.includes('login')) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to apply for loan');
      }
    } finally {
      setApplying(false);
    }
  };

  const handleApproveLoan = async (loanId: number) => {
    try {
      setProcessingLoanId(loanId);
      await loanService.approveLoan(loanId);
      toast.success('Loan approved successfully');
      fetchLoans();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve loan');
    } finally {
      setProcessingLoanId(null);
    }
  };

  const handleRejectLoan = async (loanId: number) => {
    try {
      setProcessingLoanId(loanId);
      await loanService.rejectLoan(loanId);
      toast.success('Loan rejected successfully');
      fetchLoans();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject loan');
    } finally {
      setProcessingLoanId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      // Handle potential ISO string or timestamp
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const formatInterestRate = (rate: number) => {
    return `${rate}%`;
  };

  const formatDuration = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) {
      return `${months} months`;
    }
    return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
  };

  return (
    <DashboardLayout title="Loans">
      <div className="grid gap-6">
        {/* Loan Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Apply for a Loan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApply} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="loanType">Loan Type</Label>
                  <Select
                    value={selectedType}
                    onValueChange={(value: LoanType) => setSelectedType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOAN_TYPES.map((type) => (
                        <SelectItem key={type.type} value={type.type}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Loan Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1000"
                    step="1000"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="12"
                    max="60"
                    step="12"
                    placeholder="Enter duration"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-muted/40 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Loan Features</h3>
                <ul className="space-y-2">
                  {LOAN_TYPES.find(t => t.type === selectedType)?.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={applying}>
                {applying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Apply for Loan'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* My Loans */}
        <Card>
          <CardHeader>
            <CardTitle>My Loans</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : loans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No loans found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => {
                  const loanType = LOAN_TYPES.find(t => t.type === loan.type);
                  return (
                    <div
                      key={loan.id}
                      className="bg-muted/40 p-4 rounded-lg hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {loanType?.icon && <loanType.icon className="h-5 w-5 text-primary" />}
                              <h3 className="font-medium">{loanType?.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Applied by {loan.username} on {formatDate(loan.appliedDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(loan.amount)}</p>
                            <div className="flex items-center gap-2 justify-end">
                              {getStatusIcon(loan.status)}
                              <span className="text-sm font-medium capitalize">{loan.status.toLowerCase()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">Duration</p>
                            <p className="font-medium">{formatDuration(loan.durationMonths)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Interest Rate</p>
                            <p className="font-medium">{formatInterestRate(loan.interestRate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Monthly Payment</p>
                            <p className="font-medium">
                              {formatCurrency(
                                (loan.amount * (1 + loan.interestRate / 100)) / loan.durationMonths
                              )}
                            </p>
                          </div>
                        </div>

                        {isEmployee && loan.status === 'PENDING' && (
                          <div className="flex gap-2 justify-end pt-2 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleRejectLoan(loan.id)}
                              disabled={processingLoanId === loan.id}
                            >
                              {processingLoanId === loan.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Reject'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-500 hover:text-green-600 hover:bg-green-50"
                              onClick={() => handleApproveLoan(loan.id)}
                              disabled={processingLoanId === loan.id}
                            >
                              {processingLoanId === loan.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Approve'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 