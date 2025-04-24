// src/components/RecentActivity/UpcomingPayments.jsx
// Updated to use CardLayout as per Step 4

import React, { useContext, useState, useMemo } from 'react';
import { List, Alert, Typography, Empty, Space, Button } from 'antd'; // Removed Card, Spin, Tooltip
import {
  IconHourglassHigh,
  IconClock, IconHome, IconBolt, IconWifi, IconCreditCard, IconCar,
  IconShoppingCart, IconHelp, IconMedicineSyrup, IconScissors, IconCalendarTime,
  // IconMinus, IconChevronDown are now handled by CardLayout
 } from '@tabler/icons-react';
import CardLayout from '../shared/CardLayout'; // 🟩 Added import
import { FinanceContext } from '../../contexts/FinanceContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

const { Text, Title } = Typography; // 🟩 Ensure Title is imported

// Helper functions (getCategoryIcon, getCategoryColors) remain the same
const getCategoryIcon = (category) => {
    const lowerCategory = category?.toLowerCase() || '';
    if (lowerCategory.includes('rent') || lowerCategory.includes('mortgage')) return <IconHome size={18} />;
    if (lowerCategory.includes('electric') || lowerCategory.includes('utilit')) return <IconBolt size={18} />;
    if (lowerCategory.includes('card')) return <IconCreditCard size={18} />;
    if (lowerCategory.includes('auto') || lowerCategory.includes('car')) return <IconCar size={18} />;
    if (lowerCategory.includes('insurance')) return <IconCar size={18} />;
    if (lowerCategory.includes('grocery')) return <IconShoppingCart size={18} />;
    if (lowerCategory.includes('subscription')) return <IconClock size={18} />;
    if (lowerCategory.includes('medical')) return <IconMedicineSyrup size={18} />;
    if (lowerCategory.includes('personal care')) return <IconScissors size={18} />;
    if (lowerCategory.includes('bill prep')) return <IconCalendarTime size={18} />;
    return <IconHelp size={18} />;
};
const getCategoryColors = (category) => {
    const lowerCategory = category?.toLowerCase() || '';
    if (lowerCategory.includes('rent') || lowerCategory.includes('mortgage')) return ['#FFF5E5', '#E06500'];
    if (lowerCategory.includes('electric') || lowerCategory.includes('utilit')) return ['#EBF5FF', '#0066FF'];
    if (lowerCategory.includes('card')) return ['#fff1f0', '#cf1322'];
    if (lowerCategory.includes('auto') || lowerCategory.includes('car')) return ['#fff7e6', '#fa8c16'];
    if (lowerCategory.includes('insurance')) return ['#fff0f6', '#eb2f96'];
    if (lowerCategory.includes('grocery')) return ['#E5F8EF', '#26C67B'];
    if (lowerCategory.includes('subscription')) return ['#e6fffb', '#13c2c2'];
    if (lowerCategory.includes('medical')) return ['#FEEBEF', '#F1476F'];
    if (lowerCategory.includes('personal care')) return ['#f9f0ff', '#722ed1'];
    if (lowerCategory.includes('bill prep')) return ['#f0f5ff', '#2f54eb'];
    return ['#f5f5f5', '#47586d'];
};

const INITIAL_UPCOMING_LIMIT = 5;

