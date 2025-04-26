import React, { useState, useContext } from 'react';
import { Typography, Card, Space, List, Badge, Tag, Avatar, Button } from 'antd';
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

// Import context (assuming you have a FinanceContext)
// import { FinanceContext } from '../../contexts/FinanceContext';

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

// Sample data (replace with context data in real implementation)
const sampleData = {
  pastDue: [],
  billPrep: [
    { id: 1, name: 'Car Tax', category: 'Auto', totalAmount: 140.00, itemCount: 2 },
    { id: 2, name: 'Medical Deductible', category: 'Medical', totalAmount: 20.00, itemCount: 1 }
  ],
  nonRecurring: [
    { id: 3, name: '1Password', category: 'Subscription', amount: 35.88, isPaid: true, dueDate: '2023-04-14', daysAgo: 12 },
    { id: 4, name: 'Initial Psych Visit', category: 'Medical', amount: 58.48, isPaid: true, dueDate: '2023-04-15', daysAgo: 11 },
    { id: 5, name: 'Plant Fitness', category: 'Subscription', amount: 10.00, isPaid: true, dueDate: '2023-04-17', daysAgo: 9 },
    { id: 6, name: 'Clothing', category: 'Shopping', amount: 101.00, isPaid: true, dueDate: '2023-04-23', daysAgo: 3 },
    { id: 7, name: 'Passport Photos', category: 'Other', amount: 19.00, isPaid: true, dueDate: '2023-04-24', daysAgo: 2 }
  ],
  upcoming: [
    { id: 8, name: 'Gas 3', category: 'Utilities', amount: 50.00, dueDate: 'Today' },
    { id: 9, name: 'Car Payment', category: 'Auto', amount: 410.00, dueDate: 'In a day' },
    { id: 10, name: 'Internet', category: 'Utilities', amount: 50.00, dueDate: 'In a day' },
    { id: 11, name: 'Water Purifier', category: 'Utilities', amount: 42.00, dueDate: 'In 2 days' }
  ],
  recentActivity: [
    { id: 12, name: 'E-ZPass', category: 'Auto', amount: 35.00, daysAgo: 4 },
    { id: 13, name: 'Passport Photos', category: 'Other', amount: 19.00, daysAgo: 2 },
    { id: 14, name: 'Clothing', category: 'Other', amount: 101.00, daysAgo: 3 },
    { id: 15, name: 'State Farm', category: 'Auto', amount: 191.35, daysAgo: 4 },
    { id: 16, name: 'ChatGPT', category: 'Subscription', amount: 20.00, daysAgo: 5 }
  ]
};

