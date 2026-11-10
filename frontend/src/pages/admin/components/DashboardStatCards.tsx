import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, CalendarCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { User, Classroom, Booking } from '@/types';

type DashboardStatCardsProps = {
  users: User[];
  classrooms: Classroom[];
  bookings: Booking[];
  bookingStats: {
    total: number;
    confirmed: number;
    pending: number;
    rejected: number;
    cancelled: number;
  } | undefined;
};

export const DashboardStatCards: React.FC<DashboardStatCardsProps> = ({
  users,
  classrooms,
  bookings,
  bookingStats,
}) => {
  const today = new Date();
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users?.length || 0}</div>
          <p className="text-xs text-muted-foreground break-words">
            {users?.filter(u => u.role === 'student')?.length || 0} students, {users?.filter(u => u.role === 'faculty')?.length || 0} faculty
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Classrooms</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{classrooms?.length || 0}</div>
          <p className="text-xs text-muted-foreground break-words">
            {classrooms?.filter(c => c.available)?.length || 0} available
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bookingStats?.total || 0}</div>
          <p className="text-xs text-muted-foreground break-words">
            {bookingStats?.confirmed || 0} confirmed, {bookingStats?.pending || 0} pending
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {bookings?.filter(b => b.date === format(today, 'yyyy-MM-dd'))?.length || 0}
          </div>
          <p className="text-xs text-muted-foreground break-words">
            For {format(today, 'MMMM d, yyyy')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
