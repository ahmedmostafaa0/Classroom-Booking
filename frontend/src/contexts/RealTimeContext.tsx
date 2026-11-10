import { setupSocketListeners, bookingsApi, classroomsApi, usersApi } from '../services/realApi';
import { useEffect, useState } from 'react';
import { Booking, Classroom, User } from '../types';
import { useAuth } from './AuthContext';

// Custom hook for real-time updates
export const useRealTimeUpdates = () => {
  const { user, isAdmin } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial data loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Load classrooms for all users
        const classroomsData = await classroomsApi.getClassrooms();
        setClassrooms(classroomsData);
        
        // Load bookings based on user role
        let bookingsData: Booking[] = [];
        if (user) {
          if (isAdmin) {
            bookingsData = await bookingsApi.getBookings();
          } else {
            bookingsData = await bookingsApi.getUserBookings(user.id);
          }
        }
        setBookings(bookingsData);
        
        // Load users for admin only
        if (isAdmin) {
          const usersData = await usersApi.getUsers();
          setUsers(usersData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user, isAdmin]);
  
  // Set up socket listeners for real-time updates
  useEffect(() => {
    if (!user) return;
    
    // Define handlers for socket events
    const handleBookingCreated = (booking: Booking) => {
      if (isAdmin) {
        setBookings(prev => [...prev, booking]);
      }
    };
    
    const handleBookingUpdated = (booking: Booking) => {
      if (isAdmin) {
        setBookings(prev => 
          prev.map(b => b.id === booking.id ? booking : b)
        );
      }
    };
    
    const handleBookingDeleted = (booking: Booking) => {
      if (isAdmin) {
        setBookings(prev => prev.filter(b => b.id !== booking.id));
      }
    };
    
    const handleMyBookingCreated = (booking: Booking) => {
      setBookings(prev => [...prev, booking]);
    };
    
    const handleMyBookingUpdated = (booking: Booking) => {
      setBookings(prev => 
        prev.map(b => b.id === booking.id ? booking : b)
      );
    };
    
    const handleMyBookingDeleted = (booking: Booking) => {
      setBookings(prev => prev.filter(b => b.id !== booking.id));
    };
    
    const handleClassroomUpdated = (classroom: Classroom) => {
      setClassrooms(prev => 
        prev.map(c => c.id === classroom.id ? classroom : c)
      );
    };
    
    // Set up socket listeners
    const cleanup = setupSocketListeners(
      handleBookingCreated,
      handleBookingUpdated,
      handleBookingDeleted,
      handleMyBookingCreated,
      handleMyBookingUpdated,
      handleMyBookingDeleted,
      handleClassroomUpdated
    );
    
    // Clean up socket listeners on unmount
    return cleanup;
  }, [user, isAdmin]);
  
  return {
    bookings,
    classrooms,
    users,
    loading,
    refreshBookings: async () => {
      try {
        if (!user) return;
        
        if (isAdmin) {
          const bookingsData = await bookingsApi.getBookings();
          setBookings(bookingsData);
        } else {
          const bookingsData = await bookingsApi.getUserBookings(user.id);
          setBookings(bookingsData);
        }
      } catch (error) {
        console.error('Error refreshing bookings:', error);
      }
    },
    refreshClassrooms: async () => {
      try {
        const classroomsData = await classroomsApi.getClassrooms();
        setClassrooms(classroomsData);
      } catch (error) {
        console.error('Error refreshing classrooms:', error);
      }
    },
    refreshUsers: async () => {
      try {
        if (isAdmin) {
          const usersData = await usersApi.getUsers();
          setUsers(usersData);
        }
      } catch (error) {
        console.error('Error refreshing users:', error);
      }
    }
  };
};
