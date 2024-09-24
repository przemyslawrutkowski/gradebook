import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'Sep', Presence: 20, All: 30 },
  { name: 'Oct', Presence: 30, All: 50 },
  { name: 'Nov', Presence: 15, All: 25 },
  { name: 'Dec', Presence: 25, All: 40 },
  { name: 'Jan', Presence: 35, All: 50 },
  { name: 'Feb', Presence: 30, All: 45 },
  { name: 'Mar', Presence: 10, All: 20 },
  { name: 'Apr', Presence: 20, All: 35 },
  { name: 'May', Presence: 15, All: 30 },
  { name: 'Jun', Presence: 25, All: 40 }
];

const AttendanceChart = () => {
  return (
    <div style={{ width: '100%', height: 500 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 0,
            left: -26,
            bottom: 5
          }}
        >
          <XAxis dataKey="name" axisLine={false} tickLine={false} dy={16} tick={{ fill: '#9095a1' }} />
          <Tooltip />
          <Legend 
            verticalAlign="top" 
            iconType="circle"
            formatter={(value) => <span style={{ color: 'black', marginRight: '20px' }}>{value}</span>}
          />
          <Bar dataKey="Presence" stackId="a" fill="#ff6384" />
          <Bar dataKey="All" stackId="a" fill="#36a2eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;
