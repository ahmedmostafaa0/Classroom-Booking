
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Classroom } from "@/types";
import { FeaturesList } from "./FeaturesList";
import { Users, Building } from "lucide-react";

interface ClassroomCardProps {
  classroom: Classroom;
  onBook?: (classroom: Classroom) => void;
  onEdit?: (classroom: Classroom) => void;
  isAdmin?: boolean;
}

export const ClassroomCard = ({ classroom, onBook, onEdit, isAdmin = false }: ClassroomCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{classroom.name}</h3>
          {classroom.available ? (
            <Badge className="bg-booking-available">Available</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">Unavailable</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Building className="h-4 w-4 mr-1" />
          <span>{classroom.building}, Floor {classroom.floor}, Room {classroom.roomNumber}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Users className="h-4 w-4 mr-1" />
          <span>Capacity: {classroom.capacity} people</span>
        </div>
        <FeaturesList features={classroom.features} />
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2">
        {isAdmin && onEdit && (
          <Button variant="outline" className="flex-1" onClick={() => onEdit(classroom)}>
            Edit
          </Button>
        )}
        {onBook && classroom.available && (
          <Button 
            className="flex-1 bg-booking-primary hover:bg-booking-primary/90" 
            onClick={() => onBook(classroom)}
          >
            Book Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
