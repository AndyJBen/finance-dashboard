// src/components/RecentActivity/NonRecurringTransactions.jsx
import React, { useContext, useState, useMemo } from 'react';
import { List, Typography, Empty, Space, Avatar, Button } from 'antd';
import {
    IconRepeatOff,
    IconHome,
    IconBolt,
    IconCreditCard,
    IconCar,
    IconShoppingCart,
    IconHelp,
    IconCalendar,
    IconMedicineSyrup,
    IconScissors,
    IconCalendarTime
} from '@tabler/icons-react';
import { FinanceContext } from '../../contexts/FinanceContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';
// Import the existing CardLayout component
import CardLayout from '../shared/CardLayout/CardLayout';
import './NonRecurringTransactions.css';

dayjs.extend(relativeTime);
dayjs.extend(isBetween);

const { Text, Title } = Typography;

const INITIAL_LIMIT = 5;

// Helper function to get category icon
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
    if (lowerCategory.includes('bill prep')) return <IconCalendarTime size={16} />;
    return <IconHelp size={16} />; // Default
};

// Modified to return both background and icon color
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

const NonRecurringTransactions = ({ style }) => {
  const { loading, error, bills, displayedMonth } = useContext(FinanceContext);
  const [showAll, setShowAll] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  // Filter for non-recurring transactions in the current month
  const nonRecurringTransactions = useMemo(() => {
    const validBills = Array.isArray(bills) ? bills : [];
    const startOfMonth = displayedMonth.startOf('month');
    const endOfMonth = displayedMonth.endOf('month');

    return validBills.filter(bill => {
        const dueDate = dayjs(bill.dueDate);
        const isInDisplayedMonth = dueDate.isBetween(startOfMonth, endOfMonth, 'day', '[]');
        const isNonRecurring = !bill.isRecurring;

        return isInDisplayedMonth && isNonRecurring; // Must be in the displayed month AND non-recurring
    }).sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()); // Sort by due date
  }, [bills, displayedMonth]);

  const displayedItems = showAll
      ? nonRecurringTransactions
      : nonRecurringTransactions.slice(0, INITIAL_LIMIT);

  // Custom title component
  const titleComponent = (
    <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
      <IconRepeatOff size={24} style={{ marginRight: 'var(--space-8)', color: 'var(--primary-600)' }} />
      Non-Recurring Bills
    </Title>
  );

  // Use the existing CardLayout component
  return (
    <CardLayout
      title={titleComponent}
      style={style}
      loading={loading}
      isCollapsed={isCollapsed}
      toggleCollapse={toggleCollapse}
      iconColor="var(--primary-600)"
      error={error}
      errorMessage="Error loading non-recurring transactions"
    >
      {nonRecurringTransactions.length === 0 ? (
        <Empty 
          description="No non-recurring bills found for this month" 
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
        <>
          <div style={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            padding: '0',
            width: '100%' // Ensure full width  
          }}>
            <List
              itemLayout="horizontal"
              dataSource={displayedItems}
              style={{ width: '100%' }} // Ensure list takes full width
              renderItem={(item) => {
                const dueDate = dayjs(item.dueDate);
                const today = dayjs();
                
                // Determine status text and color
                let statusText = `Due ${dueDate.format('MMM D')}`;
                let statusColor = 'var(--neutral-600)';
                
                if (dueDate.isSame(today, 'day')) {
                  statusText = "Due Today";
                  statusColor = 'var(--warning-700)';
                } else if (dueDate.isBefore(today, 'day')) {
                  statusText = `${dueDate.fromNow()} (${dueDate.format('MMM D')})`;
                  statusColor = 'var(--danger-500)';
                } else if (dueDate.diff(today, 'day') <= 7) {
                  statusText = `Due ${dueDate.fromNow()}`;
                  statusColor = 'var(--warning-700)';
                }

                const [iconBg, iconColor] = getCategoryColors(item.category);

                return (
                  <List.Item style={{ 
                    padding: '12px 0', 
                    borderBottom: '1px solid var(--neutral-200)',
                    paddingRight: '8px',
                    width: '100%' // Ensure list item takes full width
                  }}>
                    <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space align="center">
                        <Avatar
                          shape="square"
                          size={36}
                          style={{ backgroundColor: iconBg, borderRadius: 'var(--radius-lg)' }}
                          icon={React.cloneElement(getCategoryIcon(item.category), { style: { color: iconColor } })}
                        />
                        <div className="transaction-details">
                          <Text strong style={{ display: 'block', fontSize: '0.875rem' }}>{item.name}</Text>
                          <Text type="secondary" style={{ fontSize: '0.75rem', color: statusColor }}>
                            {statusText}
                          </Text>
                        </div>
                      </Space>
                      <Space direction="vertical" align="end" size={0}>
                        <Text strong style={{ fontSize: '0.875rem', color: item.isPaid ? 'var(--success-700)' : 'var(--neutral-800)', flexShrink: 0 }}>
                          ${Number(item.amount).toFixed(2)}
                        </Text>
                        {item.isPaid && (
                          <Text type="secondary" style={{ fontSize: '0.7rem', color: 'var(--success-700)' }}>
                            Paid
                          </Text>
                        )}
                      </Space>
                    </Space>
                  </List.Item>
                );
              }}
            />
          </div>
          {nonRecurringTransactions.length > INITIAL_LIMIT && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-12)', paddingBottom: 'var(--space-4)' }}>
              <Button
                type="link"
                onClick={() => setShowAll(prev => !prev)}
              >
                {showAll ? 'Show Less' : 'Display All'}
              </Button>
            </div>
          )}
        </>
      )}
    </CardLayout>
  );
};

export default NonRecurringTransactions;