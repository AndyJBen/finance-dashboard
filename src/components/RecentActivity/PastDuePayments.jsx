// src/components/RecentActivity/PastDuePayments.jsx
// COMPLETE FILE CODE WITH FIXES

import React, { useContext, useState, useMemo } from 'react';
import { List, Card, Spin, Alert, Typography, Empty, Space, Avatar, Button, Tooltip } from 'antd';
import {
    IconAlertOctagonFilled,
    IconAlertTriangle,
    IconHome,
    IconBolt,
    IconCreditCard,
    IconCar,
    IconShoppingCart,
    IconHelp,
    IconCalendar,
    IconMedicineSyrup,
    IconScissors,
    IconCalendarTime,
    IconMinus,
    IconChevronDown
 } from '@tabler/icons-react';
import { FinanceContext } from '../../contexts/FinanceContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);

const { Text, Title } = Typography;

const INITIAL_PAST_DUE_LIMIT = 5;

// Helper function to get category icon (updated with Tabler icons)
const getCategoryIcon = (category) => {
    const lowerCategory = category?.toLowerCase() || '';
    if (lowerCategory.includes('rent') || lowerCategory.includes('mortgage')) return <IconHome size={16} />;
    if (lowerCategory.includes('electric') || lowerCategory.includes('utilit')) return <IconBolt size={16} />;
    if (lowerCategory.includes('card')) return <IconCreditCard size={16} />;
    if (lowerCategory.includes('auto') || lowerCategory.includes('car') || lowerCategory.includes('insurance')) return <IconCar size={16} />;
    if (lowerCategory.includes('grocery')) return <IconShoppingCart size={16} />;
    if (lowerCategory.includes('subscription')) return <IconCalendar size={16} />;
    if (lowerCategory.includes('medical')) return <IconMedicineSyrup size={16} />;
    if (lowerCategory.includes('personal care')) return <IconScissors size={16} />;
    return <IconHelp size={16} />; // Default
};


const PastDuePayments = ({ style }) => {
  const { loading, error, bills } = useContext(FinanceContext);
  const [showAllPastDue, setShowAllPastDue] = useState(false);
  // State for collapse - default to expanded (false)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Toggle function
  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  // Filter and sort past due payments (Updated Filter)
  const pastDuePaymentsInView = useMemo(() => {
      const validBills = Array.isArray(bills) ? bills : [];
      return validBills.filter(bill => {
          const dueDate = dayjs(bill.dueDate);
          const isPastDue = !bill.isPaid && dueDate.isValid() && dueDate.isBefore(dayjs(), 'day');
          // *** ADDED Condition: Exclude 'Bill Prep' category (case-insensitive) ***
          const isNotBillPrep = bill.category?.toLowerCase() !== 'bill prep';

          return isPastDue && isNotBillPrep; // Must be past due AND not 'Bill Prep'
      }).sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()); // Sort oldest first
  }, [bills]); // Recalculate when bills change

  const displayedPastDuePayments = showAllPastDue
       ? pastDuePaymentsInView
       : pastDuePaymentsInView.slice(0, INITIAL_PAST_DUE_LIMIT);

  if (error && !loading) {
    return <Alert message="Error loading past due payments" type="warning" showIcon style={style} />;
  }

  // Collapse button using text style with Tabler icons
  const collapseButton = (
    <Tooltip title={isCollapsed ? 'Expand' : 'Minimize'}>
        <Button
            type="text"
            icon={isCollapsed ? <IconChevronDown size={16} /> : <IconMinus size={16} />}
            onClick={toggleCollapse}
            style={{ color: 'var(--neutral-600)' }} // Explicit color
        />
    </Tooltip>
  );

  return (
    <Spin spinning={loading} size="small">
      <Card
        // Set explicit height and min-height for consistency
        style={{ 
          ...style, 
          height: '100%',
          minHeight: '350px', // FIX: Set minimum height
          display: 'flex',
          flexDirection: 'column'
        }}
        bodyStyle={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: isCollapsed ? '16px' : pastDuePaymentsInView.length > 0 ? '0 16px 16px 16px' : '16px'
        }}
        title={
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <IconAlertOctagonFilled size={24} style={{ marginRight: 'var(--space-8)', color: 'var(--danger-500)' }} />
                Past Due Payments
            </Title>
        }
        extra={collapseButton}
      >
        {!isCollapsed && (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {pastDuePaymentsInView.length === 0 && !loading ? (
                    <Empty 
                      description="No past due payments" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE} 
                      style={{ 
                        padding: 'var(--space-32) 0',
                        margin: 'auto',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}
                    />
                ) : (
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                    <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px 0 8px 0' }}>
                      <List
                      itemLayout="horizontal"
                      dataSource={displayedPastDuePayments}
                      renderItem={(item) => {
                          const dueDate = dayjs(item.dueDate);
                          const daysOverdue = dayjs().diff(dueDate, 'day');
                          let dueDateText = `Due ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} ago`;
                          // Handle edge case where diff might be 0 if checked exactly at midnight
                          if (daysOverdue === 0) { dueDateText = "Due Today (Overdue)"; }
                          else if (daysOverdue < 0) { dueDateText = "Due Date Error"; } // Should not happen with filter

                          const iconBg = 'var(--danger-50)'; // Lighter red background
                          const iconColor = 'var(--danger-500)'; // Red icon color

                          return (
                              <List.Item style={{ 
                                padding: '12px 0', 
                                borderBottom: '1px solid var(--neutral-200)',
                                paddingRight: '8px' // FIX: Add right padding
                              }}>
                                  <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                      <Space align="center">
                                          <Avatar
                                              shape="square"
                                              size={36}
                                              style={{ backgroundColor: iconBg, borderRadius: 'var(--radius-lg)' }}
                                              // Use category icon but styled for past due
                                              icon={React.cloneElement(getCategoryIcon(item.category), { style: { color: iconColor } })}
                                          />
                                          <div className="payment-details">
                                              <Text strong style={{ display: 'block', fontSize: '0.875rem' }}>{item.name}</Text>
                                              <Text type="secondary" style={{ fontSize: '0.75rem', color: 'var(--danger-500)' }}>
                                                  {dueDateText}
                                              </Text>
                                          </div>
                                      </Space>
                                      <Text strong style={{ fontSize: '0.875rem', color: 'var(--danger-700)', flexShrink: 0 }}> {/* FIX: Add flexShrink */}
                                          ${Number(item.amount).toFixed(2)}
                                      </Text>
                                  </Space>
                              </List.Item>
                          );
                      }}
                      />
                    </div>
                    {pastDuePaymentsInView.length > INITIAL_PAST_DUE_LIMIT && (
                        <div style={{ textAlign: 'center', marginTop: 'var(--space-12)', paddingBottom: 'var(--space-4)' }}>
                            <Button
                                type="link"
                                onClick={() => setShowAllPastDue(prev => !prev)}
                            >
                                {showAllPastDue ? 'Show Less' : 'Display All'}
                            </Button>
                        </div>
                    )}
                </div>
                )}
            </div>
        )}
      </Card>
    </Spin>
  );
};

export default PastDuePayments;