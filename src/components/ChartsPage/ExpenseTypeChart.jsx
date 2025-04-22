import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { theme } from 'antd';

// Helper to process bills data
const processExpenseTypeData = (bills = []) => {
  const typeTotals = bills.reduce((acc, bill) => {
    // Optional: Only count paid bills? Depends on desired insight
    // if (!bill.isPaid) return acc;

    const type = bill.isRecurring ? 'Recurring' : 'One-Time';
    acc[type] = (acc[type] || 0) + bill.amount;
    return acc;
  }, { Recurring: 0, 'One-Time': 0 }); // Initialize keys

  return Object.entries(typeTotals).map(([type, total]) => ({
    id: type,
    label: type,
    value: parseFloat(total.toFixed(2)),
  })).filter(d => d.value > 0); // Filter out types with 0 total
};


const ExpenseTypeChart = ({ data }) => {
  const { token } = theme.useToken();

   if (!data || data.length === 0) {
    return <div>No expense data for this period.</div>;
  }

  return (
    // Reuse styling similar to ExpenseBreakdownChart, maybe use Pie instead of Donut
     <div style={{ height: '300px' }}>
       <ResponsivePie
        data={data}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        // innerRadius={0} // Makes it a Pie chart
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
        // colors={{ scheme: 'paired' }} // Example Nivo scheme
        colors={[token.colorPrimary, token.colorSuccess]} // Example AntD colors
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={token.colorText}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
        theme={{
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
                    fill: token.colorTextSecondary,
                }
            }
        }}
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
            itemTextColor: token.colorText,
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: 'circle',
            effects: [ { on: 'hover', style: { itemTextColor: token.colorPrimary } } ],
          },
        ]}
      />
     </div>
  );
};

export default ExpenseTypeChart;
export { processExpenseTypeData };