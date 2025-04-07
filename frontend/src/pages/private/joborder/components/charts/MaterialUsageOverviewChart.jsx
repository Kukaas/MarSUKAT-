import { Package } from "lucide-react";
import { CustomChart } from "@/components/custom-components/CustomChart";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CustomSelect from "@/components/custom-components/CustomSelect";
import { cn } from "@/lib/utils";
import MultiLineChart from "../../../../../components/custom-components/MultiLineChart";

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

export default function MaterialUsageOverviewChart({ data, loading, selectedMaterial }) {
  const [availableUnits, setAvailableUnits] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [combinedChartData, setCombinedChartData] = useState([]);
  const [materialLabel, setMaterialLabel] = useState("All Materials");
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [showAllMaterials, setShowAllMaterials] = useState(true);
  const [materialColors, setMaterialColors] = useState({});

  useEffect(() => {
    if (!data) {
      // Just show loading state, don't reset everything
      return;
    }

    // Initialize data structure if monthlyData is missing or empty
    const monthlyData = data.monthlyData || [];
    
    if (monthlyData.length === 0) {
      // If no monthly data, set empty states
      setAvailableUnits([]);
      setChartData([]);
      setCombinedChartData([]);
      setAvailableMaterials([]);
      return;
    }

    console.log("Processing material data:", monthlyData); // Debug log

    // Get the material label from the selected material
    if (selectedMaterial && selectedMaterial !== "all") {
      const parts = selectedMaterial.split('-');
      if (parts.length >= 2) {
        setMaterialLabel(`${parts[0]} - ${parts[1]}`);
      } else {
        setMaterialLabel(selectedMaterial);
      }
      setShowAllMaterials(false);
    } else {
      setMaterialLabel("All Materials");
      setShowAllMaterials(true);
    }

    // Extract all available materials and their units
    const uniqueMaterials = new Map();
    const uniqueUnits = new Set();
    const materialsByUnit = {};

    // First pass: identify all unique materials and units
    monthlyData.forEach(monthData => {
      if (!monthData.materials) return; // Skip if no materials
      
      monthData.materials.forEach(material => {
        // Skip invalid materials
        if (!material || !material.category || !material.type) return;
        
        const materialKey = `${material.category}-${material.type}`;
        
        if (material.unit) {
          uniqueUnits.add(material.unit);
          
          if (!materialsByUnit[material.unit]) {
            materialsByUnit[material.unit] = new Set();
          }
          
          materialsByUnit[material.unit].add(materialKey);
          
          if (!uniqueMaterials.has(materialKey)) {
            uniqueMaterials.set(materialKey, {
              category: material.category,
              type: material.type,
              unit: material.unit,
              total: 0
            });
          }
        }
      });
    });
    
    // If no materials found, set empty states
    if (uniqueMaterials.size === 0) {
      setAvailableUnits([]);
      setChartData({});
      setAvailableMaterials([]);
      setCombinedChartData([]);
      return;
    }
    
    // Create empty dataset structure for each material
    const processedData = {};
    const materialList = [];
    
    // Process each material and prepare data for charting
    uniqueMaterials.forEach((material, materialKey) => {
      processedData[materialKey] = {};
      
      // Initialize all months with zero values
      MONTHS.forEach((month, index) => {
        const monthNumber = index + 1;
        processedData[materialKey][monthNumber] = {
          name: month,
          month: monthNumber,
          quantity: 0,
          unit: material.unit,
          materialKey: materialKey,
          materialName: `${material.category} - ${material.type}`
        };
      });
      
      // Add material to list
      materialList.push({
        key: materialKey,
        name: `${material.category} - ${material.type}`,
        unit: material.unit,
        total: 0
      });
    });
    
    // Create a single "All Materials" entry for primary unit if showing all
    if (uniqueUnits.size > 0) {
      // Try to find the most common unit
      const primaryUnit = Array.from(uniqueUnits)[0];
      
      const allMaterialsKey = 'all-materials';
      processedData[allMaterialsKey] = {};
      
      MONTHS.forEach((month, index) => {
        const monthNumber = index + 1;
        processedData[allMaterialsKey][monthNumber] = {
          name: month,
          month: monthNumber,
          quantity: 0,
          unit: primaryUnit,
          materialKey: allMaterialsKey,
          materialName: 'All Materials'
        };
      });
      
      materialList.push({
        key: allMaterialsKey,
        name: 'All Materials',
        unit: primaryUnit,
        total: 0
      });
    }

    // Fill with actual data
    monthlyData.forEach(monthData => {
      if (!monthData || !monthData.month || !monthData.materials) return;
      
      const monthIndex = parseInt(monthData.month);
      if (isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12) return;
      
      monthData.materials.forEach(material => {
        if (!material || !material.unit || !material.category || !material.type) return;
        
        const materialKey = `${material.category}-${material.type}`;
        
        // Calculate total quantity used
        const totalUsed = parseFloat(material.quantity) || 0;
        
        // Update specific material data
        if (processedData[materialKey] && processedData[materialKey][monthIndex]) {
          processedData[materialKey][monthIndex].quantity += totalUsed;
          
          // Update total for this material in the list
          const materialItem = materialList.find(m => m.key === materialKey);
          if (materialItem) {
            materialItem.total += totalUsed;
          }
        }
        
        // Always update the "All Materials" entry
        const allMaterialsKey = 'all-materials';
        if (processedData[allMaterialsKey] && processedData[allMaterialsKey][monthIndex]) {
          processedData[allMaterialsKey][monthIndex].quantity += totalUsed;
          
          // Update total for the All Materials entry
          const allMaterialsItem = materialList.find(m => m.key === allMaterialsKey);
          if (allMaterialsItem) {
            allMaterialsItem.total += totalUsed;
          }
        }
      });
    });

    // Convert nested objects to arrays for charting
    const formattedChartData = {};
    
    // Format the chart data
    Object.keys(processedData).forEach(materialKey => {
      // Convert month data to array and sort by month
      const materialMonthData = Object.values(processedData[materialKey])
        .sort((a, b) => a.month - b.month);
      
      formattedChartData[materialKey] = materialMonthData;
    });
    
    // Update material list with formatted totals
    materialList.forEach(material => {
      material.total = material.total.toFixed(2);
    });

    // Create combined chart data for multi-line view
    // Get all real materials (excluding the "all-materials" entry)
    const realMaterials = materialList.filter(m => m.key !== 'all-materials');
    
    // Create a combined dataset that has one entry per month
    // with a property for each material's quantity
    const combined = [];
    
    // Initialize with all months
    MONTHS.forEach((month, index) => {
      combined.push({
        name: month,
        month: index + 1,
      });
    });
    
    // Add each material's data to the appropriate month
    realMaterials.forEach((material, materialIndex) => {
      const materialKey = material.key;
      const materialData = formattedChartData[materialKey];
      
      if (materialData) {
        materialData.forEach(monthData => {
          const monthIndex = monthData.month - 1;
          if (monthIndex >= 0 && monthIndex < 12 && combined[monthIndex]) {
            // Use the material key to store this material's data
            combined[monthIndex][materialKey] = monthData.quantity;
            // Also store the material name for reference
            combined[monthIndex][`${materialKey}_name`] = material.name;
            combined[monthIndex][`${materialKey}_unit`] = material.unit;
          }
        });
      }
    });
    
    setCombinedChartData(combined);
    
    // Assign colors to materials
    setMaterialColors(
      realMaterials.reduce((colors, material, index) => {
        colors[material.key] = index;
        return colors;
      }, {})
    );

    // Set states
    setAvailableUnits(Array.from(uniqueUnits));
    setChartData(formattedChartData);
    
    // Sort the material list to put All Materials first
    const sortedMaterials = materialList.sort((a, b) => {
      if (a.key === 'all-materials') return -1;
      if (b.key === 'all-materials') return 1;
      // Alphabetical sort by name for the rest
      return a.name.localeCompare(b.name);
    });
    
    setAvailableMaterials(sortedMaterials);
  }, [data, selectedMaterial]);

  // Select a material to display in the chart
  const [selectedChartMaterial, setSelectedChartMaterial] = useState("all-materials");
  
  // When available materials change, default to "all" or the only available material
  useEffect(() => {
    if (availableMaterials.length === 0) {
      setSelectedChartMaterial("all-materials");
    } else if (availableMaterials.length === 1) {
      setSelectedChartMaterial(availableMaterials[0].key);
    } else {
      // Always try to find the "All Materials" entry first
      const allMaterialsEntry = availableMaterials.find(m => m.key === 'all-materials');
      if (allMaterialsEntry) {
        setSelectedChartMaterial(allMaterialsEntry.key);
      } else if (selectedMaterial && selectedMaterial !== "all") {
        // Try to match selected material
        const matchingMaterial = availableMaterials.find(m => m.key === selectedMaterial);
        if (matchingMaterial) {
          setSelectedChartMaterial(selectedMaterial);
        } else {
          setSelectedChartMaterial(availableMaterials[0].key);
        }
      } else {
        setSelectedChartMaterial(availableMaterials[0].key);
      }
    }
  }, [availableMaterials, selectedMaterial]);

  // Handle empty or loading state
  if (loading) {
    return (
      <CustomChart
        data={[]}
        loading={true}
        subtitle="Loading material usage data..."
        icon={Package}
        emptyMessage="Loading data..."
        initialChartType="line"
      />
    );
  }

  if (!data || !data.monthlyData || data.monthlyData.length === 0 || availableMaterials.length === 0) {
    return (
      <CustomChart
        data={[]}
        loading={false}
        subtitle={materialLabel !== "All Materials" ? `Tracking: ${materialLabel}` : undefined}
        icon={Package}
        emptyMessage="No material usage data available for the selected period"
        initialChartType="line"
      />
    );
  }

  // Prepare select options for materials
  const materialOptions = availableMaterials.map(material => {
    // For specific materials, show just the type and unit
    let label;
    
    if (material.key === 'all-materials') {
      label = "All Materials";
    } else {
      // Extract material type without category
      const parts = material.name.split(' - ');
      if (parts.length > 1) {
        label = parts[1]; // Just the material type
      } else {
        label = material.name;
      }
    }
    
    return {
      value: material.key,
      label: label
    };
  });
  
  // Get the current chart data to display
  const getCurrentChartData = () => {
    if (!chartData[selectedChartMaterial]) {
      // Fall back to the first available material
      const firstMaterial = Object.keys(chartData)[0];
      return chartData[firstMaterial] || [];
    }
    
    return chartData[selectedChartMaterial];
  };
  
  // Get current chart title and unit
  const getCurrentInfo = () => {
    const selectedMaterialInfo = availableMaterials.find(m => m.key === selectedChartMaterial);
    
    if (!selectedMaterialInfo) {
      return { title: "Material Usage", unit: "" };
    }
    
    return { 
      title: `Material Usage: ${selectedMaterialInfo.name}`,
      unit: selectedMaterialInfo.unit
    };
  };
  
  const { title, unit } = getCurrentInfo();
  const currentData = getCurrentChartData();
  
  // Extract real materials for multi-line chart
  const realMaterials = availableMaterials.filter(m => m.key !== 'all-materials');

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Material Usage Overview
          </CardTitle>
          
          <div className="w-full md:w-64">
            <CustomSelect
              value={selectedChartMaterial}
              onChange={setSelectedChartMaterial}
              options={materialOptions}
              placeholder="Select Material"
              icon={Package}
              showSearch={materialOptions.length > 5}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {selectedChartMaterial === 'all-materials' && combinedChartData.length > 0 ? (
          <MultiLineChart
            data={combinedChartData}
            materials={realMaterials}
            loading={loading}
            materialColors={materialColors}
          />
        ) : (
          <CustomChart
            data={currentData}
            loading={loading}
            dataKey="quantity"
            nameKey="name"
            valuePrefix=""
            valueLabel={unit}
            nameLabel="Month"
            initialChartType="line"
            hideHeader={true}
            icon={Package}
          />
        )}
      </CardContent>
    </Card>
  );
} 