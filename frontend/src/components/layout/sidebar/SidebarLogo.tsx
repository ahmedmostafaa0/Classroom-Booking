
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export const SidebarLogo = () => {
  return (
    <div className="p-4 border-b sticky top-0 bg-white z-10">
      <Link to="/" className="flex items-center space-x-2">
        <Calendar className="h-6 w-6 text-booking-primary" />
        <span className="text-lg font-bold">ClassRoom Booking</span>
      </Link>
    </div>
  );
};
