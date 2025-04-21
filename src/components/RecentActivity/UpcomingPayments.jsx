// src/components/RecentActivity/UpcomingPayments.jsx
// COMPLETE FILE CODE
// Updated with Tabler icons and explicit styling to override theme conflicts
// All text color updated to #47586d
// FIX: Filter upcoming payments to only show those within the currently displayed month.
// FIX: Changed card title to simply "Upcoming Bills".

import React, { useContext, useState, useMemo } from 'react';
import { List, Card, Spin, Alert, Typography, Empty, Space, Button, Tooltip } from 'antd';
import {
  IconHourglassHigh,
    IconClock, // Default / Upcoming
    IconHome,  // Rent / Housing
    IconBolt,  // Electricity / Utilities
    IconWifi,  // Internet
    IconCreditCard, // Credit Card
    IconCar,   // Auto / Car
    IconShoppingCart, // Groceries
    IconHelp,  // Other / Default
    IconMedicineSyrup, // Medical
    IconScissors,  // Personal Care
    IconCalendarTime, // Bill Prep
    IconMinus,  // For minimize
    IconChevronDown  // For expand
 } from '@tabler/icons-react';
import { FinanceContext } from '../../contexts/FinanceContext'; // Ensure path is correct
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBetween from 'dayjs/plugin/isBetween'; // Import isBetween plugin

dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween); // Extend dayjs with isBetween

const { Text, Title } = Typography;

// Helper function to get an icon based on category (updated with Tabler icons)
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
    return <IconHelp size={18} />; // Default
};

// Modified to return both background and icon color with more explicit values
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
  // Access displayedMonth from context
  const { loading, error, bills, displayedMonth } = useContext(FinanceContext);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  // Filter and sort upcoming payments for the CURRENT DISPLAYED MONTH
  const upcomingPaymentsInView = useMemo(() => {
    const validBills = Array.isArray(bills) ? bills : [];
    const today = dayjs(); // Get current date for comparison
    const startOfMonth = displayedMonth.startOf('month');
    const endOfMonth = displayedMonth.endOf('month');

    return validBills.filter(bill => {
        const dueDate = dayjs(bill.dueDate);
        const isUpcoming = !bill.isPaid && dueDate.isValid() && dueDate.isSameOrAfter(today, 'day');
        const isInDisplayedMonth = dueDate.isBetween(startOfMonth, endOfMonth, 'day', '[]');

        return isUpcoming && isInDisplayedMonth; // Must be upcoming AND in the displayed month
    }).sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()); // Sort soonest first
  }, [bills, displayedMonth]); // Add displayedMonth to dependency array

  const displayedUpcomingPayments = showAllUpcoming
       ? upcomingPaymentsInView
       : upcomingPaymentsInView.slice(0, INITIAL_UPCOMING_LIMIT);

  if (error && !loading) {
    return <Alert message="Error loading upcoming payments" type="warning" showIcon style={{...style, color: '#47586d'}} />;
  }

  const collapseButton = (
    <Tooltip title={isCollapsed ? 'Expand' : 'Minimize'}>
        <Button
            type="text"
            icon={isCollapsed ? <IconChevronDown size={16} /> : <IconMinus size={16} />}
            onClick={toggleCollapse}
            style={{ color: '#47586d' }}
        />
    </Tooltip>
  );

  return (
    <Spin spinning={loading} size="small">
      <Card
        style={{
          ...style,
          backgroundColor: '#ffffff',
          color: '#47586d',
          boxShadow: '0 2px 4px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)',
          height: '100%' // Keep height 100%
        }}
        title={
            // *** UPDATED TITLE TEXT ***
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', color: '#47586d' }}>
                <IconHourglassHigh size={26} style={{ marginRight: '8px', color: '#0066FF' }} />
                Upcoming Bills {/* Removed month scope and count */}
            </Title>
            // *** END UPDATED TITLE TEXT ***
        }
        extra={collapseButton}
        // Adjust padding if list exists
        styles={{ body: { padding: upcomingPaymentsInView.length > 0 ? '0 20px 16px 20px' : '20px' } }}
      >
        {!isCollapsed && (
            <>
                {upcomingPaymentsInView.length === 0 && !loading ? (
                    <Empty
                        description={<span style={{ color: '#47586d' }}>No upcoming payments for this month</span>}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ padding: '32px 0' }}
                    />
                ) : (
                <>
                    <List
                    itemLayout="horizontal"
                    dataSource={displayedUpcomingPayments}
                    renderItem={(item) => {
                        const dueDate = dayjs(item.dueDate);
                        let dueDateText = `Due ${dueDate.fromNow()}`;
                        if (dueDate.isSame(dayjs(), 'day')) { dueDateText = 'Due Today'; }
                        else if (dueDate.isSame(dayjs().add(1, 'day'), 'day')) { dueDateText = 'Due Tomorrow'; }

                        const categoryIcon = getCategoryIcon(item.category);
                        const [bgColor, iconColor] = getCategoryColors(item.category);

                        return (
                            <List.Item
                                style={{
                                    padding: '12px 0', // Adjusted padding
                                    paddingRight: 0,
                                    borderBottom: '1px solid #EDF1F7'
                                }}
                            >
                                <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <Space align="center">
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            backgroundColor: bgColor,
                                            borderRadius: 8,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid #f0f0f0'
                                        }}>
                                            {React.cloneElement(categoryIcon, {
                                                style: { color: iconColor }
                                            })}
                                        </div>
                                        <div className="payment-details">
                                            <Text strong style={{ display: 'block', fontSize: '0.875rem', color: '#47586d' }}>{item.name}</Text>
                                            <Text type="secondary" style={{ fontSize: '0.75rem', color: '#47586d' }}>{dueDateText}</Text>
                                        </div>
                                    </Space>
                                    <Text strong style={{ fontSize: '0.875rem', color: '#47586d' }}>
                                        ${Number(item.amount).toFixed(2)}
                                    </Text>
                                </Space>
                            </List.Item>
                        );
                    }}
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#47586d',
                    }}
                    />
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
            </>
        )}
      </Card>
    </Spin>
  );
};

export default UpcomingPayments;
