import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * A reusable statistics card component for displaying key metrics
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - The main value to display
 * @param {React.ReactNode} props.icon - Icon to display in the card
 * @param {string} props.description - Additional description text
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.valueClassName - Additional CSS classes for the value
 * @returns {JSX.Element}
 */
const StatsCard = ({
  title,
  value,
  icon,
  description,
  className = "",
  valueClassName = ""
}) => {
  return (
    <Card className={`border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold tracking-tight ${valueClassName}`}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard; 