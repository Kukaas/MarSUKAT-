import { TrendingUp, GraduationCap } from "lucide-react";
import { CustomChart } from "@/components/custom-components/CustomChart";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CustomSelect from "@/components/custom-components/CustomSelect";
import MultiLineChart from "@/components/custom-components/MultiLineChart";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Array of colors for multiple lines
const CHART_COLORS = [
  "#4F46E5", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", 
  "#00C49F", "#FFBB28", "#FF8042", "#7C3AED", "#d0ed57",
  "#8dd1e1", "#83a6ed", "#8884d8", "#a4de6c", "#d0ed57"
];

export function AcademicGownProductionOverviewChart({ data, loading }) {
  const [chartData, setChartData] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState("all");
  const [productColors, setProductColors] = useState({});

  useEffect(() => {
    if (!data || !data.monthlyData || data.monthlyData.length === 0) {
      setChartData([]);
      setProductTypes([]);
      return;
    }

    // Get all unique product types from the data
    const uniqueProductTypes = new Set();
    data.monthlyData.forEach(month => {
      Object.keys(month.data).forEach(productType => {
        uniqueProductTypes.add(productType);
      });
    });

    // Create product type list with key property matching data keys
    const productTypeList = Array.from(uniqueProductTypes).map(productType => ({
      name: productType,
      key: productType,
      total: data.monthlyData.reduce((sum, month) => sum + (month.data[productType] || 0), 0)
    }));

    // Create chart data
    const processedData = data.monthlyData.map(month => {
      const monthData = {
        name: month.name,
        month: month.month
      };

      // Add data for each product type
      productTypeList.forEach(product => {
        monthData[product.key] = month.data[product.key] || 0;
      });

      return monthData;
    });

    // Set up product colors
    const colors = productTypeList.reduce((acc, product, index) => {
      acc[product.key] = CHART_COLORS[index % CHART_COLORS.length];
      return acc;
    }, {});

    setChartData(processedData);
    setProductTypes(productTypeList);
    setProductColors(colors);
    setSelectedProductType("all");
  }, [data]);

  // Prepare select options for product types
  const productTypeOptions = [
    { value: "all", label: "All Gown Types" },
    ...productTypes.map(product => ({
      value: product.name,
      label: product.name
    }))
  ];

  if (!data || !data.monthlyData || data.monthlyData.length === 0) {
    return (
      <CustomChart
        data={[]}
        loading={loading}
        icon={TrendingUp}
        emptyMessage={loading ? "Loading data..." : "No gown production data available"}
        initialChartType="line"
      />
    );
  }

  // If we have data but no product types, show empty state
  if (productTypes.length === 0) {
    return (
      <CustomChart
        data={[]}
        loading={loading}
        icon={TrendingUp}
        emptyMessage="No gown type data available for the selected period"
        initialChartType="line"
      />
    );
  }

  // Filter product types based on selection
  const displayProductTypes = selectedProductType === "all" 
    ? productTypes 
    : productTypes.filter(product => product.name === selectedProductType);

  // Prepare data for single product type view
  const singleProductData = selectedProductType !== "all" 
    ? chartData.map(month => ({
        name: month.name,
        value: month[selectedProductType] || 0
      }))
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Academic Gown Production Overview
          </CardTitle>
          
          <div className="w-full md:w-64">
            <CustomSelect
              value={selectedProductType}
              onChange={setSelectedProductType}
              options={productTypeOptions}
              placeholder="Select Gown Type"
              icon={GraduationCap}
              showSearch={productTypeOptions.length > 5}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {selectedProductType === "all" ? (
          <MultiLineChart
            data={chartData}
            materials={displayProductTypes}
            loading={loading}
            materialColors={productColors}
          />
        ) : (
          <CustomChart
            data={singleProductData}
            loading={loading}
            icon={TrendingUp}
            title={`Production Overview - ${selectedProductType}`}
            initialChartType="line"
            valueLabel="Quantity"
            valuePrefix=""
          />
        )}
      </CardContent>
    </Card>
  );
} 