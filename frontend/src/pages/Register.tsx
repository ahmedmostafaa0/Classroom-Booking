
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(name, email, password, role);
    } catch (error) {
      // Error is handled in the register function
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
          <h1 className="mt-4 text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your information to get started
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            <Label htmlFor="password">Password</Label>
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
            <Label htmlFor="role">I am a</Label>
            <Select 
              value={role} 
              onValueChange={(value: UserRole) => setRole(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-booking-primary hover:bg-booking-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
        
        <div className="text-center text-sm">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
