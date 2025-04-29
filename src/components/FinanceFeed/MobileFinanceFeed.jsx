// MobileFinanceFeed.jsx
import React, { useState, useContext } from 'react';
import { Typography, Card, Space, List, Badge, Tag, Avatar, Button } from 'antd'; 
import {
  IconAlertOctagon,
  IconClipboardList,
  IconRepeatOff,
  IconHourglassHigh,
  IconTimeDuration15,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconClock,
  IconCar,
  IconHome,
  IconDeviceLaptop,
  IconWifi,
  IconDroplet,
  IconCreditCard,
  IconShoppingBag,
  IconHelp, 
  IconCalendar,
  IconCurrencyDollar,
  IconCertificate, 
  IconMedicineSyrup, 
  IconScissors,
  IconCalendarTime,
  IconUser
} from '@tabler/icons-react';

import { FinanceContext } from '../../contexts/FinanceContext';
import './styles/MobileFinanceFeed.css';

const { Text, Title } = Typography;

// Helper function to get icon based on category
const getCategoryIcon = (category, size = 16) => {
  const lowerCategory = category?.toLowerCase() || '';

  if (lowerCategory.includes('car') || lowerCategory.includes('auto')) 
    return <IconCar size={size} style={{ color: '#FF9233' }} />;
  if (lowerCategory.includes('home') || lowerCategory.includes('rent')) 
    return <IconHome size={size} style={{ color: '#F1476F' }} />;
  if (lowerCategory.includes('internet') || lowerCategory.includes('wifi')) 
    return <IconWifi size={size} style={{ color: '#0066FF' }} />;
  if (lowerCategory.includes('water')) 
    return <IconDroplet size={size} style={{ color: '#26C67B' }} />;
  if (lowerCategory.includes('gas')) 
    return <IconDroplet size={size} style={{ color: '#FF9233' }} />;
  if (lowerCategory.includes('subscription') || lowerCategory.includes('chatgpt')) 
    return <IconDeviceLaptop size={size} style={{ color: '#0066FF' }} />;
  if (lowerCategory.includes('medical')) 
    return <IconClipboardList size={size} style={{ color: '#F1476F' }} />;
  if (lowerCategory.includes('clothing')) 
    return <IconShoppingBag size={size} style={{ color: '#0066FF' }} />;
  if (lowerCategory.includes('passport') || lowerCategory.includes('photos')) 
    return <IconCreditCard size={size} style={{ color: '#26C67B' }} />;
  return <IconCreditCard size={size} style={{ color: '#0066FF' }} />;
};

