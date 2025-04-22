import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { theme } from 'antd';

// --- PLACEHOLDER DATA ---
// You need a way to define budgets and fetch actual spending per category
const placeholderBudgetData = [
  { category: 'Groceries', budget: 500, actual: 450.75 },
  { category: 'Utilities', budget: 200, actual: 210.50 },
  { category: 'Transport', budget: 150, actual: 135.00 },
  { category: 'Entertainment', budget: 100, actual: 115.80 },
  // ... more categories
];
// --- END PLACEHOLDER ---

// Helper to process actual budget/spending data
// const processBudgetData = (budgets, actuals) => { ... return formatted data ... };

const BudgetComparisonChart = ({ data = placeholderBudgetData }) => {
  const { token } = theme.useToken();

  if (!data || data.length === 0) {
    return <div>No budget data set up.</div>;
  }

  return (
    <div style={{ height: '300px' }}>
      <ResponsiveBar
        data={data}
        keys={['actual', 'budget']} // Order matters for stacking/grouping
        indexBy="category"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        groupMode="grouped" // Show 'actual' and 'budget' side-by-side
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        // colors={{ scheme: 'nivo' }}
         colors={[token.colorPrimary, token.colorFillSecondary]} // AntD colors: Actual vs Budget
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Category',
          legendPosition: 'middle',
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Amount ($)',
          legendPosition: 'middle',
          legendOffset: -50,
          format: (value) => `$${value}`, // Format ticks as currency
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
             itemTextColor: token.colorTextSecondary, // Match legend text color
            effects: [ { on: 'hover', style: { itemOpacity: 1 } } ]
          },
        ]}
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
             legends: {
                 text: {
                    fill: token.colorTextSecondary, // Match legend text color
                }
            }
        }}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
      />
    </div>
  );
};

export default BudgetComparisonChart;
// export { processBudgetData };