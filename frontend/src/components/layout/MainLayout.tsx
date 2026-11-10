import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children
}) => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex flex-1 pt-14"> {/* Added pt-14 to account for navbar height */}
          <Sidebar />
          <main className="flex-1 overflow-y-auto md:pl-64"> {/* Added md:pl-64 for sidebar width on medium screens and up */}
            {children}
          </main>
        </div>
        <Toaster />
        <Sonner />
      </div>
    </TooltipProvider>
  );
};
