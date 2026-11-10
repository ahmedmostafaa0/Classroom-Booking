
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingCard } from '@/components/BookingCard';
import { ClassroomCard } from '@/components/ClassroomCard';
import { EmptyState } from '@/components/EmptyState';
import { bookingsApi, classroomsApi } from '@/services/realApi';
import { Booking, Classroom } from '@/types';
import { CalendarDays, BookOpen, Building, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's bookings (can safely run even if user is undefined – will return error or empty)
  const { data: userBookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['userBookings', user?.id],
    queryFn: () => bookingsApi.getUserBookings(user.id),
    enabled: !!user?.id, // prevent execution if no user
  });

  // Fetch classrooms
  const { data: classrooms = [], isLoading: isLoadingClassrooms } = useQuery({
    queryKey: ['classrooms'],
    queryFn: classroomsApi.getClassrooms,
  });

  // Redirect logic inside render
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" />;
  }

  // Filter upcoming bookings
  const upcomingBookings = userBookings
    .filter(booking => booking.status !== 'cancelled' && booking.status !== 'rejected')
    .slice(0, 3);

  // Handle booking cancellation
  const handleCancelBooking = async (booking: Booking) => {
    try {
      await bookingsApi.cancelBooking(booking.id);
      toast({
        title: 'Booking cancelled',
        description: `Your booking for ${booking.classroomName} has been cancelled.`,
      });
      // Invalidate queries to trigger a refetch and refresh the data
      queryClient.invalidateQueries(['userBookings', user?.id]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Navigate to book a classroom
  const handleBookClassroom = (classroom: Classroom) => {
    navigate('/book', { state: { selectedClassroom: classroom } });
  };

  const todayBookingsCount = userBookings.filter(
    b => b.date === new Date().toISOString().split('T')[0]
  ).length;

  return (
    <MainLayout>
      <div className="space-y-8  p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Button 
            onClick={() => navigate('/book')}
            className="bg-booking-primary hover:bg-booking-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" /> New Booking
          </Button>
        </div>
        
        {/* Quick stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingBookings ? '...' : userBookings.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {userBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Classrooms</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingClassrooms ? '...' : classrooms.filter(c => c.available).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of {classrooms.length} total classrooms
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingBookings ? '...' : todayBookingsCount}
              </div>
              <p className="text-xs text-muted-foreground">
                For {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Upcoming bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight">Upcoming Bookings</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/bookings')}>
              View all
            </Button>
          </div>
          
          {isLoadingBookings ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-[180px] animate-pulse bg-muted" />
              ))}
            </div>
          ) : upcomingBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {upcomingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming bookings"
              description="You don't have any upcoming bookings. Book a classroom now!"
              action={{
                label: 'Book a Classroom',
                onClick: () => navigate('/book'),
              }}
            />
          )}
        </div>
        
        {/* Available classrooms */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight">Available Classrooms</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/book')}>
              View all
            </Button>
          </div>
          
          {isLoadingClassrooms ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-[220px] animate-pulse bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {classrooms
                .filter(c => c.available)
                .slice(0, 3)
                .map((classroom) => (
                  <ClassroomCard
                    key={classroom.id}
                    classroom={classroom}
                    onBook={handleBookClassroom}
                  />
                ))
              }
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