const UpcomingPayments = ({ style }) => {
  const { loading, error, bills, displayedMonth } = useContext(FinanceContext);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  // Filter and sort logic remains the same
  const upcomingPaymentsInView = useMemo(() => {
    const validBills = Array.isArray(bills) ? bills : [];
    const today = dayjs();
    const startOfMonth = displayedMonth.startOf('month');
    const endOfMonth = displayedMonth.endOf('month');

    return validBills.filter(bill => {
        const dueDate = dayjs(bill.dueDate);
        const isUpcoming = !bill.isPaid && dueDate.isValid() && dueDate.isSameOrAfter(today, 'day');
        const isInDisplayedMonth = dueDate.isBetween(startOfMonth, endOfMonth, 'day', '[]');
        return isUpcoming && isInDisplayedMonth;
    }).sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf());
  }, [bills, displayedMonth]);

  const displayedUpcomingPayments = showAllUpcoming
       ? upcomingPaymentsInView
       : upcomingPaymentsInView.slice(0, INITIAL_UPCOMING_LIMIT);

  // 🟩 Custom title component
  const titleComponent = (
      <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', color: '#47586d' }}>
          <IconHourglassHigh size={26} style={{ marginRight: '8px', color: '#0066FF' }} />
          Upcoming Bills
      </Title>
  );

  // 🟥 Removed original return with Card/Spin
  // 🟩 Replace the return statement with CardLayout
  return (
    <CardLayout
      title={titleComponent}
      style={style} // Pass style prop
      loading={loading}
      isCollapsed={isCollapsed}
      toggleCollapse={toggleCollapse}
      error={error} // Pass error state
      errorMessage="Error loading upcoming payments" // Custom error message
      iconColor="#0066FF" // Match title icon color
    >
      {/* Children passed to CardLayout */}
      {upcomingPaymentsInView.length === 0 ? (
          <Empty
              description={<span style={{ color: '#47586d' }}>No upcoming payments for this month</span>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{
                padding: '32px 0',
                margin: 'auto', // Center Empty component
                flexGrow: 1, // Allow Empty to take available space
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
          />
      ) : (
        <>
          {/* Container for the list, allowing scroll */}
          <div style={{ flexGrow: 1, overflowY: 'auto', width: '100%', padding: '8px 0 8px 0' }}>
            <List
              itemLayout="horizontal"
              dataSource={displayedUpcomingPayments}
              style={{ width: '100%', backgroundColor: '#ffffff', color: '#47586d' }} // Ensure List takes full width
              renderItem={(item) => {
                  // Render logic for list item remains the same
                  const dueDate = dayjs(item.dueDate);
                  let dueDateText = `Due ${dueDate.fromNow()}`;
                  if (dueDate.isSame(dayjs(), 'day')) { dueDateText = 'Due Today'; }
                  else if (dueDate.isSame(dayjs().add(1, 'day'), 'day')) { dueDateText = 'Due Tomorrow'; }

                  const categoryIcon = getCategoryIcon(item.category);
                  const [bgColor, iconColor] = getCategoryColors(item.category);

                  return (
                      <List.Item
                          style={{
                              padding: '12px 0', // Adjusted padding slightly
                              borderBottom: '1px solid #EDF1F7',
                              width: '100%' // Ensure list item takes full width
                          }}
                      >
                          {/* Using Space for layout within the item */}
                          <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Space align="center">
                                  <div style={{
                                      width: 40, height: 40, backgroundColor: bgColor,
                                      borderRadius: 8, display: 'flex', alignItems: 'center',
                                      justifyContent: 'center', border: '1px solid #f0f0f0'
                                  }}>
                                      {React.cloneElement(categoryIcon, { style: { color: iconColor } })}
                                  </div>
                                  <div className="payment-details">
                                      <Text strong style={{ display: 'block', fontSize: '0.875rem', color: '#47586d' }}>{item.name}</Text>
                                      <Text type="secondary" style={{ fontSize: '0.75rem', color: '#47586d' }}>{dueDateText}</Text>
                                  </div>
                              </Space>
                              <Text strong style={{ fontSize: '0.875rem', color: '#47586d', flexShrink: 0 }}>
                                  ${Number(item.amount).toFixed(2)}
                              </Text>
                          </Space>
                      </List.Item>
                  );
              }}
            />
          </div>
          {/* "Display All" button logic remains */}
          {upcomingPaymentsInView.length > INITIAL_UPCOMING_LIMIT && (
              <div style={{ textAlign: 'center', marginTop: 'var(--space-12)', paddingBottom: 'var(--space-4)' }}>
                  <Button
                      type="link"
                      onClick={() => setShowAllUpcoming(prev => !prev)}
                      style={{ color: '#0066FF' }}
                  >
                      <span style={{ color: '#0066FF' }}>{showAllUpcoming ? 'Show Less' : 'Display All'}</span>
                  </Button>
              </div>
          )}
        </>
      )}
    </CardLayout>
  );
};

export default UpcomingPayments;
