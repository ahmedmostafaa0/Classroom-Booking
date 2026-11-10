
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      // Error is already handled in the login function
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is already logged in, redirect to home page
  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Calendar className="h-10 w-10 text-booking-primary" />
          </div>
          <h1 className="mt-4 text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        
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
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-booking-primary hover:bg-booking-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        
        <div className="text-center text-sm">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="border-t pt-4">
          <p className="text-xs text-center text-muted-foreground mb-2">Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => {
                setEmail('ahmed.mostafa@example.com');
                setPassword('password');
              }}
            >
              Admin
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => {
                setEmail('computer.science@example.com');
                setPassword('computer123');
              }}
            >
              Faculty
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
