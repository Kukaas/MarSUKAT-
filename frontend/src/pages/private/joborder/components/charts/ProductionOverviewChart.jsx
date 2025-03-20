import { TrendingUp } from "lucide-react";
import { CustomChart } from "@/components/custom-components/CustomChart";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function ProductionOverviewChart({ data, loading }) {
  // Transform the data to the format expected by the CustomChart
  const chartData = data?.monthlyData?.map((item) => ({
    name: MONTHS[item.month - 1],
    quantity: item.quantity,
  })) || [];

  return (
    <CustomChart
      data={chartData}
      loading={loading}
      title="Production Overview"
      icon={TrendingUp}
      dataKey="quantity"
      nameKey="name"
      valuePrefix=""
      valueLabel="Units"
      nameLabel="Month"
      initialChartType="line"
    />
  );
} 