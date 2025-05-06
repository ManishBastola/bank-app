import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FontSizeProvider } from "./contexts/FontSizeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEmployeesPage from "./pages/admin/AdminEmployeesPage";
import AccountsPage from './pages/AccountsPage';
import { AccountDetails } from './components/accounts/AccountDetails';
import CreateAccountPage from './pages/CreateAccountPage';
import CustomersPage from './pages/employee/CustomersPage';
import SettingsPage from './pages/SettingsPage';
import EmployeeSettingsPage from './pages/employee/EmployeeSettingsPage';
import Transactions from './pages/customer/Transactions';
import CustomerSettings from './pages/customer/CustomerSettings';
import CreditCards from './pages/customer/CreditCards';
import Loans from './pages/customer/Loans';
import BillPaymentPage from './pages/customer/BillPaymentPage';
import ApplicationsPage from './pages/employee/ApplicationsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <FontSizeProvider>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
                <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
                  <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                  <Route path="/accounts" element={<AccountsPage />} />
                  <Route path="/accounts/:id" element={<AccountDetails />} />
                  <Route path="/create-account" element={<CreateAccountPage />} />
                  <Route path="/credit-cards" element={<CreditCards />} />
                  <Route path="/loans" element={<Loans />} />
                  <Route path="/customer-settings" element={<CustomerSettings />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/pay-bill" element={<BillPaymentPage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
                  <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
                  <Route path="/employee/customers" element={<CustomersPage />} />
                  <Route path="/employee/applications" element={<ApplicationsPage />} />
                  <Route path="/employee/settings" element={<EmployeeSettingsPage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/employees" element={<AdminEmployeesPage />} />
                  <Route path="/admin/settings" element={<SettingsPage />} />
                </Route>
            
            {/* 404 - Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
      </FontSizeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
