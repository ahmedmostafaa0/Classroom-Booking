import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealTimeUpdates } from '@/contexts/RealTimeContext';
import { Booking } from '@/types';

/**
 * Custom hook to synchronize real-time updates with React Query cache
 * This ensures that booking status changes are immediately reflected in the UI
 * without requiring a page refresh
 */
export const useQuerySync = () => {
  const queryClient = useQueryClient();
  const { bookings } = useRealTimeUpdates();

  useEffect(() => {
    // Function to update a specific booking in the cache
    const updateBookingInCache = (booking: Booking) => {
      // Update admin bookings query
      queryClient.setQueryData(['admin-bookings'], (oldData: Booking[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(item => item.id === booking.id ? booking : item);
      });

      // Update user bookings query for the specific user
      queryClient.setQueryData(['userBookings', booking.userId], (oldData: Booking[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(item => item.id === booking.id ? booking : item);
      });
      
      // Invalidate queries to ensure components re-render with updated data
      queryClient.invalidateQueries(['admin-bookings']);
      queryClient.invalidateQueries(['userBookings', booking.userId]);
    };

    // Process each booking to update the cache
    bookings.forEach(booking => {
      updateBookingInCache(booking);
    });

    // Set up a listener for the socket events
    const handleBookingUpdated = (updatedBooking: Booking) => {
      updateBookingInCache(updatedBooking);
    };

    // Add event listener to the window for simulating socket events in development
    window.addEventListener('booking-updated', (e: any) => {
      if (e.detail && e.detail.booking) {
        handleBookingUpdated(e.detail.booking);
      }
    });

    return () => {
      window.removeEventListener('booking-updated', (e: any) => {
        if (e.detail && e.detail.booking) {
          handleBookingUpdated(e.detail.booking);
        }
      });
    };
  }, [bookings, queryClient]);

  return null;
};
