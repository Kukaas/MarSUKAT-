import { TrendingUp } from "lucide-react";
import { CustomChart } from "@/components/custom-components/CustomChart";

export function MaterialForecastChart({ data, loading }) {
  if (!data || !data.materialUsage || data.materialUsage.length === 0) {
    return (
      <CustomChart
        data={[]}
        loading={loading}
        title="Material Consumption Forecast"
        icon={TrendingUp}
        emptyMessage="No material forecast data available"
        initialChartType="bar"
      />
    );
  }

  // Sort materials by estimated days remaining (ascending)
  const chartData = [...data.materialUsage]
    .filter(material => material.estimatedDaysRemaining > 0)
    .sort((a, b) => a.estimatedDaysRemaining - b.estimatedDaysRemaining)
    .slice(0, 10) // Show only the top 10 materials that need replenishment
    .map(material => ({
      name: `${material.category} - ${material.type}`,
      daysRemaining: material.estimatedDaysRemaining,
      dailyConsumption: material.dailyConsumptionRate,
      currentInventory: material.currentInventory,
      unit: material.unit
    }));

  return (
    <CustomChart
      data={chartData}
      loading={loading}
      title="Material Consumption Forecast"
      subtitle="Days Until Depletion"
      icon={TrendingUp}
      dataKey="daysRemaining"
      nameKey="name"
      valuePrefix=""
      valueLabel="Days"
      nameLabel="Material"
      initialChartType="bar"
      secondaryDataKey="dailyConsumption"
      secondaryDataLabel={`Daily Usage (${chartData[0]?.unit || 'Units'})`}
      allowDownload={true}
    />
  );
} 