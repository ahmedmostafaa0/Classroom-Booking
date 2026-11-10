import React, { createContext, useContext } from 'react';
import { useRealTimeUpdates } from './RealTimeContext';
import { Booking, Classroom, User } from '../types';

interface DataContextType {
  bookings: Booking[];
  classrooms: Classroom[];
  users: User[];
  loading: boolean;
  refreshBookings: () => Promise<void>;
  refreshClassrooms: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    bookings,
    classrooms,
    users,
    loading,
    refreshBookings,
    refreshClassrooms,
    refreshUsers
  } = useRealTimeUpdates();
  
  return (
    <DataContext.Provider
      value={{
        bookings,
        classrooms,
        users,
        loading,
        refreshBookings,
        refreshClassrooms,
        refreshUsers
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
