import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from "recharts";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Match the color scheme from CustomChart
const COLORS = {
  gradient: {
    start: "#4F46E5", // Indigo
    end: "#7C3AED", // Violet
  },
  axis: "#94a3b8",
};

// Array of material-specific colors
const MATERIAL_COLORS = [
  "#4F46E5", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", 
  "#00C49F", "#FFBB28", "#FF8042", "#7C3AED", "#d0ed57",
  "#8dd1e1", "#83a6ed", "#8884d8", "#a4de6c", "#d0ed57"
];

const chartTypes = [
  { id: "line", label: "Line Chart", icon: LineChartIcon },
  { id: "bar", label: "Bar Chart", icon: BarChart2 },
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

export default function MultiLineChart({ 
  data, 
  materials, 
  loading, 
  materialColors,
  title = "",
  height = 400,
  icon = Package,
  showChartSelector = true
}) {
  const [chartType, setChartType] = useState("line");
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

  if (!data || data.length === 0 || materials.length === 0) {
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
          <EmptyState icon={icon} message="No material usage data available" />
        </CardContent>
      </Card>
    );
  }
  
  // Custom tooltip that matches CustomChart style
  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Month
              </span>
              <span className="font-bold text-muted-foreground">
                {payload[0].payload.name}
              </span>
            </div>
          </div>
          <div className="mt-2 space-y-1.5">
            {payload.map((entry, index) => {
              const material = materials.find(m => m.key === entry.dataKey);
              if (!material || entry.value === 0) return null;
              
              return (
                <div key={index} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="h-2.5 w-2.5 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground">{material?.name}</span>
                  </div>
                  <span className="text-xs font-medium">{entry.value.toFixed(2)} {material?.unit}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  const legendFormatter = (value, entry) => {
    const material = materials.find(m => m.key === entry.dataKey);
    return (
      <span className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <div 
          className="h-2 w-2 rounded-full" 
          style={{ backgroundColor: entry.color }}
        />
        {material?.name || value}
      </span>
    );
  };
  
  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 20, right: 25, bottom: 20, left: 0 },
    };
    
    // Get data elements based on chart type
    const getDataElements = () => {
      return materials.map((material, index) => {
        const color = MATERIAL_COLORS[index % MATERIAL_COLORS.length];
        
        switch (chartType) {
          case "line":
            return (
              <Line
                key={material.key}
                type="monotone"
                dataKey={material.key}
                name={material.name}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: color }}
              />
            );
          case "bar":
            return (
              <Bar
                key={material.key}
                dataKey={material.key}
                name={material.name}
                fill={color}
                radius={[4, 4, 0, 0]}
              />
            );
          case "scatter":
            return (
              <Scatter
                key={material.key}
                dataKey={material.key}
                name={material.name}
                fill={color}
                shape="circle"
              />
            );
          default:
            return (
              <Line
                key={material.key}
                type="monotone"
                dataKey={material.key}
                name={material.name}
                stroke={color}
                strokeWidth={2}
              />
            );
        }
      });
    };
    
    // Create gradient definitions
    const createGradientDefs = () => (
      <defs>
        {materials.map((material, index) => {
          const color = MATERIAL_COLORS[index % MATERIAL_COLORS.length];
          return (
            <linearGradient 
              key={`gradient-${material.key}`} 
              id={`gradient-${material.key}`} 
              x1="0" 
              y1="0" 
              x2="0" 
              y2="1"
            >
              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={color} stopOpacity={0.3}/>
            </linearGradient>
          );
        })}
      </defs>
    );
    
    // Get chart component based on type
    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <XAxis
              dataKey="name"
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
              tick={{ fill: COLORS.axis }}
              width={50}
            />
            <Tooltip content={customTooltip} />
            <Legend 
              formatter={legendFormatter}
              iconType="none"
              wrapperStyle={{ 
                paddingTop: '16px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                justifyContent: 'center'
              }}
              onClick={(e) => {
                // Add hover effect feedback
                const target = e.currentTarget;
                target.style.opacity = target.style.opacity === '0.5' ? '1' : '0.5';
              }}
            />
            {getDataElements()}
            {createGradientDefs()}
          </LineChart>
        );
      case "bar":
        return (
          <BarChart {...commonProps}>
            <XAxis
              dataKey="name"
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
              tick={{ fill: COLORS.axis }}
              width={50}
            />
            <Tooltip content={customTooltip} />
            <Legend 
              formatter={legendFormatter}
              iconType="none"
              wrapperStyle={{ 
                paddingTop: '16px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                justifyContent: 'center'
              }}
              onClick={(e) => {
                // Add hover effect feedback
                const target = e.currentTarget;
                target.style.opacity = target.style.opacity === '0.5' ? '1' : '0.5';
              }}
            />
            {getDataElements()}
            {createGradientDefs()}
          </BarChart>
        );
      case "scatter":
        return (
          <ScatterChart {...commonProps}>
            <XAxis
              dataKey="name"
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
              tick={{ fill: COLORS.axis }}
              width={50}
            />
            <Tooltip content={customTooltip} />
            <Legend 
              formatter={legendFormatter}
              iconType="none"
              wrapperStyle={{ 
                paddingTop: '16px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                justifyContent: 'center'
              }}
              onClick={(e) => {
                // Add hover effect feedback
                const target = e.currentTarget;
                target.style.opacity = target.style.opacity === '0.5' ? '1' : '0.5';
              }}
            />
            {getDataElements()}
            {createGradientDefs()}
          </ScatterChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <XAxis
              dataKey="name"
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
              tick={{ fill: COLORS.axis }}
              width={50}
            />
            <Tooltip content={customTooltip} />
            <Legend 
              formatter={legendFormatter}
              iconType="none"
              wrapperStyle={{ 
                paddingTop: '16px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                justifyContent: 'center'
              }}
              onClick={(e) => {
                // Add hover effect feedback
                const target = e.currentTarget;
                target.style.opacity = target.style.opacity === '0.5' ? '1' : '0.5';
              }}
            />
            {getDataElements()}
            {createGradientDefs()}
          </LineChart>
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