import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { Trash2, Edit, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

interface BookingCardProps {
  booking: Booking;
  onEdit?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  showActions?: boolean;
}

export const BookingCard = ({ booking, onEdit, onCancel, showActions = true }: BookingCardProps) => {
  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(parseISO(`${dateStr}T00:00:00`), 'MMMM d, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const displayDate = formatDisplayDate(booking.date);

  return (
    <Card className="overflow-hidden flex flex-col h-full"> {/* Added flex flex-col h-full for consistent card height */}
      <div 
        className={`h-2 w-full ${
          booking.status === 'confirmed' ? 'bg-booking-success' :
          booking.status === 'pending' ? 'bg-booking-pending' :
          booking.status === 'rejected' ? 'bg-booking-error' :
          'bg-booking-dark'
        }`} 
      />
      <CardContent className="p-4 flex-grow"> {/* Added flex-grow to allow content to expand */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium truncate break-words">{booking.purpose}</h3> {/* Added break-words */}
          <StatusBadge status={booking.status} />
        </div>
        
        <p className="text-sm text-muted-foreground mb-2 break-words">{booking.classroomName}</p> {/* Added break-words */}
        
        <div className="flex items-center text-sm mb-4 flex-wrap"> {/* Added flex-wrap for responsiveness */}
          <Clock className="h-4 w-4 mr-1 flex-shrink-0" /> {/* Added flex-shrink-0 */}
          <span className="mr-1 break-all">{booking.startTime} - {booking.endTime}</span> {/* Added break-all */}
          <span className="mx-2 hidden sm:inline">•</span> {/* Hide separator on very small screens */}
          <span className="break-all">{displayDate}</span> {/* Added break-all */}
        </div>
        
        <p className="text-xs text-muted-foreground break-words">Booked by: {booking.userName}</p> {/* Added break-words */}
      </CardContent>
      
      {showActions && booking.status !== 'cancelled' && booking.status !== 'rejected' && (
        <CardFooter className="flex justify-end p-4 pt-0 gap-2 mt-auto"> {/* Added mt-auto to push footer to bottom */}
          {onEdit && booking.status === 'pending' && (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(booking)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
          )}
          {onCancel && (booking.status === 'confirmed' || booking.status === 'pending') && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1"
              onClick={() => onCancel(booking)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Cancel
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
