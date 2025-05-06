import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  LoanApplication, 
  CreditCardApplication, 
  applicationService 
} from '@/services/applicationService';

export default function ApplicationsPage() {
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [creditCardApplications, setCreditCardApplications] = useState<CreditCardApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<CreditCardApplication | null>(null);
  const [approvedLimit, setApprovedLimit] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const [loans, creditCards] = await Promise.all([
        applicationService.getPendingLoanApplications(),
        applicationService.getPendingCreditCardApplications()
      ]);
      console.log('Credit card applications:', creditCards);
      setLoanApplications(loans);
      setCreditCardApplications(creditCards);
    } catch (error) {
      console.error('Fetch applications error:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleLoanAction = async (loanId: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await applicationService.updateLoanStatus(loanId, status);
      toast.success(`Loan application ${status.toLowerCase()}`);
      fetchApplications();
    } catch (error) {
      console.error('Update loan status error:', error);
      toast.error('Failed to update loan status');
    }
  };

  const handleCreditCardAction = async (applicationId: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      if (status === 'APPROVED' && !approvedLimit) {
        toast.error('Please set an approved limit');
        return;
      }

      await applicationService.updateCreditCardStatus(
        applicationId,
        status,
        status === 'APPROVED' ? Number(approvedLimit) : undefined
      );
      toast.success(`Credit card application ${status.toLowerCase()}`);
      setIsDialogOpen(false);
      setSelectedApplication(null);
      setApprovedLimit('');
      fetchApplications();
    } catch (error) {
      console.error('Update credit card status error:', error);
      toast.error('Failed to update credit card status');
    }
  };

  const openCreditCardDialog = (application: CreditCardApplication) => {
    setSelectedApplication(application);
    setApprovedLimit(application.requestedLimit?.toString() || '0');
    setIsDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout title="Applications">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Applications">
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-2xl font-bold">Pending Applications</h1>

        <Tabs defaultValue="loans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="loans">Loan Applications</TabsTrigger>
            <TabsTrigger value="credit-cards">Credit Card Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="loans">
            <Card>
              <CardHeader>
                <CardTitle>Loan Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No pending loan applications
                        </TableCell>
                      </TableRow>
                    ) : (
                      loanApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>{application.id}</TableCell>
                          <TableCell>{application.username}</TableCell>
                          <TableCell>{formatCurrency(application.amount)}</TableCell>
                          <TableCell>{application.purpose}</TableCell>
                          <TableCell>{new Date(application.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleLoanAction(application.id, 'APPROVED')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleLoanAction(application.id, 'REJECTED')}
                              >
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credit-cards">
            <Card>
              <CardHeader>
                <CardTitle>Credit Card Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Card Type</TableHead>
                      <TableHead>Requested Limit</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditCardApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No pending credit card applications
                        </TableCell>
                      </TableRow>
                    ) : (
                      creditCardApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>{application.id}</TableCell>
                          <TableCell>{application.username || 'N/A'}</TableCell>
                          <TableCell>{application.type}</TableCell>
                          <TableCell>{formatCurrency(application.requestedLimit)}</TableCell>
                          <TableCell>{application.interestRate}%</TableCell>
                          <TableCell>{new Date(application.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => openCreditCardDialog(application)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCreditCardAction(application.id, 'REJECTED')}
                              >
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Credit Card Application</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Customer ID</Label>
                  <p>{selectedApplication.customerId || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <Label>Card Type</Label>
                  <p>{selectedApplication.type || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <Label>Requested Limit</Label>
                  <p>{formatCurrency(selectedApplication.requestedLimit || 0)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Interest Rate</Label>
                  <p>{selectedApplication.interestRate || 0}%</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approvedLimit">Approved Limit</Label>
                  <Input
                    id="approvedLimit"
                    type="number"
                    value={approvedLimit}
                    onChange={(e) => setApprovedLimit(e.target.value)}
                    placeholder="Enter approved limit"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedApplication(null);
                  setApprovedLimit('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedApplication && handleCreditCardAction(selectedApplication.id, 'APPROVED')}
              >
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 