import axios from 'axios';
import { User, Classroom, Booking, CalendarEvent, BookingStats, UserRole } from '../types';
import { io, Socket } from 'socket.io-client';

// Create axios instance with base URL and default headers
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Axios instance configured for the Class Calendar Nexus API
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent infinite waiting
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Socket.io connection
let socket: Socket | null = null;

/**
 * Establishes a connection to the Socket.IO server
 * @returns The Socket.IO client instance
 */
const connectSocket = () => {
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    
    socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  return socket;
};

/**
 * Sets up socket event listeners for real-time updates
 * @param handleBookingCreated Callback for when a booking is created
 * @param handleBookingUpdated Callback for when a booking is updated
 * @param handleBookingDeleted Callback for when a booking is deleted
 * @param handleMyBookingCreated Callback for when the user's booking is created
 * @param handleMyBookingUpdated Callback for when the user's booking is updated
 * @param handleMyBookingDeleted Callback for when the user's booking is deleted
 * @param handleClassroomUpdated Callback for when a classroom is updated
 * @returns Cleanup function to remove event listeners
 */
export const setupSocketListeners = (
  handleBookingCreated: (booking: Booking) => void,
  handleBookingUpdated: (booking: Booking) => void,
  handleBookingDeleted: (booking: Booking) => void,
  handleMyBookingCreated: (booking: Booking) => void,
  handleMyBookingUpdated: (booking: Booking) => void,
  handleMyBookingDeleted: (booking: Booking) => void,
  handleClassroomUpdated: (classroom: Classroom) => void
) => {
  const s = connectSocket();
  
  // Admin events
  s.on('booking:created', handleBookingCreated);
  s.on('booking:updated', handleBookingUpdated);
  s.on('booking:deleted', handleBookingDeleted);
  
  // User-specific events
  s.on('my-booking:created', handleMyBookingCreated);
  s.on('my-booking:updated', handleMyBookingUpdated);
  s.on('my-booking:deleted', handleMyBookingDeleted);
  
  // Common events
  s.on('classroom:updated', handleClassroomUpdated);
  
  // Return cleanup function
  return () => {
    if (socket) {
      socket.off('booking:created', handleBookingCreated);
      socket.off('booking:updated', handleBookingUpdated);
      socket.off('booking:deleted', handleBookingDeleted);
      socket.off('my-booking:created', handleMyBookingCreated);
      socket.off('my-booking:updated', handleMyBookingUpdated);
      socket.off('my-booking:deleted', handleMyBookingDeleted);
      socket.off('classroom:updated', handleClassroomUpdated);
    }
  };
};

/**
 * Joins the user-specific room for receiving personalized events
 * @param userId The ID of the current user
 */
const joinUserRoom = (userId: string) => {
  const s = connectSocket();
  s.emit('join-user', userId);
};

/**
 * Joins the admin room for receiving admin-specific events
 */
const joinAdminRoom = () => {
  const s = connectSocket();
  s.emit('join-admin');
};

/**
 * Disconnects from the Socket.IO server
 */
const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Authentication API methods
 */
