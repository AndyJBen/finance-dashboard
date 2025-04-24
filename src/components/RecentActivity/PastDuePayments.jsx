// src/components/RecentActivity/PastDuePayments.jsx
// Updated to use CardLayout as per Step 4

import React, { useContext, useState, useMemo } from 'react';
import { List, Alert, Typography, Empty, Space, Avatar, Button } from 'antd'; // Removed Card, Spin, Tooltip
import {
    IconAlertOctagonFilled,
    IconHome, IconBolt, IconCreditCard, IconCar, IconShoppingCart, IconHelp,
    IconCalendar, IconMedicineSyrup, IconScissors, IconCalendarTime,
    // IconMinus, IconChevronDown are now handled by CardLayout
 } from '@tabler/icons-react';
import CardLayout from '../shared/CardLayout'; // 🟩 Added import
import { FinanceContext } from '../../contexts/FinanceContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);

const { Text, Title } = Typography; // 🟩 Ensure Title is imported

const INITIAL_PAST_DUE_LIMIT = 5;

// Helper function getCategoryIcon remains the same
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
    return <IconHelp size={16} />;
};


const PastDuePayments = ({ style }) => {
  const { loading, error, bills } = useContext(FinanceContext);
  const [showAllPastDue, setShowAllPastDue] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  // Filter and sort logic remains the same
  const pastDuePaymentsInView = useMemo(() => {
      const validBills = Array.isArray(bills) ? bills : [];
      return validBills.filter(bill => {
          const dueDate = dayjs(bill.dueDate);
          const isPastDue = !bill.isPaid && dueDate.isValid() && dueDate.isBefore(dayjs(), 'day');
          const isNotBillPrep = bill.category?.toLowerCase() !== 'bill prep';
          return isPastDue && isNotBillPrep;
      }).sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf());
  }, [bills]);

  const displayedPastDuePayments = showAllPastDue
       ? pastDuePaymentsInView
       : pastDuePaymentsInView.slice(0, INITIAL_PAST_DUE_LIMIT);

  // 🟩 Custom title component
  const titleComponent = (
      <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          <IconAlertOctagonFilled size={24} style={{ marginRight: 'var(--space-8)', color: 'var(--danger-500)' }} />
          Past Due Payments
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
      errorMessage="Error loading past due payments" // Custom error message
      iconColor="var(--danger-500)" // Match title icon color
    >
      {/* Children passed to CardLayout */}
      {pastDuePaymentsInView.length === 0 ? (
          <Empty
            description="No past due payments"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{
              padding: 'var(--space-32) 0',
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
              dataSource={displayedPastDuePayments}
              style={{ width: '100%' }} // Ensure List takes full width
              renderItem={(item) => {
                  // Render logic for list item remains the same
                  const dueDate = dayjs(item.dueDate);
                  const daysOverdue = dayjs().diff(dueDate, 'day');
                  let dueDateText = `Due ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} ago`;
                  if (daysOverdue === 0) { dueDateText = "Due Today (Overdue)"; }
                  else if (daysOverdue < 0) { dueDateText = "Due Date Error"; }

                  const iconBg = 'var(--danger-50)';
                  const iconColor = 'var(--danger-500)';

                  return (
                      <List.Item style={{
                        padding: '12px 0', // Adjusted padding slightly
                        borderBottom: '1px solid var(--neutral-200)',
                         width: '100%' // Ensure list item takes full width
                      }}>
                          {/* Using Space for layout within the item */}
                          <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Space align="center">
                                  <Avatar
                                      shape="square"
                                      size={36}
                                      style={{ backgroundColor: iconBg, borderRadius: 'var(--radius-lg)' }}
                                      icon={React.cloneElement(getCategoryIcon(item.category), { style: { color: iconColor } })}
                                  />
                                  <div className="payment-details">
                                      <Text strong style={{ display: 'block', fontSize: '0.875rem' }}>{item.name}</Text>
                                      <Text type="secondary" style={{ fontSize: '0.75rem', color: 'var(--danger-500)' }}>
                                          {dueDateText}
                                      </Text>
                                  </div>
                              </Space>
                              <Text strong style={{ fontSize: '0.875rem', color: 'var(--danger-700)', flexShrink: 0 }}>
                                  ${Number(item.amount).toFixed(2)}
                              </Text>
                          </Space>
                      </List.Item>
                  );
              }}
            />
          </div>
          {/* "Display All" button logic remains */}
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
        </>
      )}
    </CardLayout>
  );
};

export default PastDuePayments;
