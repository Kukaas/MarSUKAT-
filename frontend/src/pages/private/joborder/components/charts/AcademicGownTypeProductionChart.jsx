import { GraduationCap } from "lucide-react";
import { CustomChart } from "@/components/custom-components/CustomChart";

export function AcademicGownTypeProductionChart({ data, loading }) {
  // Transform the data to show production by gown type and size
  const chartData = data?.productTypeSizeBreakdown || [];

  return (
    <CustomChart
      data={chartData}
      loading={loading}
      title="Production by Gown Type and Size"
      icon={GraduationCap}
      dataKey="quantity"
      nameKey="name"
      valuePrefix=""
      valueLabel="Units"
      nameLabel="Gown Type-Size"
      initialChartType="bar"
    />
  );
} 