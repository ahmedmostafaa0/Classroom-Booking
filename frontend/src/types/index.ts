
export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string; // Added for backend use only
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  building: string;
  floor: number;
  roomNumber: string;
  features: string[];
  available: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  classroomId: string;
  classroomName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  classroomId: string;
  booking: Booking;
}

export interface BookingStats {
  total: number;
  confirmed: number;
  pending: number;
  rejected: number;
  cancelled: number;
}

// Backend specific interfaces
export interface AuthResponse {
  user: User;
  token: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
