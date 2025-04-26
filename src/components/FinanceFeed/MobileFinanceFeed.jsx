// src/components/FinanceFeed/MobileFinanceFeed.jsx
import React, { useState, useContext } from 'react';
import { Typography, Card, List, Badge, Tag, Avatar, Button, Space, Divider, Statistic } from 'antd';
import {
  IconAlertOctagon,
  IconClipboardList,
  IconRepeat,
  IconHourglass,
  IconClock,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconCar,
  IconHome,
  IconDeviceLaptop,
  IconWifi,
  IconDroplet,
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

// Section header colors for visual distinction
const sectionColors = {
  pastDue: '#FFF5F5',
  billPrep: '#EBF5FF', 
  nonRecurring: '#E5F8EF',
  upcoming: '#FFF7E6',
  recentActivity: '#F0F5FF'
};

// Section header icon colors
const iconColors = {
  pastDue: '#F1476F',
  billPrep: '#0066FF',
  nonRecurring: '#26C67B',
  upcoming: '#FF9233',
  recentActivity: '#3388FF'
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
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
    border: '1px solid var(--neutral-200)',
    marginBottom: 20
  },
  sectionHeader: {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--neutral-200)'
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
    fontSize: '0.75rem',
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
  },
  sectionContent: {
    overflow: 'hidden',
    transition: 'max-height 0.3s ease',
  },
  totalSection: {
    padding: '12px 16px',
    borderTop: '1px solid var(--neutral-200)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.02)'
  },
  totalText: {
    fontSize: '0.85rem',
    fontWeight: 600
  },
  totalAmount: {
    fontSize: '0.85rem',
    fontWeight: 600
  },
  divider: {
    margin: '0'
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

  return (
    <div style={styles.container}>
      <Title level={4} style={styles.pageTitle}>Finance Feed</Title>
      
      <Card style={styles.card}>
        {/* Past Due Payments Section */}
        <div>
          <div 
            style={{
              ...styles.sectionHeader,
              backgroundColor: sectionColors.pastDue
            }}
          >
            <div style={styles.titleLeftSection}>
              <IconAlertOctagon size={18} style={{ color: iconColors.pastDue }} />
              <Text strong style={styles.titleText}>Past Due Payments</Text>
              {pastDueBills.length > 0 && (
                <Badge
                  count={pastDueBills.length}
                  showZero={false}
                  style={{ 
                    ...styles.badge,
                    backgroundColor: iconColors.pastDue
                  }}
                />
              )}
            </div>
            <Button 
              type="text" 
              size="small"
              style={styles.toggleButton}
              icon={expanded.pastDue ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              onClick={() => toggleSection('pastDue')}
            />
          </div>
          
          <div 
            style={{
              ...styles.sectionContent,
              maxHeight: expanded.pastDue ? '1000px' : '0px',
            }}
          >
            {pastDueBills.length === 0 ? (
              <div style={styles.emptySection}>
                <Text type="secondary">No past due payments</Text>
              </div>
            ) : (
              <>
                <List
                  dataSource={pastDueBills}
                  renderItem={item => (
                    <List.Item style={styles.listItem}>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            shape="square" 
                            size={36} 
                            style={{ ...styles.avatar, backgroundColor: sectionColors.pastDue }}
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
                      <Text strong style={{ color: iconColors.pastDue }}>${Number(item.amount).toFixed(2)}</Text>
                    </List.Item>
                  )}
                />
                <div style={styles.totalSection}>
                  <Text style={styles.totalText}>Past Due Total</Text>
                  <Text style={{...styles.totalAmount, color: iconColors.pastDue}}>
                    ${pastDueTotal.toFixed(2)}
                  </Text>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bill Prep Section */}
        <div>
          <div 
            style={{
              ...styles.sectionHeader,
              backgroundColor: sectionColors.billPrep
            }}
          >
            <div style={styles.titleLeftSection}>
              <IconClipboardList size={18} style={{ color: iconColors.billPrep }} />
              <Text strong style={styles.titleText}>Bill Prep</Text>
              {billPrep.length > 0 && (
                <Badge
                  count={billPrep.length}
                  showZero={false}
                  style={{ 
                    ...styles.badge,
                    backgroundColor: iconColors.billPrep
                  }}
                />
              )}
            </div>
            <Button 
              type="text" 
              size="small"
              style={styles.toggleButton}
              icon={expanded.billPrep ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              onClick={() => toggleSection('billPrep')}
            />
          </div>
          
          <div 
            style={{
              ...styles.sectionContent,
              maxHeight: expanded.billPrep ? '1000px' : '0px',
            }}
          >
            {billPrep.length === 0 ? (
              <div style={styles.emptySection}>
                <Text type="secondary">No bills in preparation</Text>
              </div>
            ) : (
              <>
                <List
                  dataSource={billPrep}
                  renderItem={item => (
                    <List.Item style={styles.listItem}>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            shape="square" 
                            size={36} 
                            style={{ ...styles.avatar, backgroundColor: sectionColors.billPrep }}
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
                <div style={styles.totalSection}>
                  <Text style={styles.totalText}>Bill Prep Total</Text>
                  <Text style={{...styles.totalAmount, color: iconColors.billPrep}}>
                    ${billPrepTotal.toFixed(2)}
                  </Text>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Non-Recurring Bills Section */}
        <div>
          <div 
            style={{
              ...styles.sectionHeader,
              backgroundColor: sectionColors.nonRecurring
            }}
          >
            <div style={styles.titleLeftSection}>
              <IconRepeat size={18} style={{ color: iconColors.nonRecurring }} />
              <Text strong style={styles.titleText}>Non-Recurring Bills</Text>
              {nonRecurring.length > 0 && (
                <Badge
                  count={nonRecurring.length}
                  showZero={false}
                  style={{ 
                    ...styles.badge,
                    backgroundColor: iconColors.nonRecurring
                  }}
                />
              )}
            </div>
            <Button 
              type="text" 
              size="small"
              style={styles.toggleButton}
              icon={expanded.nonRecurring ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              onClick={() => toggleSection('nonRecurring')}
            />
          </div>
          
          <div 
            style={{
              ...styles.sectionContent,
              maxHeight: expanded.nonRecurring ? '1000px' : '0px',
            }}
          >
            {nonRecurring.length === 0 ? (
              <div style={styles.emptySection}>
                <Text type="secondary">No non-recurring bills</Text>
              </div>
            ) : (
              <>
                <List
                  dataSource={limitItems(nonRecurring, 'nonRecurring')}
                  renderItem={item => (
                    <List.Item style={styles.listItem}>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            shape="square" 
                            size={36} 
                            style={{ ...styles.avatar, backgroundColor: sectionColors.nonRecurring }}
                            icon={getCategoryIcon(item.category, 18)}
                          />
                        }
                        title={
                          <div style={styles.itemHeader}>
                            <Text strong>{item.name}</Text>
                            <Text strong style={{ color: item.isPaid ? iconColors.nonRecurring : iconColors.pastDue }}>
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
                <div style={styles.totalSection}>
                  <Text style={styles.totalText}>Non-Recurring Total</Text>
                  <Text style={{...styles.totalAmount, color: iconColors.nonRecurring}}>
                    ${nonRecurringTotal.toFixed(2)}
                  </Text>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Upcoming Bills Section */}
        <div>
          <div 
            style={{
              ...styles.sectionHeader,
              backgroundColor: sectionColors.upcoming
            }}
          >
            <div style={styles.titleLeftSection}>
              <IconHourglass size={18} style={{ color: iconColors.upcoming }} />
              <Text strong style={styles.titleText}>Upcoming Bills</Text>
              {upcoming.length > 0 && (
                <Badge
                  count={upcoming.length}
                  showZero={false}
                  style={{ 
                    ...styles.badge,
                    backgroundColor: iconColors.upcoming
                  }}
                />
              )}
            </div>
            <Button 
              type="text" 
              size="small"
              style={styles.toggleButton}
              icon={expanded.upcoming ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              onClick={() => toggleSection('upcoming')}
            />
          </div>
          
          <div 
            style={{
              ...styles.sectionContent,
              maxHeight: expanded.upcoming ? '1000px' : '0px',
            }}
          >
            {upcoming.length === 0 ? (
              <div style={styles.emptySection}>
                <Text type="secondary">No upcoming bills</Text>
              </div>
            ) : (
              <>
                <List
                  dataSource={upcoming}
                  renderItem={item => (
                    <List.Item style={styles.listItem}>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            shape="square" 
                            size={36} 
                            style={{ ...styles.avatar, backgroundColor: sectionColors.upcoming }}
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
                <div style={styles.totalSection}>
                  <Text style={styles.totalText}>Upcoming Total</Text>
                  <Text style={{...styles.totalAmount, color: iconColors.upcoming}}>
                    ${upcomingTotal.toFixed(2)}
                  </Text>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div>
          <div 
            style={{
              ...styles.sectionHeader,
              backgroundColor: sectionColors.recentActivity
            }}
          >
            <div style={styles.titleLeftSection}>
              <IconClock size={18} style={{ color: iconColors.recentActivity }} />
              <Text strong style={styles.titleText}>Recent Activity</Text>
              {recentActivity.length > 0 && (
                <Badge
                  count={recentActivity.length}
                  showZero={false}
                  style={{ 
                    ...styles.badge,
                    backgroundColor: iconColors.recentActivity
                  }}
                />
              )}
            </div>
            <Button 
              type="text" 
              size="small"
              style={styles.toggleButton}
              icon={expanded.recentActivity ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              onClick={() => toggleSection('recentActivity')}
            />
          </div>
          
          <div 
            style={{
              ...styles.sectionContent,
              maxHeight: expanded.recentActivity ? '1000px' : '0px',
            }}
          >
            {recentActivity.length === 0 ? (
              <div style={styles.emptySection}>
                <Text type="secondary">No recent activity</Text>
              </div>
            ) : (
              <>
                <List
                  dataSource={limitItems(recentActivity, 'recentActivity')}
                  renderItem={item => (
                    <List.Item style={styles.listItem}>
                      <Space direction="vertical" size={0} style={{ width: '100%' }}>
                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space align="center">
                            <IconCircleCheck size={16} style={{ color: iconColors.nonRecurring }} />
                            <Text strong>{item.name}</Text>
                          </Space>
                          <Space direction="vertical" align="end" size={0}>
                            <Text strong>${Number(item.amount).toFixed(2)}</Text>
                            <Text type="secondary" style={{ fontSize: '0.75rem' }}>{item.category}</Text>
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
                <div style={styles.totalSection}>
                  <Text style={styles.totalText}>Recent Activity Total</Text>
                  <Text style={{...styles.totalAmount, color: iconColors.recentActivity}}>
                    ${recentActivityTotal.toFixed(2)}
                  </Text>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MobileFinanceFeed;