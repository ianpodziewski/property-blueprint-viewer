
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { UnitType } from '@/types/unitMixTypes';

interface UnitTypeDistributionChartProps {
  unitTypes: UnitType[];
}

const UnitTypeDistributionChart: React.FC<UnitTypeDistributionChartProps> = ({ unitTypes }) => {
  const data = useMemo(() => {
    return unitTypes.map(unit => ({
      name: unit.name || 'Unnamed Unit',
      value: parseInt(unit.count) * parseInt(unit.typicalSize) || 0,
      color: unit.color || '#9CA3AF'
    })).filter(item => item.value > 0);
  }, [unitTypes]);

  // Calculate total for percentage in tooltip
  const total = useMemo(() => 
    data.reduce((sum, item) => sum + item.value, 0),
    [data]
  );

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No unit data available</p>
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
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ name, value }) => `${name}: ${Math.round(value).toLocaleString()}`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [
            `${value.toLocaleString()} sq ft (${((value / total) * 100).toFixed(1)}%)`,
            'Area'
          ]}
        />
        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default UnitTypeDistributionChart;
