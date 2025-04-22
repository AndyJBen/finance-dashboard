import React from 'react';
import { ResponsiveCalendar } from '@nivo/calendar';
import { theme } from 'antd';
import dayjs from 'dayjs';

// Helper to process bills data
const processTimelineData = (bills = [], year) => {
  return bills
    .filter(bill => dayjs(bill.dueDate).year() === year) // Filter for the target year
    .map(bill => ({
      value: bill.amount,
      day: bill.dueDate, // Nivo Calendar expects 'YYYY-MM-DD'
  }));
};

const BillTimelineChart = ({ data, year }) => { // Expects processed data & year
   const { token } = theme.useToken();

  if (!data || data.length === 0) {
    return <div>No bill data for {year}.</div>;
  }

  return (
    <div style={{ height: '250px' }}> {/* Adjust height as needed */}
      <ResponsiveCalendar
        data={data}
        from={`${year}-01-01`}
        to={`${year}-12-31`}
        emptyColor={token.colorBgLayout} // Use AntD background color for empty days
        // colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']} // Example Nivo scheme
        colors={[ // Example gradient using AntD primary color tints
            token.colorPrimaryBg,
            token.colorPrimaryBorder,
            token.colorPrimaryHover,
            token.colorPrimary,
            token.colorPrimaryActive
        ]}
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        yearSpacing={40}
        monthBorderColor={token.colorBorderSecondary}
        dayBorderWidth={2}
        dayBorderColor={token.colorBgContainer} // Use AntD container background for day borders
        theme={{ // Match AntD theme elements
           fontSize: 12,
           textColor: token.colorTextSecondary,
           tooltip: {
                container: {
                    background: token.colorBgElevated,
                    color: token.colorText,
                    borderRadius: token.borderRadiusLG,
                    boxShadow: token.boxShadowSecondary,
                },
            },
        }}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'row',
            translateY: 36,
            itemCount: 4,
            itemWidth: 42,
            itemHeight: 36,
            itemsSpacing: 14,
            itemDirection: 'right-to-left',
            itemTextColor: token.colorTextSecondary, // Match legend text color
          },
        ]}
      />
    </div>
  );
};

export default BillTimelineChart;
export { processTimelineData };