export const authApi = {
  /**
   * Authenticates a user with email and password
   * @param email User's email address
   * @param password User's password
   * @returns User object with authentication token
   */
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Connect socket and join appropriate rooms
      joinUserRoom(user.id);
      if (user.role === 'admin') {
        joinAdminRoom();
      }
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },
  
  /**
   * Logs out the current user
   */
  logout: async (): Promise<void> => {
    try {
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Disconnect socket
      disconnectSocket();
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },
  
  /**
   * Retrieves the currently authenticated user
   * @returns User object or null if not authenticated
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const response = await api.get('/auth/me');
      const user = response.data;
      
      // Connect socket and join appropriate rooms
      joinUserRoom(user.id);
      if (user.role === 'admin') {
        joinAdminRoom();
      }
      
      return user;
    } catch (error) {
      // If token is invalid or expired, clear it
      localStorage.removeItem('token');
      return null;
    }
  },
  
  /**
   * Registers a new user
   * @param name User's full name
   * @param email User's email address
   * @param password User's password
   * @param role User's role (user or admin)
   * @returns Newly created user object
   */
  register: async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Connect socket and join appropriate rooms
      joinUserRoom(user.id);
      if (user.role === 'admin') {
        joinAdminRoom();
      }
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },
  
  /**
   * Initiates the password reset process
   * @param email User's email address
   */
  forgotPassword: async (email: string): Promise<void> => {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to process request');
    }
  },
  
  /**
   * Resets a user's password using a reset token
   * @param token Password reset token
   * @param password New password
   */
  resetPassword: async (token: string, password: string): Promise<void> => {
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },
  
  /**
   * Changes the password for the currently logged in user
   * @param currentPassword Current password
   * @param newPassword New password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  }
};

/**
 * Users API methods
 */
