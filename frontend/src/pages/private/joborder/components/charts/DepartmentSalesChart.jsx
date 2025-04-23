import { Building2 } from "lucide-react";
import { CustomChart } from "@/components/custom-components/CustomChart";
import { getDepartmentAcronym } from "@/lib/utils";

export function DepartmentSalesChart({ data, loading }) {
  const formattedData = data?.map(item => ({
    ...item,
    name: getDepartmentAcronym(item.name)
  })) || [];

  return (
    <CustomChart
      data={formattedData}
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