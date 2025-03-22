import { Shirt } from "lucide-react";
import { CustomChart } from "@/components/custom-components/CustomChart";

export function ProductTypeProductionChart({ data, loading }) {
  // Transform the data to show production by product type and size
  const chartData = data?.productTypeSizeBreakdown || [];

  return (
    <CustomChart
      data={chartData}
      loading={loading}
      title="Production by Product Type and Size"
      icon={Shirt}
      dataKey="quantity"
      nameKey="name"
      valuePrefix=""
      valueLabel="Units"
      nameLabel="Product Type-Size"
      initialChartType="bar"
    />
  );
} 