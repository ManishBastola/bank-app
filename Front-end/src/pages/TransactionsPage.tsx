import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionList } from '@/components/transactions/TransactionList';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [showTransferForm, setShowTransferForm] = useState(false);

  return (
    <DashboardLayout title="Transactions">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Transactions</h1>
          {user?.role === 'CUSTOMER' && (
            <Button onClick={() => setShowTransferForm(!showTransferForm)}>
              {showTransferForm ? 'Cancel' : 'Transfer Money'}
            </Button>
          )}
        </div>

        {showTransferForm && (
          <Card>
            <CardHeader>
              <CardTitle>Transfer Money</CardTitle>
            </CardHeader>
            <CardContent>
              {/* We'll create the TransferForm component next */}
              <p className="text-muted-foreground">Transfer form coming soon...</p>
            </CardContent>
          </Card>
        )}

        <TransactionList />
      </div>
    </DashboardLayout>
  );
} 