const FinanceFeedMobile = () => {
  // In a real implementation, you'd use your FinanceContext
  // const financeContext = useContext(FinanceContext);
  // const { pastDue, billPrep, nonRecurring, upcoming, recentActivity } = financeContext;
  
  // For demonstration, we're using the sample data
  const { pastDue, billPrep, nonRecurring, upcoming, recentActivity } = sampleData;

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

  // Mobile card styling - more compact than desktop
  const cardStyle = {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  // Card head style with icon
  const cardHeadStyle = (iconColor) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#fff'
  });

  // Section based on card with title and collapsible content
  const SectionCard = ({ title, icon, children, section, empty = false, count, itemCount, emptyText }) => (
    <Card
      style={cardStyle}
      bodyStyle={expanded[section] ? { padding: 0 } : { padding: 0, height: 0, overflow: 'hidden' }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <Text strong style={{ marginLeft: 8, fontSize: '0.95rem' }}>{title}</Text>
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
              <Text type="secondary" style={{ marginLeft: 8, fontSize: '0.75rem' }}>
                ({itemCount})
              </Text>
            )}
          </div>
          <Button 
            type="text" 
            size="small"
            icon={expanded[section] ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
            onClick={() => toggleSection(section)}
            style={{ padding: 4 }}
          />
        </div>
      }
      headStyle={{ padding: '10px 16px' }}
    >
      {empty && expanded[section] ? (
        <div style={{ padding: 16, textAlign: 'center' }}>
          <Text type="secondary">{emptyText || 'No items to display'}</Text>
        </div>
      ) : (
        children
      )}
    </Card>
  );

  return (
    <div className="finance-feed-mobile" style={{ padding: '12px 12px 80px 12px' }}>
      <Title level={4} style={{ marginBottom: 16, fontSize: '1.2rem' }}>Finance Feed</Title>
      
      {/* Past Due Payments */}
      <SectionCard
        title="Past Due Payments"
        icon={<IconAlertOctagonFilled size={18} style={{ color: '#F1476F' }} />}
        section="pastDue"
        empty={pastDue.length === 0}
        emptyText="No past due payments"
        count={pastDue.length}
      >
        <List
          dataSource={pastDue}
          renderItem={item => (
            <List.Item
              style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    shape="square" 
                    size={36} 
                    style={{ backgroundColor: '#FFF5F5', borderRadius: 8 }}
                    icon={getCategoryIcon(item.category, 18)}
                  />
                }
                title={<Text strong>{item.name}</Text>}
                description={
                  <Text type="danger" style={{ fontSize: '0.75rem' }}>
                    Due {item.daysOverdue} days ago
                  </Text>
                }
              />
              <Text strong style={{ color: '#F1476F' }}>${item.amount.toFixed(2)}</Text>
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
            <List.Item
              style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    shape="square" 
                    size={36} 
                    style={{ backgroundColor: '#EBF5FF', borderRadius: 8 }}
                    icon={getCategoryIcon(item.category, 18)}
                  />
                }
                title={<Text strong>{item.name}</Text>}
                description={
                  <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                    {item.itemCount} {item.itemCount === 1 ? 'Item' : 'Items'}
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
            <List.Item
              style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    shape="square" 
                    size={36} 
                    style={{ backgroundColor: '#E5F8EF', borderRadius: 8 }}
                    icon={getCategoryIcon(item.category, 18)}
                  />
                }
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>{item.name}</Text>
                    <Text strong style={{ color: item.isPaid ? '#26C67B' : '#F1476F' }}>
                      ${item.amount.toFixed(2)}
                    </Text>
                  </div>
                }
                description={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                      {item.daysAgo} days ago (Apr {item.daysAgo})
                    </Text>
                    {item.isPaid && (
                      <Tag color="success" style={{ 
                        margin: 0, 
                        padding: '0 8px', 
                        height: 20, 
                        lineHeight: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}>
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
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <Button 
              type="link" 
              size="small" 
              onClick={() => toggleShowAll('nonRecurring')}
              style={{ fontSize: '0.8rem', fontWeight: 500 }}
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
            <List.Item
              style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    shape="square" 
                    size={36} 
                    style={{ backgroundColor: '#EBF5FF', borderRadius: 8 }}
                    icon={getCategoryIcon(item.category, 18)}
                  />
                }
                title={<Text strong>{item.name}</Text>}
                description={
                  <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                    Due {item.dueDate}
                  </Text>
                }
              />
              <Text strong>${item.amount.toFixed(2)}</Text>
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
            <List.Item
              style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}
            >
              <Space direction="vertical" size={0} style={{ width: '100%' }}>
                <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space align="center">
                    <IconCircleCheckFilled size={16} style={{ color: '#26C67B' }} />
                    <Text strong>{item.name}</Text>
                  </Space>
                  <Space direction="vertical" align="end" size={0}>
                    <Text strong>${item.amount.toFixed(2)}</Text>
                    <Text type="secondary" style={{ fontSize: '0.7rem' }}>{item.category}</Text>
                  </Space>
                </Space>
                <div style={{ marginLeft: 24 }}>
                  <Text type="secondary" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                    <IconClock size={12} style={{ marginRight: 4 }} />
                    {item.daysAgo} days ago
                  </Text>
                </div>
              </Space>
            </List.Item>
          )}
        />
        {recentActivity.length > 3 && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <Button 
              type="link" 
              size="small" 
              onClick={() => toggleShowAll('recentActivity')}
              style={{ fontSize: '0.8rem', fontWeight: 500 }}
            >
              {showAll.recentActivity ? 'Show Less' : 'Display All'}
            </Button>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default FinanceFeedMobile;