const MobileFinanceFeed = () => {
  const financeContext = useContext(FinanceContext);

  // Get the data we need for each section
  // Past Due Bills
  const pastDueBills = financeContext.pastDueBills || [];

  // Bill Prep items
  const billPrepItems = financeContext.bills?.filter(bill => 
    bill.category?.toLowerCase() === 'bill prep' && !bill.isPaid
  ) || [];

  // Group Bill Prep items by name
  const groupedBillPrepItems = billPrepItems.reduce((acc, bill) => {
    const name = bill.name;
    if (!acc[name]) {
      acc[name] = {
        id: `group-${name}-${bill.category}`,
        name: name,
        category: bill.category,
        totalAmount: 0,
        bills: [],
        isCombined: false,
      };
    }
    acc[name].totalAmount += Number(bill.amount || 0);
    acc[name].bills.push(bill);
    acc[name].isCombined = acc[name].bills.length > 1;
    return acc;
  }, {});
  const billPrep = Object.values(groupedBillPrepItems);

  // Non-Recurring Bills
  const nonRecurring = financeContext.bills?.filter(bill => !bill.isRecurring) || [];

  // Upcoming Bills (unpaid bills with future due dates)
  const today = new Date();
  const upcoming = financeContext.bills?.filter(bill => 
    !bill.isPaid && new Date(bill.dueDate) >= today
  ) || [];

  // Recent Activity (paid bills, ordered by payment date)
  const recentActivity = financeContext.bills?.filter(bill => 
    bill.isPaid
  ).sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)).slice(0, 10) || [];

  // Calculate totals for each section
  const pastDueTotal = pastDueBills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  const billPrepTotal = billPrep.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const nonRecurringTotal = nonRecurring.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  const upcomingTotal = upcoming.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  const recentActivityTotal = recentActivity.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);

  // State to track expanded/collapsed sections
  const [expanded, setExpanded] = useState({
    pastDue: true,
    billPrep: true,
    nonRecurring: true, 
    upcoming: true,
    recentActivity: true
  });

  // State for "show all" toggles
  const [showAll, setShowAll] = useState({
    nonRecurring: false,
    recentActivity: false
  });

  // Toggle expansion state for a section
  const toggleSection = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Toggle show all for a section
  const toggleShowAll = (section) => {
    setShowAll(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper to limit items based on showAll state
  const limitItems = (items, section, limit = 3) => {
    return showAll[section] ? items : items.slice(0, limit);
  };

  // Calculate how many days ago a date was
  const daysAgo = (dateString) => {
    const date = new Date(dateString);
    const diffTime = Math.abs(today - date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Format due date text for upcoming bills
  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Section card component with improved collapse button
  const SectionCard = ({ title, icon, children, section, empty = false, count, itemCount, emptyText }) => (
    <Card
      className="finance-section-card"
      bodyStyle={expanded[section] ? { padding: 0 } : { padding: 0, height: 0, overflow: 'hidden' }}
      title={
        <div className="section-header">
          <div className="section-title-container">
            <div className="section-icon-container">
              {icon}
            </div>
            <div>
              <Text className="section-title">{title}</Text>
              {count && (
                <Badge
                  count={count}
                  showZero={false}
                  style={{ 
                    backgroundColor: empty ? '#e0e0e0' : '#0066FF',
                    marginLeft: 8,
                    fontSize: '0.7rem',
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    color: '#fff',
                    fontWeight: 'bold',
                    lineHeight: '18px'
                  }}
                />
              )}
              {itemCount && (
                <Text type="secondary" className="section-subtitle">
                  ({itemCount})
                </Text>
              )}
            </div>
          </div>
          <Button 
            type="default"
            className="section-toggle-button"
            icon={expanded[section] ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            onClick={() => toggleSection(section)}
            style={{ 
              width: '32px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              backgroundColor: 'var(--neutral-50)',
              border: '1px solid var(--neutral-200)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          />
        </div>
      }
    >
      {empty && expanded[section] ? (
        <div className="empty-section">
          <Text type="secondary">{emptyText || 'No items to display'}</Text>
        </div>
      ) : (
        children
      )}
    </Card>
  );

  return (
    <div className="finance-feed-mobile">
      <Title level={4} style={{ marginBottom: 16 }}>Finance Feed</Title>

      {/* Past Due Payments */}
      <SectionCard
        title="Past Due Payments"
        icon={<IconAlertOctagon size={18} style={{ color: '#F1476F' }} />}
        section="pastDue"
        empty={pastDueBills.length === 0}
        emptyText="No past due payments"
        count={pastDueBills.length}
      >
        <List
          dataSource={pastDueBills}
          renderItem={item => (
            <List.Item className="feed-list-item">
              <Avatar 
                shape="circle" 
                className="feed-item-avatar"
                style={{ backgroundColor: '#FFF5F5', borderRadius: 30 }}
                icon={getCategoryIcon(item.category, 18)}
              />
              <div className="feed-item-content">
                <Text className="feed-item-title">{item.name}</Text>
                <Text type="danger" className="due-date-text">
                  Due {daysAgo(item.dueDate)} days ago
                </Text>
              </div>
              <Text strong style={{color: '#F1476F'}}>${Number(item.amount).toFixed(2)}</Text>
            </List.Item>
          )}
        />
        {pastDueBills.length > 0 && (
          <div className="section-total">
            <Text className="total-label">SECTION TOTAL</Text>
            <Text className="total-amount total-amount-pastdue">
              ${pastDueTotal.toFixed(2)}
            </Text>
          </div>
        )}
      </SectionCard>

      {/* Bill Prep */}
      <SectionCard
        title="Bill Prep"
        icon={<IconClipboardList size={18} style={{ color: '#0066FF' }} />}
        section="billPrep"
        empty={billPrep.length === 0}
        emptyText="No bills in preparation"
        count={billPrep.length}
      >
        <List
          dataSource={billPrep}
          renderItem={item => (
            <List.Item className="feed-list-item">
              <Avatar 
                shape="circle" 
                className="feed-item-avatar"
                style={{ backgroundColor: '#EBF5FF', borderRadius: 30 }}
                icon={getCategoryIcon(item.category, 18)}
              />
              <div className="feed-item-content">
                <Text className="feed-item-title">{item.name}</Text>
                <Text type="secondary" className="feed-item-subtitle">
                  {item.bills.length} {item.bills.length === 1 ? 'Item' : 'Items'}
                </Text>
              </div>
              <Text strong style={{color: '#1890FF'}}>${item.totalAmount.toFixed(2)}</Text>
            </List.Item>
          )}
        />
        {billPrep.length > 0 && (
          <div className="section-total">
            <Text className="total-label">SECTION TOTAL</Text>
            <Text className="total-amount total-amount-billprep">
              ${billPrepTotal.toFixed(2)}
            </Text>
          </div>
        )}
      </SectionCard>

      {/* Non-Recurring Bills */}
      <SectionCard
        title="Non-Recurring Bills"
        icon={<IconRepeatOff size={18} style={{ color: '#26C67B' }} />}
        section="nonRecurring"
        empty={nonRecurring.length === 0}
        emptyText="No non-recurring bills"
        count={nonRecurring.length}
      >
        <List
          dataSource={limitItems(nonRecurring, 'nonRecurring')}
          renderItem={item => (
            <List.Item className="feed-list-item">
              <Avatar 
                shape="circle" 
                className="feed-item-avatar"
                style={{ backgroundColor: '#E5F8EF', borderRadius: 30 }}
                icon={getCategoryIcon(item.category, 18)}
              />
              <div className="feed-item-content">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text className="feed-item-title">{item.name}</Text>
                  <Text strong style={{ color: item.isPaid ? '#26C67B' : '#F1476F' }}>
                    ${Number(item.amount).toFixed(2)}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <Text type="secondary" className="due-date-text">
                    {daysAgo(item.dueDate)} days ago
                  </Text>
                  {item.isPaid && (
                    <Tag className="status-tag status-tag-paid">
                      Paid
                    </Tag>
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
        {nonRecurring.length > 3 && (
          <div className="show-more-container">
            <Button 
              type="link" 
              className="show-more-button"
              style={{color: '#52C41A'}}
              onClick={() => toggleShowAll('nonRecurring')}
            >
              {showAll.nonRecurring ? 'Show Less' : 'Show All'}
            </Button>
          </div>
        )}
        {nonRecurring.length > 0 && (
          <div className="section-total">
            <Text className="total-label">SECTION TOTAL</Text>
            <Text className="total-amount total-amount-nonrecurring">
              ${nonRecurringTotal.toFixed(2)}
            </Text>
          </div>
        )}
      </SectionCard>

      {/* Upcoming Bills */}
      <SectionCard
        title="Upcoming Bills"
        icon={<IconHourglassHigh size={18} style={{ color: '#0066FF' }} />}
        section="upcoming"
        empty={upcoming.length === 0}
        emptyText="No upcoming bills"
        count={upcoming.length}
      >
        <List
          dataSource={upcoming}
          renderItem={item => (
            <List.Item className="feed-list-item">
              <Avatar 
                shape="circle" 
                className="feed-item-avatar"
                style={{ backgroundColor: '#EBF5FF', borderRadius: 30 }}
                icon={getCategoryIcon(item.category, 18)}
              />
              <div className="feed-item-content">
                <Text className="feed-item-title">{item.name}</Text>
                <Text type="secondary" className="feed-item-subtitle">
                  Due {formatDueDate(item.dueDate)}
                </Text>
              </div>
              <Text strong style={{color: '#0066FF'}}>${Number(item.amount).toFixed(2)}</Text>
            </List.Item>
          )}
        />
        {upcoming.length > 0 && (
          <div className="section-total">
            <Text className="total-label">SECTION TOTAL</Text>
            <Text className="total-amount total-amount-upcoming">
              ${upcomingTotal.toFixed(2)}
            </Text>
          </div>
        )}
      </SectionCard>

      {/* Recent Activity */}
      <SectionCard
        title="Recent Activity"
        icon={<IconTimeDuration15 size={18} style={{ color: '#0066FF' }} />}
        section="recentActivity"
        empty={recentActivity.length === 0}
        emptyText="No recent activity"
        count={recentActivity.length}
      >
        <List
          dataSource={limitItems(recentActivity, 'recentActivity')}
          renderItem={item => (
            <List.Item className="feed-list-item">
              <Space direction="vertical" size={0} style={{ width: '100%' }}>
                <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space align="center">
                    <Avatar 
                      shape="circle" 
                      className="feed-item-avatar"
                      style={{ backgroundColor: 'rgba(114, 46, 209, 0.1)' }}
                      icon={<IconCircleCheck size={16} style={{ color: '#722ED1' }} />}
                    />
                    <Text strong>{item.name}</Text>
                  </Space>
                  <Space direction="vertical" align="end" size={0}>
                    <Text strong>${Number(item.amount).toFixed(2)}</Text>
                    <Text type="secondary" style={{ fontSize: '0.7rem' }}>{item.category}</Text>
                  </Space>
                </Space>
                <div style={{ paddingLeft: 48 }}>
                  <Text type="secondary" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                    <IconClock size={10} style={{ marginRight: 4 }} />
                    {daysAgo(item.dueDate)} days ago
                  </Text>
                </div>
              </Space>
            </List.Item>
          )}
        />
        {recentActivity.length > 3 && (
          <div className="show-more-container">
            <Button 
              type="link" 
              className="show-more-button"
              style={{color: '#722ED1'}}
              onClick={() => toggleShowAll('recentActivity')}
            >
              {showAll.recentActivity ? 'Show Less' : 'Show All'}
            </Button>
          </div>
        )}
        {recentActivity.length > 0 && (
          <div className="section-total">
            <Text className="total-label">SECTION TOTAL</Text>
            <Text className="total-amount total-amount-activity">
              ${recentActivityTotal.toFixed(2)}
            </Text>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default MobileFinanceFeed;