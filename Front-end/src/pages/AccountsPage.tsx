import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateAccountForm } from '@/components/accounts/CreateAccountForm';
import { AccountList } from '@/components/accounts/AccountList';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AccountsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <DashboardLayout title="My Accounts">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Accounts</h1>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Create New Account'}
          </Button>
        </div>

        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Account</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateAccountForm />
            </CardContent>
          </Card>
        )}

        <AccountList />
      </div>
    </DashboardLayout>
  );
} 