import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AttendanceChart = ({ data }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    handleResize(); 
    window.addEventListener('resize', handleResize); 

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div style={{ width: '100%', height: isMobile ? 300 : 500 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 0,
            left: 0,
            bottom: 8
          }}
          barCategoryGap={isMobile ? 32 : 16}
        >
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            dy={isMobile ? 8 : 16}
            interval={isMobile ? 2 : 0}  
            tick={{ fill: '#9095a1' }} 
          />
          <Tooltip />
          <Legend 
            verticalAlign="top" 
            iconType="circle"
            formatter={(value) => <span style={{ color: 'black', marginRight: '20px' }}>{value}</span>}
          />
          <Bar 
            dataKey="Presence" 
            stackId="a" 
            fill="#1A99EE"
            barSize={64}
            radius={[0,0,0,0]} 
          />
          <Bar 
            dataKey="Absent" 
            stackId="a" 
            fill="#EB4C60"
            barSize={64}
            radius={[4,4,0,0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart; 
