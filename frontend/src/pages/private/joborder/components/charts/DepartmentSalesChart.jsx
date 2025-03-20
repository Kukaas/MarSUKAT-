import { Building2 } from "lucide-react";
import { CustomChart } from "@/components/custom-components/CustomChart";

export function DepartmentSalesChart({ data, loading }) {
  return (
    <CustomChart
      data={data}
      loading={loading}
      title="Sales by Department"
      icon={Building2}
      dataKey="totalSales"
      nameKey="name"
      valuePrefix="₱"
      valueLabel="Sales"
      nameLabel="Department"
      initialChartType="bar"
    />
  );
} 