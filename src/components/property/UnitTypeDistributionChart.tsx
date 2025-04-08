
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { UnitType } from "@/types/unitMixTypes";

interface UnitTypeDistributionChartProps {
  unitTypes: UnitType[];
  categoryTotals: Record<string, { units: number, area: number }>;
  categoryColors: Record<string, string>;
}

const UnitTypeDistributionChart: React.FC<UnitTypeDistributionChartProps> = ({ 
  unitTypes, 
  categoryTotals, 
  categoryColors 
}) => {
  // Process data for the pie chart
  const data = useMemo(() => {
    // Group by category
    const categoryData = Object.entries(categoryTotals)
      .map(([category, values]) => ({
        name: category,
        value: values.area,
        color: categoryColors[category] || '#9CA3AF'
      }))
      .filter(item => item.value > 0);
    
    return categoryData;
  }, [categoryTotals, categoryColors]);

  // If no data, show placeholder
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">No unit data to display</p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)} />
          <Tooltip 
            formatter={(value: number) => [`${value.toLocaleString()} sq ft`, 'Area']}
            labelFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UnitTypeDistributionChart;
