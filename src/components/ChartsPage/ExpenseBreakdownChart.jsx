import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { theme } from 'antd'; // Import AntD theme

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
    <div style={{ height: '300px' }}> {/* Container needs height */}
      <ResponsivePie
        data={chartData} // Use filtered data
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5} // Makes it a donut chart
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
        // Use AntD colors if desired - requires mapping categories to colors
        // colors={{ scheme: 'blues' }} // Example Nivo scheme
        // Cycle through AntD palette - ensure enough colors or use a Nivo scheme
        colors={{ scheme: 'blues' }} // Using a default Nivo scheme for simplicity here
        // If using AntD tokens, ensure you handle cases where there are more categories than colors:
        // colors={chartData.map((_, i) => [token.colorPrimary, token.colorSuccess, token.colorWarning, token.colorError, token.colorInfo][i % 5])}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={token.colorText}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
        theme={{
           // Basic theme adjustments to match AntD feel
           fontSize: 12,
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
                    fill: token.colorTextSecondary, // Match legend text color
                }
            }
        }}
        defs={[ /* Optional: gradients/patterns */ ]}
        fill={[ /* Optional: specific fill rules */ ]}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: token.colorText, // Use AntD text color
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: token.colorPrimary, // Highlight on hover
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
};

// --- Only ONE Default Export for the Component ---
export default ExpenseBreakdownChart;

// --- Named Export for the Helper Function ---
export { processBreakdownData };