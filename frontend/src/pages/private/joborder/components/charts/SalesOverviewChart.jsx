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

export function SalesOverviewChart({ data, loading }) {
  // Transform the data to the format expected by the CustomChart
  const chartData = data?.monthlyData?.map((item) => ({
    name: MONTHS[item.month - 1],
    totalSales: item.totalSales,
  })) || [];

  return (
    <CustomChart
      data={chartData}
      loading={loading}
      title="Sales Overview"
      icon={TrendingUp}
      dataKey="totalSales"
      nameKey="name"
      valuePrefix="₱"
      valueLabel="Sales"
      nameLabel="Month"
      initialChartType="line"
    />
  );
} 