export const usersApi = {
  /**
   * Retrieves all users (admin only)
   * @returns Array of user objects
   */
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },
  
  /**
   * Retrieves a specific user by ID
   * @param id User ID
   * @returns User object
   */
  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'User not found');
    }
  },
  
  /**
   * Updates a user's role (admin only)
   * @param id User ID
   * @param role New role
   * @returns Updated user object
   */
  updateUserRole: async (id: string, role: UserRole): Promise<User> => {
    try {
      const response = await api.put(`/users/${id}/role`, { role });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user role');
    }
  },
  
  /**
   * Updates a user's profile
   * @param id User ID
   * @param updates Object containing fields to update
   * @returns Updated user object
   */
  updateUserProfile: async (id: string, updates: Partial<User>): Promise<User> => {
    try {
      const response = await api.put(`/users/${id}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },
  
  /**
   * Deletes a user (admin only)
   * @param id User ID
   */
  deleteUser: async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }
};

/**
 * Classrooms API methods
 */
export const classroomsApi = {
  /**
   * Retrieves all classrooms
   * @returns Array of classroom objects
   */
  getClassrooms: async (): Promise<Classroom[]> => {
    try {
      const response = await api.get('/classrooms');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch classrooms');
    }
  },
  
  /**
   * Retrieves a specific classroom by ID
   * @param id Classroom ID
   * @returns Classroom object
   */
  getClassroomById: async (id: string): Promise<Classroom> => {
    try {
      const response = await api.get(`/classrooms/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Classroom not found');
    }
  },
  
  /**
   * Creates a new classroom (admin only)
   * @param classroom Classroom data
   * @returns Newly created classroom object
   */
  addClassroom: async (classroom: Omit<Classroom, 'id'>): Promise<Classroom> => {
    try {
      const response = await api.post('/classrooms', classroom);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add classroom');
    }
  },
  
  /**
   * Updates a classroom (admin only)
   * @param id Classroom ID
   * @param updates Object containing fields to update
   * @returns Updated classroom object
   */
  updateClassroom: async (id: string, updates: Partial<Classroom>): Promise<Classroom> => {
    try {
      const response = await api.put(`/classrooms/${id}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update classroom');
    }
  },
  
  /**
   * Deletes a classroom (admin only)
   * @param id Classroom ID
   */
  deleteClassroom: async (id: string): Promise<void> => {
    try {
      await api.delete(`/classrooms/${id}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete classroom');
    }
  }
};

/**
 * Bookings API methods
 */
export const bookingsApi = {
  /**
   * Retrieves all bookings (admin) or user's bookings
   * @returns Array of booking objects
   */
  getBookings: async (): Promise<Booking[]> => {
    try {
      const response = await api.get('/bookings');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  },
  
  /**
   * Retrieves a specific booking by ID
   * @param id Booking ID
   * @returns Booking object
   */
  getBookingById: async (id: string): Promise<Booking> => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Booking not found');
    }
  },
  
  /**
   * Retrieves all bookings for a specific user
   * @param userId User ID
   * @returns Array of booking objects
   */
  getUserBookings: async (userId: string): Promise<Booking[]> => {
    try {
      const response = await api.get(`/bookings/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user bookings');
    }
  },
  
  /**
   * Retrieves all bookings for a specific classroom
   * @param classroomId Classroom ID
   * @returns Array of booking objects
   */
  getClassroomBookings: async (classroomId: string): Promise<Booking[]> => {
    try {
      const response = await api.get(`/bookings/classroom/${classroomId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch classroom bookings');
    }
  },
  
  /**
   * Creates a new booking
   * @param booking Booking data
   * @returns Newly created booking object
   */
  createBooking: async (booking: Omit<Booking, 'id' | 'status'>): Promise<Booking> => {
    try {
      const response = await api.post('/bookings', booking);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
  },
  
  /**
   * Updates a booking's status (admin only)
   * @param id Booking ID
   * @param status New status
   * @returns Updated booking object
   */
  updateBookingStatus: async (id: string, status: Booking['status']): Promise<Booking> => {
    try {
      const response = await api.put(`/bookings/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update booking status');
    }
  },
  
  /**
   * Cancels a booking
   * @param id Booking ID
   * @returns Updated booking object with cancelled status
   */
  cancelBooking: async (id: string): Promise<Booking> => {
    try {
      const response = await api.put(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  },
  
  /**
   * Converts bookings to calendar events for display
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
   * @returns Array of calendar event objects
   */
  getCalendarEvents: async (startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> => {
    try {
      // Get all bookings and convert to calendar events
      const bookings = await bookingsApi.getBookings();
      
      return bookings.map(booking => {
        const start = `${booking.date}T${booking.startTime}`;
        const end = `${booking.date}T${booking.endTime}`;
        
        return {
          id: booking.id,
          title: `${booking.classroomName}: ${booking.purpose}`,
          start,
          end,
          classroomId: booking.classroomId,
          booking,
        };
      }).filter(event => {
        if (!startDate || !endDate) return true;
        
        const eventDate = new Date(event.start);
        return eventDate >= startDate && eventDate <= endDate;
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch calendar events');
    }
  },
  
  /**
   * Retrieves booking statistics (admin only)
   * @returns Booking statistics object
   */
  getBookingStats: async (): Promise<BookingStats> => {
    try {
      const response = await api.get('/bookings/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch booking statistics');
    }
  },
  
  /**
   * Retrieves all bookings for a specific date
   * @param date Date to filter by
   * @returns Array of booking objects
   */
  getBookingsForDate: async (date: Date): Promise<Booking[]> => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await api.get(`/bookings/date/${formattedDate}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings for date');
    }
  },
  
  /**
   * Checks if a classroom is available for booking at a specific time
   * @param classroomId Classroom ID
   * @param date Date string (YYYY-MM-DD)
   * @param startTime Start time (HH:MM)
   * @param endTime End time (HH:MM)
   * @returns Boolean indicating availability
   */
  checkAvailability: async (classroomId: string, date: string, startTime: string, endTime: string): Promise<boolean> => {
    try {
      const response = await api.post('/bookings/check-availability', {
        classroomId,
        date,
        startTime,
        endTime
      });
      return response.data.available;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check availability');
    }
  },

  
  /**
   * Deletes a booking (admin only)
   * @param id Booking ID
   */
  deleteBooking: async (id: string): Promise<void> => {
    try {
      await api.delete(`/bookings/${id}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete booking');
    }
  }
};

/**
 * Contact API methods
 */
export const contactApi = {
  /**
   * Sends a contact message
   * @param contactData Contact form data
   */
  sendMessage: async (contactData: { name: string; email: string; subject: string; message: string }): Promise<void> => {
    try {
      await api.post('/contact', contactData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  }
};




