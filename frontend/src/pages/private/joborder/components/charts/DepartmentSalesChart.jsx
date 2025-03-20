import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, ScatterChart, Scatter } from "recharts";
import { Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { ChartTypeSelector } from "./ChartTypeSelector";
import EmptyState from "@/components/custom-components/EmptyState";

const COLORS = {
  gradient: {
    start: "#4F46E5", // Indigo
    end: "#7C3AED", // Violet
  },
  axis: "#94a3b8",
};

export function DepartmentSalesChart({ data, loading }) {
  const [chartType, setChartType] = useState("bar");

  if (loading) {
    return (
      <Card className="border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sales by Department</CardTitle>
          <div className="flex items-center gap-2">
            <ChartTypeSelector type={chartType} onTypeChange={setChartType} />
            <Building2 className="h-4 w-4 text-muted-foreground" />
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
          <CardTitle className="text-sm font-medium">Sales by Department</CardTitle>
          <div className="flex items-center gap-2">
            <ChartTypeSelector type={chartType} onTypeChange={setChartType} />
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Building2}
            message="No department sales data available for the selected period"
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
              tickFormatter={(value) => `₱${value}`}
              tick={{ fill: COLORS.axis }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Department
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[0].name}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Sales
                          </span>
                          <span className="font-bold text-muted-foreground">
                            ₱{payload[0].value.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="totalSales"
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
              tickFormatter={(value) => `₱${value}`}
              tick={{ fill: COLORS.axis }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Department
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[0].name}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Sales
                          </span>
                          <span className="font-bold text-muted-foreground">
                            ₱{payload[0].value.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter
              dataKey="totalSales"
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
              tickFormatter={(value) => `₱${value}`}
              tick={{ fill: COLORS.axis }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Department
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[0].name}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Sales
                          </span>
                          <span className="font-bold text-muted-foreground">
                            ₱{payload[0].value.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="totalSales"
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
        <CardTitle className="text-sm font-medium">Sales by Department</CardTitle>
        <div className="flex items-center gap-2">
          <ChartTypeSelector type={chartType} onTypeChange={setChartType} />
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 