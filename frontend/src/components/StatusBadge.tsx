
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'confirmed' | 'pending' | 'rejected' | 'cancelled';
  className?: string;
}

const statusConfig = {
  confirmed: {
    label: "Confirmed",
    className: "bg-booking-success text-white hover:bg-booking-success/90"
  },
  pending: {
    label: "Pending",
    className: "bg-booking-pending text-white hover:bg-booking-pending/90"
  },
  rejected: {
    label: "Rejected",
    className: "bg-booking-error text-white hover:bg-booking-error/90"
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-booking-dark text-white hover:bg-booking-dark/90"
  }
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};
