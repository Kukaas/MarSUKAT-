import { GraduationCap } from "lucide-react";
import { CustomChart } from "@/components/custom-components/CustomChart";

export function AcademicGownLevelProductionChart({ data, loading }) {
  // Get the data in the correct format
  const chartData = data?.levelBreakdown || [];

  return (
    <CustomChart
      data={chartData}
      loading={loading}
      title="Production by Academic Level"
      icon={GraduationCap}
      dataKey="quantity"
      nameKey="name"
      valuePrefix=""
      valueLabel="Units"
      nameLabel="Academic Level"
      initialChartType="bar"
    />
  );
} 