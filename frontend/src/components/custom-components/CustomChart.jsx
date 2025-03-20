import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, ScatterChart, Scatter } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import EmptyState from "@/components/custom-components/EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { BarChart2, LineChart as LineChartIcon, ScatterChart as ScatterChartIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = {
  gradient: {
    start: "#4F46E5", // Indigo
    end: "#7C3AED", // Violet
  },
  axis: "#94a3b8",
};

const chartTypes = [
  { id: "bar", label: "Bar Chart", icon: BarChart2 },
  { id: "line", label: "Line Chart", icon: LineChartIcon },
  { id: "scatter", label: "Scatter Chart", icon: ScatterChartIcon },
];

function ChartTypeSelector({ type, onTypeChange }) {
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

export function CustomChart({ 
  data, 
  loading, 
  title = "Chart", 
  icon, 
  dataKey = "value", 
  nameKey = "name", 
  valuePrefix = "₱", 
  valueLabel = "Value",
  nameLabel = "Name",
  height = 400,
  initialChartType = "bar",
  showChartSelector = true
}) {
  const [chartType, setChartType] = useState(initialChartType);
  const Icon = icon;

  if (loading) {
    return (
      <Card className="border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {showChartSelector && <ChartTypeSelector type={chartType} onTypeChange={setChartType} />}
            {icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {showChartSelector && <ChartTypeSelector type={chartType} onTypeChange={setChartType} />}
            {icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={icon}
            message={`No ${title.toLowerCase()} data available`}
          />
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 20, right: 20, bottom: 20, left: 60 },
    };

    const customTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        return (
          <div className="rounded-lg border bg-background p-3 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="text-[0.70rem] uppercase text-muted-foreground">
                  {nameLabel}
                </span>
                <span className="font-bold text-muted-foreground">
                  {payload[0].payload[nameKey]}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[0.70rem] uppercase text-muted-foreground">
                  {valueLabel}
                </span>
                <span className="font-bold text-muted-foreground">
                  {valuePrefix}{payload[0].value.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        );
      }
      return null;
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <XAxis
              dataKey={nameKey}
              stroke={COLORS.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: COLORS.axis }}
            />
            <YAxis
              stroke={COLORS.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${valuePrefix}${value}`}
              tick={{ fill: COLORS.axis }}
            />
            <Tooltip content={customTooltip} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={{ fill: COLORS.gradient.end, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: COLORS.gradient.start }}
            />
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor={COLORS.gradient.start} stopOpacity={1}/>
                <stop offset="95%" stopColor={COLORS.gradient.end} stopOpacity={1}/>
              </linearGradient>
            </defs>
          </LineChart>
        );

      case "scatter":
        return (
          <ScatterChart {...commonProps}>
            <XAxis
              dataKey={nameKey}
              stroke={COLORS.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: COLORS.axis }}
            />
            <YAxis
              stroke={COLORS.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${valuePrefix}${value}`}
              tick={{ fill: COLORS.axis }}
            />
            <Tooltip content={customTooltip} />
            <Scatter
              dataKey={dataKey}
              fill="url(#scatterGradient)"
              shape="circle"
            />
            <defs>
              <linearGradient id="scatterGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.gradient.start} stopOpacity={1}/>
                <stop offset="95%" stopColor={COLORS.gradient.end} stopOpacity={1}/>
              </linearGradient>
            </defs>
          </ScatterChart>
        );

      default:
        return (
          <BarChart {...commonProps}>
            <XAxis
              dataKey={nameKey}
              stroke={COLORS.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: COLORS.axis }}
            />
            <YAxis
              stroke={COLORS.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${valuePrefix}${value}`}
              tick={{ fill: COLORS.axis }}
            />
            <Tooltip content={customTooltip} />
            <Bar
              dataKey={dataKey}
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.gradient.start} stopOpacity={1}/>
                <stop offset="95%" stopColor={COLORS.gradient.end} stopOpacity={1}/>
              </linearGradient>
            </defs>
          </BarChart>
        );
    }
  };

  return (
    <Card className="border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {showChartSelector && <ChartTypeSelector type={chartType} onTypeChange={setChartType} />}
          {icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 