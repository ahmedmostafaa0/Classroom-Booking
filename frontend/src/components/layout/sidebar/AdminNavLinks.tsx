
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Settings, Building, Users, DownloadCloud, Calendar } from 'lucide-react';

interface AdminNavLinksProps {
  isActive: (path: string) => boolean;
}

export const AdminNavLinks = ({ isActive }: AdminNavLinksProps) => {
  return (
    <>
      <div className="pt-4 pb-2">
        <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          ADMIN
        </div>
      </div>
      <Link
        to="/admin"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100",
          isActive('/admin') && "bg-slate-100 text-booking-primary font-medium"
        )}
      >
        <Settings className="h-5 w-5" />
        <span>Admin Dashboard</span>
      </Link>
      <Link
        to="/admin/bookings"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100",
          isActive('/admin/bookings') && "bg-slate-100 text-booking-primary font-medium"
        )}
      >
        <Calendar className="h-5 w-5" />
        <span>Manage Bookings</span>
      </Link>
      <Link
        to="/admin/classrooms"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100",
          isActive('/admin/classrooms') && "bg-slate-100 text-booking-primary font-medium"
        )}
      >
        <Building className="h-5 w-5" />
        <span>Manage Classrooms</span>
      </Link>
      <Link
        to="/admin/users"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100",
          isActive('/admin/users') && "bg-slate-100 text-booking-primary font-medium"
        )}
      >
        <Users className="h-5 w-5" />
        <span>Manage Users</span>
      </Link>
      <Link
        to="/admin/export"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100",
          isActive('/admin/export') && "bg-slate-100 text-booking-primary font-medium"
        )}
      >
        <DownloadCloud className="h-5 w-5" />
        <span>Export Data</span>
      </Link>
    </>
  );
};
