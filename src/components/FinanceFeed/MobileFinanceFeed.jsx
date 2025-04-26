// src/components/FinanceFeed/MobileFinanceFeed.jsx
import React, { useState, useContext } from 'react';
import { Typography, Card, List, Badge, Tag, Avatar, Button, Space } from 'antd';
import {
  IconAlertOctagonFilled,
  IconClipboardList,
  IconRepeatOff,
  IconHourglassHigh,
  IconTimeDuration15,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheckFilled,
  IconClock,
  IconCarFilled,
  IconHomeFilled,
  IconDeviceLaptopFilled,
  IconWifi,
  IconDropletFilled,
  IconCreditCard,
  IconShoppingBag
} from '@tabler/icons-react';

// Import the FinanceContext
import { FinanceContext } from '../../contexts/FinanceContext';

const { Text, Title } = Typography;

// Helper function to get icon based on category
const getCategoryIcon = (category, size = 16) => {
  const lowerCategory = category?.toLowerCase() || '';
  
  if (lowerCategory.includes('car') || lowerCategory.includes('auto')) 
    return <IconCarFilled size={size} style={{ color: '#FF9233' }} />;
  if (lowerCategory.includes('home') || lowerCategory.includes('rent')) 
    return <IconHomeFilled size={size} style={{ color: '#F1476F' }} />;
  if (lowerCategory.includes('internet') || lowerCategory.includes('wifi')) 
    return <IconWifi size={size} style={{ color: '#0066FF' }} />;
  if (lowerCategory.includes('water')) 
    return <IconDropletFilled size={size} style={{ color: '#26C67B' }} />;
  if (lowerCategory.includes('gas')) 
    return <IconDropletFilled size={size} style={{ color: '#FF9233' }} />;
  if (lowerCategory.includes('subscription') || lowerCategory.includes('chatgpt')) 
    return <IconDeviceLaptopFilled size={size} style={{ color: '#0066FF' }} />;
  if (lowerCategory.includes('medical')) 
    return <IconClipboardList size={size} style={{ color: '#F1476F' }} />;
  if (lowerCategory.includes('clothing')) 
    return <IconShoppingBag size={size} style={{ color: '#0066FF' }} />;
  if (lowerCategory.includes('passport') || lowerCategory.includes('photos')) 
    return <IconCreditCard size={size} style={{ color: '#26C67B' }} />;
  return <IconCreditCard size={size} style={{ color: '#0066FF' }} />;
};

