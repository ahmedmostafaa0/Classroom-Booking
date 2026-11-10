import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BookOpen, Mail, HelpCircle, LogIn, UserPlus } from "lucide-react";

interface PublicNavLinksProps {
  isActive: (path: string) => boolean;
}

export const PublicNavLinks = ({ isActive }: PublicNavLinksProps) => {
  return (
    <>
      <Link
        to="/login"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100",
          isActive("/login") && "bg-slate-100 text-booking-primary font-medium"
        )}
      >
        <LogIn className="h-5 w-5" />
        <span>Login</span>
      </Link>
      <Link
        to="/register"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100",
          isActive("/register") &&
            "bg-slate-100 text-booking-primary font-medium"
        )}
      >
        <UserPlus className="h-5 w-5" />
        <span>Register</span>
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
          isActive("/help") && "bg-slate-100 text-booking-primary font-medium"
        )}
      >
        <HelpCircle className="h-5 w-5" />
        <span>Help</span>
      </Link>
    </>
  );
};
