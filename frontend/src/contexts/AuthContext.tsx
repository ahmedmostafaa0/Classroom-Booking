import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../services/realApi';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;  // <-- add setUser here
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authApi.login(email, password);
      setUser(user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      // Navigate to login page after successful logout
      window.location.href = '/login';
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const newUser = await authApi.register(name, email, password, role);
      setUser(newUser);
      toast({
        title: "Registration successful",
        description: `Welcome, ${newUser.name}!`,
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const isAdmin = user?.role === 'admin';
  
  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout, register, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
