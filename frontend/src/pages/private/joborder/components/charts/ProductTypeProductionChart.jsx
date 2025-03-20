import { Shirt } from "lucide-react";
import { CustomChart } from "@/components/custom-components/CustomChart";

export function ProductTypeProductionChart({ data, loading }) {
  // Get the data in the correct format
  const chartData = data?.productTypeBreakdown || [];

  return (
    <CustomChart
      data={chartData}
      loading={loading}
      title="Production by Product Type"
      icon={Shirt}
      dataKey="quantity"
      nameKey="name"
      valuePrefix=""
      valueLabel="Units"
      nameLabel="Product Type"
      initialChartType="bar"
    />
  );
} 