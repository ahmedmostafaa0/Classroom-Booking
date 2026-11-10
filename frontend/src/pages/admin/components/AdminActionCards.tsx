
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, BarChart as BarChartIcon } from 'lucide-react';

export const AdminActionCards: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">User Management</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manage system users, including students and faculty members.
          </p>
          <Button onClick={() => navigate('/admin/users')} variant="outline" className="w-full">
            Manage Users
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Booking Analytics</CardTitle>
          <BarChartIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            View detailed analytics about classroom bookings.
          </p>
          <Button onClick={() => navigate('/admin/bookings')} variant="outline" className="w-full">
            View Analytics
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
