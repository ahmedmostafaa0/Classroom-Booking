import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../pages/Login';
import Register from '../pages/Register';
import BookClassroom from '../pages/BookClassroom';
import UserBookings from '../pages/UserBookings';

// Mock the API calls
jest.mock('../services/realApi', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
  bookingsApi: {
    createBooking: jest.fn(),
    getUserBookings: jest.fn(),
    cancelBooking: jest.fn(),
    checkAvailability: jest.fn(),
  },
  classroomsApi: {
    getClassrooms: jest.fn(),
  },
}));

// Create a wrapper for testing components that need context providers
const AllTheProviders = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Test suite for Login component
describe('Login Component', () => {
  test('renders login form', () => {
    render(<Login />, { wrapper: AllTheProviders });
    
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
  
  test('validates form inputs', async () => {
    render(<Login />, { wrapper: AllTheProviders });
    
    // Submit without filling in fields
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
});

// Test suite for Register component
describe('Register Component', () => {
  test('renders registration form', () => {
    render(<Register />, { wrapper: AllTheProviders });
    
    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });
  
  test('validates form inputs', async () => {
    render(<Register />, { wrapper: AllTheProviders });
    
    // Submit without filling in fields
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
});

// Test suite for BookClassroom component
describe('BookClassroom Component', () => {
  beforeEach(() => {
    // Mock the API responses
    require('../services/realApi').classroomsApi.getClassrooms.mockResolvedValue([
      { id: '1', name: 'Room 101', capacity: 30, available: true },
      { id: '2', name: 'Room 102', capacity: 25, available: true },
    ]);
    
    require('../services/realApi').bookingsApi.checkAvailability.mockResolvedValue(true);
    require('../services/realApi').bookingsApi.createBooking.mockResolvedValue({
      id: '1',
      classroomId: '1',
      classroomName: 'Room 101',
      date: '2025-05-20',
      startTime: '09:00',
      endTime: '11:00',
      purpose: 'Test Booking',
      status: 'pending',
    });
  });
  
  test('renders booking form', async () => {
    render(<BookClassroom />, { wrapper: AllTheProviders });
    
    await waitFor(() => {
      expect(screen.getByText(/book a classroom/i)).toBeInTheDocument();
    });
  });
});

// Test suite for UserBookings component
describe('UserBookings Component', () => {
  beforeEach(() => {
    // Mock the API responses
    require('../services/realApi').bookingsApi.getUserBookings.mockResolvedValue([
      {
        id: '1',
        classroomId: '1',
        classroomName: 'Room 101',
        date: '2025-05-20',
        startTime: '09:00',
        endTime: '11:00',
        purpose: 'Test Booking',
        status: 'confirmed',
      },
    ]);
    
    require('../services/realApi').authApi.getCurrentUser.mockResolvedValue({
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    });
  });
  
  test('renders user bookings', async () => {
    render(<UserBookings />, { wrapper: AllTheProviders });
    
    await waitFor(() => {
      expect(screen.getByText(/my bookings/i)).toBeInTheDocument();
    });
  });
});
