import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Calendar,
  FileText,
  Settings,
  BookOpen,
  Mail,
  HelpCircle,
} from "lucide-react";

interface UserNavLinksProps {
  isActive: (path: string) => boolean;
}

export const UserNavLinks = ({ isActive }: UserNavLinksProps) => {
  const { user, isAdmin } = useAuth();
  return (
    <>
      <Link
        to="/"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100",
          isActive("/") && "bg-slate-100 text-booking-primary font-medium"
        )}
      >
        <Home className="h-5 w-5" />
        <span>Dashboard</span>
      </Link>
      <Link
        to="/book"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100",
          isActive("/book") && "bg-slate-100 text-booking-primary font-medium"
        )}
      >
        <Calendar className="h-5 w-5" />
        <span>Book Classroom</span>
      </Link>
      <Link
        to="/bookings"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100",
          isActive("/bookings") &&
            "bg-slate-100 text-booking-primary font-medium"
        )}
      >
        <FileText className="h-5 w-5" />
        <span>My Bookings</span>
      </Link>

      <div className="pt-4 pb-2">
        <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          GENERAL
        </div>
      </div>
      <Link
        to="/profile"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100",
          isActive("/profile") &&
            "bg-slate-100 text-booking-primary font-medium"
        )}
      >
        <Settings className="h-5 w-5" />
        <span>Profile</span>
      </Link>
      <Link
        to="/about"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100",
          isActive("/about") && "bg-slate-100 text-booking-primary font-medium"
        )}
      >
        <BookOpen className="h-5 w-5" />
        <span>About</span>
      </Link>
      {!isAdmin ? (
        <div>
          {" "}
          <Link
            to="/contact"
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100",
              isActive("/contact") &&
                "bg-slate-100 text-booking-primary font-medium"
            )}
          >
            <Mail className="h-5 w-5" />
            <span>Contact</span>
          </Link>
          <Link
            to="/help"
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100",
              isActive("/help") &&
                "bg-slate-100 text-booking-primary font-medium"
            )}
          >
            <HelpCircle className="h-5 w-5" />
            <span>Help</span>
          </Link>
        </div>
      ) : null}
    </>
  );
};
