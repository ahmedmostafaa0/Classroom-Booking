
import { Badge } from "@/components/ui/badge";

interface FeaturesListProps {
  features: string[];
}

export const FeaturesList = ({ features }: FeaturesListProps) => {
  return (
    <div className="flex flex-wrap gap-1">
      {features.map((feature, index) => (
        <Badge key={index} variant="outline" className="bg-accent/10">
          {feature}
        </Badge>
      ))}
    </div>
  );
};
