
import { CalendarX2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({ 
  title, 
  description, 
  icon = <CalendarX2 className="h-12 w-12 text-muted-foreground/60" />,
  action,
  className
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed",
      className
    )}>
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
