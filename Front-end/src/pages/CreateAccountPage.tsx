import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { accountService, AccountType } from '@/services/accountService';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  accountType: z.enum(['SAVINGS', 'CHECKING'] as const, {
    required_error: 'Please select an account type',
  }),
  initialDeposit: z.string()
    .min(1, 'Initial deposit is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Initial deposit must be a positive number',
    }),
});

type FormData = z.infer<typeof formSchema>;

const accountTypeOptions: { value: AccountType; label: string }[] = [
  { value: 'SAVINGS', label: 'Savings Account' },
  { value: 'CHECKING', label: 'Checking Account' },
];

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountType: 'SAVINGS',
      initialDeposit: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      
      const account = await accountService.createAccount({
        accountType: data.accountType,
        balance: Number(data.initialDeposit),
      });

      toast.success('Account created successfully!');
      navigate(`/accounts/${account.id}`);
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create New Account">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create New Account</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select
                onValueChange={(value: AccountType) => setValue('accountType', value)}
                defaultValue="SAVINGS"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountType && (
                <p className="text-sm text-red-500">{errors.accountType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialDeposit">Initial Deposit</Label>
              <Input
                id="initialDeposit"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter initial deposit amount"
                {...register('initialDeposit')}
              />
              {errors.initialDeposit && (
                <p className="text-sm text-red-500">{errors.initialDeposit.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
} 