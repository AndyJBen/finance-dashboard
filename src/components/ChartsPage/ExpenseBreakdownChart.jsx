import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { theme } from 'antd'; // Import AntD theme

// Google style color palette for the pie chart
const googleColors = [
  '#4285F4',
  '#DB4437',
  '#F4B400',
  '#0F9D58',
  '#AB47BC',
  '#00ACC1',
  '#FF7043',
  '#9E9D24',
  '#5C6BC0',
  '#EC407A',
];

// Helper to process bills data (assuming it's passed as a prop)
const processBreakdownData = (bills = []) => {
  const categoryTotals = bills.reduce((acc, bill) => {
    // Optional: Only count paid bills for actual spending
    // if (!bill.isPaid) return acc;

    const category = bill.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + bill.amount;
    return acc;
  }, {});

  // Ensure the result is an array of objects with numeric values
  return Object.entries(categoryTotals).map(([category, total]) => ({
    id: category,
    label: category,
    // Ensure value is a number, handle potential non-numeric results defensively
    value: !isNaN(parseFloat(total)) ? parseFloat(total.toFixed(2)) : 0,
  }));
};


const ExpenseBreakdownChart = ({ data }) => { // Expects processed data
  const { token } = theme.useToken(); // Access AntD theme tokens

  // Defensive check: Ensure data is an array and has items with valid numeric values
  const chartData = Array.isArray(data)
    ? data.filter(item => typeof item.value === 'number' && !isNaN(item.value))
    : [];

  if (chartData.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>No valid expense data for this period.</div>;
  }

  return (
    <div style={{ height: '300px' }}>
      <ResponsivePie
        data={chartData}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
        colors={googleColors}
        valueFormat={v => `$${Number(v).toLocaleString('en-US')}`}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={token.colorText}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLinkLabel={d => `${d.id}: $${Number(d.value).toLocaleString('en-US')}`}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
        theme={{
          fontSize: 14,
          textColor: token.colorTextSecondary,
          tooltip: {
            container: {
              background: token.colorBgElevated,
              color: token.colorText,
              fontSize: '12px',
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadowSecondary,
            },
          },
          legends: {
            text: {
              fill: token.colorTextSecondary,
            },
          },
        }}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: token.colorText,
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: token.colorPrimary,
                },
              },
            ],
          },
        ]}
        tooltip={({ datum }) => (
          <div
            style={{
              padding: '6px 9px',
              background: token.colorBgElevated,
              color: token.colorText,
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadowSecondary,
            }}
          >
            <strong>{datum.id}</strong>: ${Number(datum.value).toLocaleString('en-US')}
          </div>
        )}
      />
    </div>
  );
};

// --- Only ONE Default Export for the Component ---
export default ExpenseBreakdownChart;

// --- Named Export for the Helper Function ---
export { processBreakdownData };
