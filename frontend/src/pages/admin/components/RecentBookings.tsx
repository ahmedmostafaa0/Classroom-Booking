
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookingCard } from '@/components/BookingCard';
import { Booking } from '@/types';

type RecentBookingsProps = {
  bookings: Booking[];
};

export const RecentBookings: React.FC<RecentBookingsProps> = ({ bookings }) => {
  const navigate = useNavigate();
  
  // Get recent bookings
  const recentBookings = [...bookings]
    .sort((a, b) => parseInt(b.id) - parseInt(a.id))
    .slice(0, 5);
    
  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Recent Bookings</h2>
        <Button variant="outline" onClick={() => navigate('/admin/bookings')}>
          View all
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recentBookings?.map((booking) => (
          <BookingCard key={booking.id} booking={booking} showActions={false} />
        ))}
      </div>
    </div>
  );
};
