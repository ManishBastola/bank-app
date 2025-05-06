import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Loader2, 
  CreditCard as CreditCardIcon,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Shield,
  Gift,
  Plane
} from 'lucide-react';
import { creditCardService, CreditCard, CreditCardType } from '../../services/creditCardService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface CreditCardTypeConfig {
  type: CreditCardType;
  name: string;
  description: string;
  icon: any;
  features: string[];
}

const CREDIT_CARD_TYPES: CreditCardTypeConfig[] = [
  {
    type: 'PLATINUM',
    name: 'Platinum Card',
    description: 'Premium benefits and exclusive rewards',
    icon: Shield,
    features: [
      'Higher credit limit',
      'Premium concierge service',
      'Travel insurance',
      'Airport lounge access'
    ]
  },
  {
    type: 'GOLD',
    name: 'Gold Card',
    description: 'Perfect balance of benefits and value',
    icon: Gift,
    features: [
      'Competitive rewards program',
      'Purchase protection',
      'Extended warranty',
      '24/7 customer support'
    ]
  },
  {
    type: 'TRAVEL',
    name: 'Travel Card',
    description: 'Designed for frequent travelers',
    icon: Plane,
    features: [
      'Travel rewards points',
      'No foreign transaction fees',
      'Travel accident insurance',
      'Baggage delay insurance'
    ]
  }
];

export default function CreditCards() {
  const navigate = useNavigate();
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedType, setSelectedType] = useState<CreditCardType>('GOLD');

  useEffect(() => {
    fetchCreditCards();
  }, []);

  const fetchCreditCards = async () => {
    try {
      setLoading(true);
      const data = await creditCardService.getMyCreditCards();
      setCreditCards(data);
    } catch (error: any) {
      console.error('Fetch credit cards error:', error);
      if (error.message.includes('login')) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to fetch credit cards');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      await creditCardService.applyForCreditCard(selectedType);
      toast.success('Credit card application submitted successfully!');
      fetchCreditCards(); // Refresh the credit cards list
    } catch (error: any) {
      console.error('Apply credit card error:', error);
      if (error.message.includes('login')) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to apply for credit card');
      }
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'BLOCKED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const formatCardNumber = (cardNumber: string | undefined | null) => {
    if (!cardNumber) {
      return '**** **** **** ****';
    }
    return `**** **** **** ${cardNumber.slice(-4)}`;
  };

  const formatCreditLimit = (limit: number | undefined | null) => {
    if (limit === undefined || limit === null) {
      return 'Unknown';
    }
    return formatCurrency(limit);
  };

  if (loading) {
    return (
      <DashboardLayout title="Credit Cards">
        <div className="container mx-auto py-6">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Credit Cards">
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
          <h1 className="text-2xl font-bold text-primary">Credit Cards</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Credit Card Application */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5" />
                  Apply for a Credit Card
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Select
                    value={selectedType}
                    onValueChange={(value: CreditCardType) => setSelectedType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CREDIT_CARD_TYPES.map((type) => (
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

                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Card Features</h3>
                  <ul className="space-y-2">
                    {CREDIT_CARD_TYPES.find(t => t.type === selectedType)?.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                  <Button 
                  onClick={handleApply} 
                    className="w-full"
                  disabled={applying}
                  >
                  {applying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Apply Now'
                  )}
                  </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - My Credit Cards */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-primary">My Credit Cards</h2>
            {creditCards.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">No credit cards found</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {creditCards.map((card) => {
                  const cardType = CREDIT_CARD_TYPES.find(t => t.type === card.type);
                  return (
                    <Card key={card.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {cardType?.icon && <cardType.icon className="h-5 w-5 text-primary" />}
                                <h3 className="font-medium">{cardType?.name}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Issued on {formatDate(card.issueDate)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(card.status)}
                              <span className="text-sm font-medium capitalize">{card.status.toLowerCase()}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                              <p className="text-sm text-muted-foreground">Card Number</p>
                              <p className="font-mono">{formatCardNumber(card.cardNumber)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Expiry Date</p>
                              <p className="font-medium">{card.expiryDate}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Credit Limit</p>
                              <p className="font-medium">{formatCreditLimit(card.creditLimit)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Available Credit</p>
                              <p className="font-medium">{formatCreditLimit(card.availableCredit)}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 