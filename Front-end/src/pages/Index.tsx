import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Logo } from '../components/ui/logo';
import { CreditCard } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated, redirect to their dashboard
    if (!loading && user) {
      if (user.role === 'CUSTOMER') {
        navigate('/customer-dashboard');
      } else if (user.role === 'EMPLOYEE') {
        navigate('/employee-dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      }
    }
  }, [user, loading, navigate]);

  // If still loading, show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, show landing page
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 py-6 bg-card border-b">
        <div className="container mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/register')}>
              Register
            </Button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Modern Banking <br />
                <span className="text-primary">Management Solution</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                A complete platform for customers, employees and administrators
                to manage banking operations seamlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                  Login to Your Account
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="aspect-video bg-muted/40 rounded-lg shadow-lg flex items-center justify-center p-12">
                <div className="aspect-[3/2] w-full max-w-md bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg shadow flex items-center justify-center p-8">
                  <div className="text-center">
                    <CreditCard className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <h2 className="text-2xl font-semibold">Bank Management System</h2>
                    <p className="text-muted-foreground mt-2">Secure, Fast, Reliable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2023 Bank of Madrid. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
