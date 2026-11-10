
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/services/realApi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the real API to request password reset
      await authApi.forgotPassword(email);
      
      setIsSubmitted(true);
      toast({
        title: "Email sent",
        description: "If an account exists with this email, you'll receive password reset instructions.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to process your request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Calendar className="h-10 w-10 text-booking-primary" />
          </div>
          <h1 className="mt-4 text-3xl font-bold">Forgot Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {!isSubmitted 
              ? "Enter your email and we'll send you instructions to reset your password" 
              : "Check your email for password reset instructions"}
          </p>
        </div>
        
        {!isSubmitted ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-booking-primary hover:bg-booking-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Reset Password'}
            </Button>
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-6">
              We've sent reset instructions to <span className="font-medium text-foreground">{email}</span>
            </p>
            <Button 
              variant="outline"
              onClick={() => setIsSubmitted(false)}
            >
              Try a different email
            </Button>
          </div>
        )}
        
        <div className="text-center text-sm">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
