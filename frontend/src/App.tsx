import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import BookClassroom from "./pages/BookClassroom";
import UserBookings from "./pages/UserBookings";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import { QuerySyncProvider } from './components/QuerySyncProvider';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageClassrooms from './pages/admin/ManageClassrooms';
import ManageBookings from './pages/admin/ManageBookings';
import ExportData from './pages/admin/ExportData';
import ManageContactMessages from './pages/admin/ManageContactMessages';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <QuerySyncProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/help" element={<Help />} />
                
                {/* User routes */}
                <Route path="/" element={<Index />} />
                <Route path="/book" element={<BookClassroom />} />
                <Route path="/bookings" element={<UserBookings />} />
                <Route path="/profile" element={<Profile />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/bookings" element={<ManageBookings />} />
                <Route path="/admin/classrooms" element={<ManageClassrooms />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/export" element={<ExportData />} />
                <Route path="/admin/contact" element={<ManageContactMessages />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QuerySyncProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
