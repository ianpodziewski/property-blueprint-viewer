
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { UnitType } from "@/types/unitMixTypes";

interface UnitTypeDistributionChartProps {
  unitTypes: UnitType[];
}

// Helper function to get color by category
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'residential': '#3B82F6',
    'office': '#10B981',
    'retail': '#F59E0B',
    'hotel': '#8B5CF6',
    'amenity': '#EC4899',
    'other': '#6B7280'
  };
  
  return colors[category] || '#9CA3AF';
};

const UnitTypeDistributionChart: React.FC<UnitTypeDistributionChartProps> = ({ unitTypes }) => {
  // Process data for the pie chart
  const data = useMemo(() => {
    // Group by category first
    const categoryGroups: Record<string, { name: string, value: number, color: string }> = {};
    
    unitTypes.forEach(unit => {
      const category = unit.category;
      const count = parseInt(unit.count) || 0;
      const size = parseInt(unit.typicalSize) || 0;
      const area = count * size;
      
      if (!categoryGroups[category]) {
        categoryGroups[category] = {
          name: category,
          value: 0,
          color: getCategoryColor(category)
        };
      }
      
      categoryGroups[category].value += area;
    });
    
    return Object.values(categoryGroups).filter(item => item.value > 0);
  }, [unitTypes]);

  // If no data, show placeholder
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">No unit data to display</p>
      </div>
    );
  }

  return (
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
  );
};

export default UnitTypeDistributionChart;
