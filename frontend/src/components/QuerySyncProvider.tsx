import React from 'react';
import { useQuerySync } from '@/hooks/use-query-sync';

/**
 * Provider component that synchronizes real-time updates with React Query cache
 * This ensures that booking status changes are immediately reflected in the UI
 * without requiring a page refresh
 */
export const QuerySyncProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Use the query sync hook to keep React Query cache in sync with real-time updates
  useQuerySync();
  
  // Simply render children, this component just provides the synchronization logic
  return <>{children}</>;
};
