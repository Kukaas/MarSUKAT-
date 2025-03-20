import { BarChart2, LineChart, ScatterChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const chartTypes = [
  { id: "bar", label: "Bar Chart", icon: BarChart2 },
  { id: "line", label: "Line Chart", icon: LineChart },
  { id: "scatter", label: "Scatter Chart", icon: ScatterChart },
];

export function ProductionChartTypeSelector({ type, onTypeChange }) {
  const currentType = chartTypes.find((t) => t.id === type) || chartTypes[0];
  const Icon = currentType.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-accent/50 transition-colors"
        >
          <Icon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {chartTypes.map((chartType) => {
          const ChartIcon = chartType.icon;
          return (
            <DropdownMenuItem
              key={chartType.id}
              onClick={() => onTypeChange(chartType.id)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                type === chartType.id && "bg-accent"
              )}
            >
              <ChartIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{chartType.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 