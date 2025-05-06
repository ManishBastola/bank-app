import { CreditCard } from 'lucide-react';

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-primary text-primary-foreground p-1 rounded">
        <CreditCard className="h-6 w-6" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold">Bank of Madrid</span>
        <img 
          src="https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg" 
          alt="Real Madrid Logo" 
          className="h-6 w-6"
        />
      </div>
    </div>
  );
} 