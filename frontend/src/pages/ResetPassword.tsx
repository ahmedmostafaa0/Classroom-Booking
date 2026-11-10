
import { useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/services/realApi';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { token: urlToken } = useParams();
  
  // Get the token from either URL params or query string
  const searchParams = new URLSearchParams(location.search);
  const queryToken = searchParams.get('token');
  const token = urlToken || queryToken;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the real API to reset password
      await authApi.resetPassword(token, password);
      
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
      });
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. The link may be expired.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show error if no token is provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-xl font-semibold text-red-600">Invalid Reset Link</h1>
          <p className="text-muted-foreground">
            The password reset link is invalid or has expired.
          </p>
          <div className="pt-4">
            <Link to="/forgot-password">
              <Button variant="secondary">Request a new reset link</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Calendar className="h-10 w-10 text-booking-primary" />
          </div>
          <h1 className="mt-4 text-3xl font-bold">Reset Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-booking-primary hover:bg-booking-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Setting new password...' : 'Reset Password'}
          </Button>
        </form>
        
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

export default ResetPassword;
