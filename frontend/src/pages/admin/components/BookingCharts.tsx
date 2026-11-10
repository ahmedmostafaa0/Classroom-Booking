
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { format, subDays } from 'date-fns';
import { Booking } from '@/types';

type BookingStatsType = {
  total: number;
  confirmed: number;
  pending: number;
  rejected: number;
  cancelled: number;
} | undefined;

type BookingChartsProps = {
  bookings: Booking[];
  bookingStats: BookingStatsType;
};

export const BookingCharts: React.FC<BookingChartsProps> = ({
  bookings,
  bookingStats
}) => {
  // Calculate booking stats if not provided
  const calculatedStats = useMemo(() => {
    if (bookingStats) return bookingStats;
    
    // Calculate from bookings array if bookingStats is not available
    const stats = {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      rejected: bookings.filter(b => b.status === 'rejected').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length
    };
    
    return stats;
  }, [bookings, bookingStats]);
  
  // Prepare data for pie chart
  const pieData = [
    { name: 'Confirmed', value: calculatedStats.confirmed, color: '#22c55e' },
    { name: 'Pending', value: calculatedStats.pending, color: '#f97316' },
    { name: 'Cancelled', value: calculatedStats.cancelled, color: '#1e293b' },
    { name: 'Rejected', value: calculatedStats.rejected, color: '#ef4444' },
  ].filter(item => item.value > 0); // Only show statuses with values
  
  // Prepare data for bar chart
  const today = new Date();
  const getDailyBookings = (days: number) => {
    const daily = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dailyBookings = bookings.filter(booking => booking.date === dateStr);
      
      daily.push({
        date: format(date, 'MMM dd'),
        bookings: dailyBookings.length,
      });
    }
    return daily;
  };
  
  const dailyBookingsData = getDailyBookings(7);

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7 mb-8">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Weekly Booking Overview</CardTitle>
          <CardDescription>
            Number of bookings over the past 7 days
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyBookingsData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" name="Bookings" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Booking Status</CardTitle>
          <CardDescription>
            Distribution of booking statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) => `${name} (${value}) ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No booking data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
