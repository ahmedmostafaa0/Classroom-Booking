
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { bookingsApi, classroomsApi, usersApi } from '@/services/realApi';
import { DashboardStatCards } from './components/DashboardStatCards';
import { BookingCharts } from './components/BookingCharts';
import { RecentBookings } from './components/RecentBookings';
import { AdminActionCards } from './components/AdminActionCards';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  
  // Fetch all data regardless of admin status - we'll handle redirect after
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getUsers,
  });
  
  const { data: classrooms = [] } = useQuery({
    queryKey: ['classrooms'],
    queryFn: classroomsApi.getClassrooms,
  });
  
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingsApi.getBookings,
  });
  
  const { data: bookingStats } = useQuery({
    queryKey: ['bookingStats'],
    queryFn: bookingsApi.getBookingStats,
  });
  
  // Redirect if not admin - moved after all hooks are called
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return (
    <MainLayout>
      <div className="container px-4 py-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Admin Dashboard</h1>
        
        <DashboardStatCards 
          users={users} 
          classrooms={classrooms} 
          bookings={bookings} 
          bookingStats={bookingStats}
        />
        
        <BookingCharts 
          bookings={bookings} 
          bookingStats={bookingStats} 
        />
        
        <RecentBookings bookings={bookings} />
        
        <AdminActionCards />
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
