// src/components/SpendingTrendsChart/SpendingTrendsChart.jsx

import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { theme } from 'antd';

// A static fallback color for the placeholder
const defaultPlaceholderData = [
  {
    id: 'Spending',
    color: '#1890ff',
    data: [
      { x: 'Jan', y: 1250 },
      { x: 'Feb', y: 1400 },
      { x: 'Mar', y: 1150 },
      { x: 'Apr', y: 1550 },
      { x: 'May', y: 1300 },
      // ...more months if you like
    ],
  },
];

const SpendingTrendsChart = ({ data = defaultPlaceholderData }) => {
  // ⚠️ Only call the hook here, inside the component body
  const { token } = theme.useToken();

  // If no real data, we’ll use our static fallback but swap in the theme color
  const chartData = (data && data.length > 0)
    ? data
    : defaultPlaceholderData.map(series => ({
        ...series,
        color: token.colorPrimary,
      }));

  if (!chartData[0]?.data?.length) {
    return <div>Not enough historical data to display trends.</div>;
  }

  return (
    <div style={{ height: '300px' }}>
      <ResponsiveLine
        data={chartData}
        margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: false,
          reverse: false,
        }}
        yFormat=" >-$.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Month',
          legendOffset: 36,
          legendPosition: 'middle',
          format: value => value,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Total Spent',
          legendOffset: -50,
          legendPosition: 'middle',
          format: value => `$${value}`,
        }}
        colors={{ datum: 'color' }}  /* picks up the color field in each series */
        lineWidth={3}
        pointSize={8}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
        theme={{
          fontSize: 12,
          textColor: token.colorTextSecondary,
          axis: {
            ticks: { text: { fill: token.colorTextSecondary } },
            legend: { text: { fill: token.colorText } },
          },
          grid: {
            line: { stroke: token.colorBorderSecondary, strokeDasharray: '3 3' },
          },
          tooltip: {
            container: {
              background: token.colorBgElevated,
              color: token.colorText,
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadowSecondary,
            },
          },
        }}
      />
    </div>
  );
};

export default SpendingTrendsChart;
