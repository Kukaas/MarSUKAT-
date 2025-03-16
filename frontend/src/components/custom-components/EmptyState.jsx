import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const EmptyState = ({
  icon: Icon = Package,
  message = "No data available",
  className = "",
}) => {
  return (
    <Card className={`bg-muted/50 ${className}`}>
      <CardContent className="p-8 text-center">
        <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