// CSS Styles for Mobile Finance Feed
const styles = {
  container: {
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',
    padding: '12px 12px 80px 12px', // Extra bottom padding for bottom nav
    backgroundColor: 'var(--neutral-100)'
  },
  card: {
    marginBottom: '12px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
    border: '1px solid var(--neutral-200)'
  },
  cardHead: {
    minHeight: 'auto',
    padding: '10px 16px',
    borderBottom: '1px solid var(--neutral-200)'
  },
  titleContainer: {
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 0
  },
  titleLeftSection: {
    display: 'flex', 
    alignItems: 'center'
  },
  titleText: {
    marginLeft: 8, 
    fontSize: '0.95rem'
  },
  badge: {
    marginLeft: 8,
    fontSize: '0.7rem',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: '18px'
  },
  countText: {
    marginLeft: 8, 
    fontSize: '0.75rem'
  },
  toggleButton: {
    padding: 4,
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptySection: {
    padding: 16,
    textAlign: 'center',
    color: 'var(--neutral-500)'
  },
  listItem: {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid var(--neutral-200)'
  },
  avatar: {
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  recentActivityItem: {
    paddingLeft: 24
  },
  actionButton: {
    padding: '4px 12px',
    height: 'auto',
    fontSize: '0.8rem',
    color: 'var(--primary-600)'
  },
  showMoreContainer: {
    textAlign: 'center',
    padding: '8px 0',
    borderTop: '1px solid var(--neutral-200)'
  },
  tag: {
    margin: 0, 
    padding: '0 8px', 
    height: 20, 
    lineHeight: '20px',
    fontSize: '0.7rem',
    fontWeight: 'bold'
  },
  dueDateText: {
    fontSize: '0.75rem'
  },
  itemHeader: {
    display: 'flex', 
    justifyContent: 'space-between'
  },
  pageTitle: {
    marginBottom: 16, 
    fontSize: '1.2rem'
  }
};

const MobileFinanceFeed = ({ onEditBill, onAddBill }) => {
  // Use the FinanceContext to get data
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

  // Section based on card with title and collapsible content
  const SectionCard = ({ title, icon, children, section, empty = false, count, itemCount, emptyText }) => (
    <Card
      style={styles.card}
      bodyStyle={expanded[section] ? { padding: 0 } : { padding: 0, height: 0, overflow: 'hidden' }}
      title={
        <div style={styles.titleContainer}>
          <div style={styles.titleLeftSection}>
            {icon}
            <Text strong style={styles.titleText}>{title}</Text>
            {count && (
              <Badge
                count={count}
                showZero={false}
                style={{ 
                  ...styles.badge,
                  backgroundColor: empty ? '#e0e0e0' : '#0066FF',
                }}
              />
            )}
            {itemCount && (
              <Text type="secondary" style={styles.countText}>
                ({itemCount})
              </Text>
            )}
          </div>
          <Button 
            type="text" 
            size="small"
            style={styles.toggleButton}
            icon={expanded[section] ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
            onClick={() => toggleSection(section)}
          />
        </div>
      }
      headStyle={styles.cardHead}
    >
      {empty && expanded[section] ? (
        <div style={styles.emptySection}>
          <Text type="secondary">{emptyText || 'No items to display'}</Text>
        </div>
      ) : (
        children
      )}
    </Card>
  );

  return (
    <div style={styles.container}>
      <Title level={4} style={styles.pageTitle}>Finance Feed</Title>
      
      {/* Past Due Payments */}
      <SectionCard
        title="Past Due Payments"
        icon={<IconAlertOctagonFilled size={18} style={{ color: '#F1476F' }} />}
        section="pastDue"
        empty={pastDueBills.length === 0}
        emptyText="No past due payments"
        count={pastDueBills.length}
      >
        <List
          dataSource={pastDueBills}
          renderItem={item => (
            <List.Item style={styles.listItem}>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    shape="square" 
                    size={36} 
                    style={{ ...styles.avatar, backgroundColor: '#FFF5F5' }}
                    icon={getCategoryIcon(item.category, 18)}
                  />
                }
                title={<Text strong>{item.name}</Text>}
                description={
                  <Text type="danger" style={styles.dueDateText}>
                    Due {daysAgo(item.dueDate)} days ago
                  </Text>
                }
              />
              <Text strong style={{ color: '#F1476F' }}>${Number(item.amount).toFixed(2)}</Text>
            </List.Item>
          )}
        />
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
            <List.Item style={styles.listItem}>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    shape="square" 
                    size={36} 
                    style={{ ...styles.avatar, backgroundColor: '#EBF5FF' }}
                    icon={getCategoryIcon(item.category, 18)}
                  />
                }
                title={<Text strong>{item.name}</Text>}
                description={
                  <Text type="secondary" style={styles.dueDateText}>
                    {item.bills.length} {item.bills.length === 1 ? 'Item' : 'Items'}
                  </Text>
                }
              />
              <Text strong>${item.totalAmount.toFixed(2)}</Text>
            </List.Item>
          )}
        />
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
            <List.Item style={styles.listItem}>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    shape="square" 
                    size={36} 
                    style={{ ...styles.avatar, backgroundColor: '#E5F8EF' }}
                    icon={getCategoryIcon(item.category, 18)}
                  />
                }
                title={
                  <div style={styles.itemHeader}>
                    <Text strong>{item.name}</Text>
                    <Text strong style={{ color: item.isPaid ? '#26C67B' : '#F1476F' }}>
                      ${Number(item.amount).toFixed(2)}
                    </Text>
                  </div>
                }
                description={
                  <div style={styles.itemHeader}>
                    <Text type="secondary" style={styles.dueDateText}>
                      {daysAgo(item.dueDate)} days ago
                    </Text>
                    {item.isPaid && (
                      <Tag color="success" style={styles.tag}>
                        Paid
                      </Tag>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
        {nonRecurring.length > 3 && (
          <div style={styles.showMoreContainer}>
            <Button 
              type="link" 
              size="small" 
              style={styles.actionButton}
              onClick={() => toggleShowAll('nonRecurring')}
            >
              {showAll.nonRecurring ? 'Show Less' : 'Display All'}
            </Button>
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
            <List.Item style={styles.listItem}>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    shape="square" 
                    size={36} 
                    style={{ ...styles.avatar, backgroundColor: '#EBF5FF' }}
                    icon={getCategoryIcon(item.category, 18)}
                  />
                }
                title={<Text strong>{item.name}</Text>}
                description={
                  <Text type="secondary" style={styles.dueDateText}>
                    Due {formatDueDate(item.dueDate)}
                  </Text>
                }
              />
              <Text strong>${Number(item.amount).toFixed(2)}</Text>
            </List.Item>
          )}
        />
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
            <List.Item style={styles.listItem}>
              <Space direction="vertical" size={0} style={{ width: '100%' }}>
                <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space align="center">
                    <IconCircleCheckFilled size={16} style={{ color: '#26C67B' }} />
                    <Text strong>{item.name}</Text>
                  </Space>
                  <Space direction="vertical" align="end" size={0}>
                    <Text strong>${Number(item.amount).toFixed(2)}</Text>
                    <Text type="secondary" style={{ fontSize: '0.7rem' }}>{item.category}</Text>
                  </Space>
                </Space>
                <div style={styles.recentActivityItem}>
                  <Text type="secondary" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                    <IconClock size={12} style={{ marginRight: 4 }} />
                    {daysAgo(item.dueDate)} days ago
                  </Text>
                </div>
              </Space>
            </List.Item>
          )}
        />
        {recentActivity.length > 3 && (
          <div style={styles.showMoreContainer}>
            <Button 
              type="link" 
              size="small" 
              style={styles.actionButton}
              onClick={() => toggleShowAll('recentActivity')}
            >
              {showAll.recentActivity ? 'Show Less' : 'Display All'}
            </Button>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default MobileFinanceFeed;