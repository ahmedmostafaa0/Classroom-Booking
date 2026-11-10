
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingCard } from '@/components/BookingCard';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { bookingsApi } from '@/services/realApi';
import { Booking } from '@/types';
import { CalendarPlus } from 'lucide-react';

const UserBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch user's bookings
  const { data: userBookings = [], isLoading } = useQuery({
    queryKey: ['userBookings', user?.id],
    queryFn: () => user ? bookingsApi.getUserBookings(user.id) : Promise.resolve([]),
    // Ensure query is always up-to-date
    staleTime: 0,
  });
  
  // Get query client for cache invalidation
  const queryClient = useQueryClient();
  
  // Handle booking cancellation
  const handleCancelBooking = async (booking: Booking) => {
    try {
      await bookingsApi.cancelBooking(booking.id);
      toast({
        title: 'Booking cancelled',
        description: `Your booking for ${booking.classroomName} has been cancelled.`,
      });
      // Invalidate the query to trigger a refetch
      queryClient.invalidateQueries(['userBookings', user?.id]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle booking edit 
  const handleEditBooking = (booking: Booking) => {
    // In a real app, we would navigate to an edit page
    toast({
      title: 'Edit booking',
      description: 'Editing functionality will be available in a future update.',
    });
  };
  
  // Filter bookings based on active tab
  const filteredBookings = userBookings.filter((booking) => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });
  
  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Bookings</h1>
            <p className="text-muted-foreground">
              View and manage all your classroom bookings.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/book')}
            className="bg-booking-primary hover:bg-booking-primary/90"
          >
            <CalendarPlus className="mr-2 h-4 w-4" /> New Booking
          </Button>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-[180px] animate-pulse bg-muted" />
                ))}
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onEdit={booking.status === 'pending' ? handleEditBooking : undefined}
                    onCancel={
                      booking.status === 'pending' || booking.status === 'confirmed' 
                        ? handleCancelBooking 
                        : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={`No ${activeTab === 'all' ? '' : activeTab} bookings found`}
                description={`You don't have any ${activeTab === 'all' ? '' : activeTab} bookings.`}
                action={{
                  label: 'Create a Booking',
                  onClick: () => navigate('/book'),
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default UserBookings;
