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
  let chartData = data?.monthlyData?.map((item) => {
    // If the month value is a year (4 digits), use it directly
    if (item.month.toString().length === 4) {
      return {
        name: item.month.toString(),
        totalSales: item.totalSales,
        year: item.month // Store the year for sorting
      };
    }
    // Otherwise, use the month name
    return {
      name: MONTHS[item.month - 1],
      totalSales: item.totalSales,
    };
  }) || [];

  // Sort by year in ascending order if we have yearly data
  if (chartData.length > 0 && chartData[0].year) {
    chartData = chartData.sort((a, b) => a.year - b.year);
  }

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
      nameLabel="Period"
      initialChartType="line"
    />
  );
} 