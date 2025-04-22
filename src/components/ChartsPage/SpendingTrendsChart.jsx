import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { theme } from 'antd';

// --- PLACEHOLDER DATA ---
// You'll need to fetch/calculate actual historical spending totals
const placeholderTrendData = [
  {
    id: 'Spending',
    // Use AntD primary color for the line
    color: theme.useToken().token.colorPrimary,
    data: [
      { x: 'Jan', y: 1250 },
      { x: 'Feb', y: 1400 },
      { x: 'Mar', y: 1150 },
      { x: 'Apr', y: 1550 },
      { x: 'May', y: 1300 },
      // ... more months
    ],
  },
];
// --- END PLACEHOLDER ---


// Helper (if needed) to process actual historical data
// const processTrendData = (historicalData) => { ... return formatted data ... };

const SpendingTrendsChart = ({ data = placeholderTrendData }) => {
  const { token } = theme.useToken();

  if (!data || data.length === 0 || data[0].data.length === 0) {
    return <div>Not enough historical data to display trends.</div>;
  }

  return (
    <div style={{ height: '300px' }}>
      <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: false, // Set to true if comparing multiple trends (e.g., spending vs income)
          reverse: false,
        }}
        yFormat=" >-$.2f" // Format Y axis as currency
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Month', // Or Week/Day depending on your data granularity
          legendOffset: 36,
          legendPosition: 'middle',
          format: (value) => value, // Keep original labels (e.g., 'Jan')
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Total Spent',
          legendOffset: -50,
          legendPosition: 'middle',
          format: (value) => `$${value}`, // Format ticks as currency
        }}
        colors={{ datum: 'color' }} // Use color defined in data object
        lineWidth={3}
        pointSize={8}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true} // Better tooltip performance
        theme={{ // Match AntD theme elements
           fontSize: 12,
           textColor: token.colorTextSecondary,
           axis: {
                ticks: { text: { fill: token.colorTextSecondary } },
                legend: { text: { fill: token.colorText } },
            },
           grid: { line: { stroke: token.colorBorderSecondary, strokeDasharray: '3 3' } },
           tooltip: {
                container: {
                    background: token.colorBgElevated,
                    color: token.colorText,
                    borderRadius: token.borderRadiusLG,
                    boxShadow: token.boxShadowSecondary,
                },
            },
        }}
        // legends={[ ... ]} // Optional: if you have multiple lines
      />
    </div>
  );
};

export default SpendingTrendsChart;
// export { processTrendData }; // Export if you create a real helper