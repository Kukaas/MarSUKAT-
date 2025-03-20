import { Package } from "lucide-react";
import { CustomChart } from "@/components/custom-components/CustomChart";

export function ProductTypeSalesChart({ data, loading }) {
  return (
    <CustomChart
      data={data}
      loading={loading}
      title="Sales by Product Type"
      icon={Package}
      dataKey="totalSales"
      nameKey="name"
      valuePrefix="₱"
      valueLabel="Sales"
      nameLabel="Product Type"
      initialChartType="bar"
    />
  );
}