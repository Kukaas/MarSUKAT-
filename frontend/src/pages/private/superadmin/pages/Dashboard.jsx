import PrivateLayout from "../../PrivateLayout";
import { useAuth } from "../../../../context/AuthContext";
import { useTheme } from "next-themes";
import {
  Users,
  Activity,
  CheckCircle2,
  PieChart as PieChartIcon,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Separator } from "../../../../components/ui/separator";
import SectionHeader from "../../../../components/custom-components/SectionHeader";
import {
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  BarChart,
  PieChart,
  Tooltip,
  Legend,
} from "recharts";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      icon: Users,
      description: "Active system users",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Active Sessions",
      value: "56",
      icon: Activity,
      description: "Current online users",
      trend: "+5.2%",
      trendUp: true,
    },
    {
      title: "Tasks Completed",
      value: "89%",
      icon: CheckCircle2,
      description: "Task completion rate",
      trend: "-2.1%",
      trendUp: false,
    },
    {
      title: "System Usage",
      value: "92%",
      icon: PieChartIcon,
      description: "System utilization",
      trend: "+8.4%",
      trendUp: true,
    },
  ];

  const activityData = [
    { name: "Mon", users: 120, sessions: 85 },
    { name: "Tue", users: 150, sessions: 95 },
    { name: "Wed", users: 180, sessions: 110 },
    { name: "Thu", users: 165, sessions: 100 },
    { name: "Fri", users: 190, sessions: 120 },
    { name: "Sat", users: 140, sessions: 90 },
    { name: "Sun", users: 110, sessions: 75 },
  ];

  const taskData = [
    { name: "Planning", completed: 85 },
    { name: "Development", completed: 92 },
    { name: "Testing", completed: 78 },
    { name: "Deployment", completed: 95 },
  ];

  const resourceData = [
    { name: "CPU", value: 45 },
    { name: "Memory", value: 35 },
    { name: "Storage", value: 20 },
  ];

  // Add color constants for charts
  const chartColors = {
    primary: "hsl(210 100% 70% / 0.9)", // Brighter blue
    secondary: "hsl(280 100% 70% / 0.9)", // Brighter purple
    muted: "hsl(var(--muted))",
    border: "hsl(var(--border) / 0.2)",
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    mutedForeground: "hsl(var(--foreground) / 0.7)",
  };

  // Update theme detection to use theme hook
  const isDarkMode = theme === "dark";

  // Update axis color to use explicit colors
  const axisColor = isDarkMode ? "#FFFFFF" : "#000000";

  const pieChartColors = [
    "hsl(210 100% 70% / 0.9)", // Brighter blue
    "hsl(280 100% 70% / 0.9)", // Brighter purple
    "hsl(150 100% 70% / 0.9)", // Brighter green
  ];

  return (
    <PrivateLayout>
      <div className="min-h-screen">
        <div className="p-6 space-y-12">
          {/* Welcome Section */}
          <div>
            <h1 className="text-2xl font-medium">
              Welcome back,{" "}
              <span className="text-primary font-semibold">{user?.name}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening in your dashboard today
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="p-6 rounded-lg bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-medium">{stat.value}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          stat.trendUp ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {stat.trend}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {stat.description}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div>
            <SectionHeader title="Analytics Overview" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              {/* Activity Trends */}
              <div className="bg-background p-6 rounded-lg">
                <h3 className="text-sm font-medium mb-4">Activity Trends</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={activityData}
                      margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        stroke={chartColors.border}
                        strokeDasharray="4 4"
                      />
                      <XAxis
                        dataKey="name"
                        stroke={axisColor}
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: axisColor }}
                        tick={{ fill: axisColor }}
                        tickMargin={10}
                      />
                      <YAxis
                        stroke={axisColor}
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: axisColor }}
                        tick={{ fill: axisColor }}
                        tickMargin={10}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: chartColors.background,
                          borderColor: chartColors.border,
                          borderRadius: "8px",
                        }}
                        content={({ active, payload }) => {
                          if (!active || !payload) return null;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                {payload.map((item) => (
                                  <div
                                    key={item.name}
                                    className="flex flex-col"
                                  >
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      {item.name}
                                    </span>
                                    <span className="font-bold text-foreground">
                                      {item.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        content={({ payload }) => {
                          if (!payload) return null;
                          return (
                            <div className="flex items-center justify-end gap-4 pb-4">
                              {payload.map((entry) => (
                                <div
                                  key={entry.value}
                                  className="flex items-center gap-2"
                                >
                                  <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {entry.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        name="Users"
                        stroke={chartColors.primary}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{
                          r: 4,
                          strokeWidth: 0,
                          fill: chartColors.primary,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sessions"
                        name="Sessions"
                        stroke={chartColors.secondary}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{
                          r: 4,
                          strokeWidth: 0,
                          fill: chartColors.secondary,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Task Completion */}
              <div className="bg-background p-6 rounded-lg">
                <h3 className="text-sm font-medium mb-4">
                  Task Completion Rates
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={taskData}
                      margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        stroke={chartColors.border}
                        strokeDasharray="4 4"
                      />
                      <XAxis
                        dataKey="name"
                        stroke={axisColor}
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: axisColor }}
                        tick={{ fill: axisColor }}
                        tickMargin={10}
                      />
                      <YAxis
                        stroke={axisColor}
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: axisColor }}
                        tick={{ fill: axisColor }}
                        tickMargin={10}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: chartColors.background,
                          borderColor: chartColors.border,
                          borderRadius: "8px",
                        }}
                        content={({ active, payload }) => {
                          if (!active || !payload) return null;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {payload[0].payload.name}
                                </span>
                                <span className="font-bold text-foreground">
                                  {payload[0].value}%
                                </span>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Bar
                        dataKey="completed"
                        name="Completion Rate"
                        fill={chartColors.primary}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Resource Usage */}
              <div className="bg-background p-6 rounded-lg lg:col-span-2">
                <h3 className="text-sm font-medium mb-4">
                  System Resource Usage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center justify-center">
                    <div className="h-[250px] w-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={resourceData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                          >
                            {resourceData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  pieChartColors[index % pieChartColors.length]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: chartColors.background,
                              borderColor: chartColors.border,
                              borderRadius: "8px",
                            }}
                            content={({ active, payload }) => {
                              if (!active || !payload) return null;
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      {payload[0].name}
                                    </span>
                                    <span className="font-bold text-foreground">
                                      {payload[0].value}%
                                    </span>
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Legend
                            verticalAlign="middle"
                            align="right"
                            layout="vertical"
                            content={({ payload }) => {
                              if (!payload) return null;
                              return (
                                <div className="flex flex-col gap-2">
                                  {payload.map((entry, index) => (
                                    <div
                                      key={entry.value}
                                      className="flex items-center gap-2"
                                    >
                                      <div
                                        className="h-2 w-2 rounded-full"
                                        style={{
                                          backgroundColor:
                                            pieChartColors[
                                              index % pieChartColors.length
                                            ],
                                        }}
                                      />
                                      <span className="text-sm text-muted-foreground">
                                        {entry.value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center space-y-4">
                    {resourceData.map((item, index) => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            {item.name}
                          </span>
                          <span className="text-sm font-medium">
                            {item.value}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${item.value}%`,
                              backgroundColor:
                                pieChartColors[index % pieChartColors.length],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Sections */}
          <div>
            <SectionHeader title="Account Details" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
              {/* Profile Section */}
              <div className="p-6 rounded-lg bg-background">
                <div className="mb-6">
                  <h3 className="text-sm font-medium">Profile Information</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <span className="text-sm bg-primary/5 text-primary px-3 py-1 rounded-full">
                      {user?.role}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Access Level
                    </span>
                    <span className="text-sm">{user?.accessLevel}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm">{user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Activity Section */}
              <div className="md:col-span-2 p-6 rounded-lg bg-background">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-medium">Recent Activity</h3>
                  <Button variant="ghost" size="sm" className="text-xs">
                    View all
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm">New user registration</span>
                      <span className="text-sm text-muted-foreground">
                        2m ago
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm">System update completed</span>
                      <span className="text-sm text-muted-foreground">
                        1h ago
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm">Database backup</span>
                      <span className="text-sm text-muted-foreground">
                        3h ago
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}
