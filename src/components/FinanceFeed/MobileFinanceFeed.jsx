// src/components/FinanceFeed/MobileFinanceFeed.jsx
import React, { useState, useContext } from 'react';
import { Typography, Card, List, Badge, Tag, Avatar, Button, Space, Divider, Statistic } from 'antd';
import {
  IconAlertOctagon,
  IconClipboardList,
  IconRepeatOff,
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
  pastDue: '#FFF1F0',       // Lighter red background
  billPrep: '#E6F7FF',      // Lighter blue background
  nonRecurring: '#F6FFED',  // Lighter green background
  upcoming: '#FFF7E6',      // Light orange background
  recentActivity: '#F9F0FF' // Light purple background
};

// Section header icon colors
const iconColors = {
  pastDue: '#F5222D',      // Brighter red for icons
  billPrep: '#1890FF',     // Brighter blue
  nonRecurring: '#52C41A', // Brighter green
  upcoming: '#FA8C16',     // Brighter orange
  recentActivity: '#722ED1' // Brighter purple
};

// CSS Styles for Mobile Finance Feed
const styles = {
  container: {
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',
    padding: '12px 12px 100px 12px', // Increased bottom padding (from 80px to 100px)
    backgroundColor: '#F0F2F5'
  },
  
  // Card styling for the whole page
  card: {
    borderRadius: '0',
    overflow: 'hidden',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    marginBottom: 0
  },
  
  // Container for each section
  sectionContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)'
  },
  
  // Section header styling - made more distinct
  sectionHeader: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: 'none'
  },
  
  // New container for section icon
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  
  // Updated title container
  titleContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  
  // Updated title text
  titleText: {
    fontSize: '1rem',
    lineHeight: 1.2,
    fontWeight: 600
  },
  
  // Count text below title
  countText: { 
    fontSize: '0.75rem', 
    opacity: 0.8,
    marginTop: 2
  },
  
  // Toggle button
  toggleButton: {
    padding: 4,
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: 'rgba(0, 0, 0, 0.45)'
  },
  
  // Section content
  sectionContent: {
    overflow: 'hidden',
    transition: 'max-height 0.3s ease',
    backgroundColor: '#fff'
  },
  
  // Empty section styling
  emptySection: {
    padding: 24,
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.45)',
    backgroundColor: '#fafafa'
  },
  
  // List item styling
  listItem: {
    padding: '8px 16px', // Reduced padding from 12px to 8px for height reduction
    display: 'flex',
    alignItems: 'center',
    borderBottom: 'none'
  },
  
  // Avatar styling
  avatar: {
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36, // Set fixed width for avatar
    height: 36  // Set fixed height for avatar (reduced from 40)
  },
  
  // Due date text
  dueDateText: {
    fontSize: '0.7rem', // Slightly reduced font size
    lineHeight: 1.2    // Tighter line height
  },
  
  // Section for recent activity items
  recentActivityItem: {
    paddingLeft: 24
  },
  
  // Style for "Show more" button container
  showMoreContainer: {
    textAlign: 'center',
    padding: '12px 0',
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
    backgroundColor: '#fafafa'
  },
  
  // Style for action buttons
  actionButton: {
    padding: '4px 12px',
    height: 'auto',
    fontSize: '0.8rem',
    fontWeight: 500
  },
  
  // Tag styling
  tag: {
    margin: 0, 
    padding: '0 8px', 
    height: 20, 
    lineHeight: '20px',
    fontSize: '0.7rem',
    fontWeight: 700
  },
  
  // Item header with flex layout
  itemHeader: {
    display: 'flex', 
    justifyContent: 'space-between'
  },
  
  // Item divider
  itemDivider: {
    margin: '0 16px',
    opacity: 0.4,     // More subtle divider
    height: 1         // Thinner divider
  },
  
  // Total section styling - REDESIGNED to be very distinct
  totalSection: {
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderTop: '1px solid rgba(0, 0, 0, 0.06)'
  },
  
  // Total text styling - now more distinct
  totalText: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'rgba(0, 0, 0, 0.65)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  
  // Amount text in total section
  totalAmount: {
    fontSize: '1rem',
    fontWeight: 700
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
      
      {/* REDESIGNED: Each section is now in its own container with rounded corners */}
      <Card style={styles.card}>
        {/* Past Due Payments Section - REDESIGNED */}
        <div style={styles.sectionContainer}>
          <div style={{
            ...styles.sectionHeader,
            backgroundColor: sectionColors.pastDue
          }}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{
                ...styles.iconContainer,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}>
                <IconAlertOctagon size={20} style={{ color: iconColors.pastDue }} />
              </div>
              <div style={styles.titleContainer}>
                <Text style={styles.titleText}>Past Due Payments</Text>
                {pastDueBills.length > 0 && (
                  <Text style={styles.countText}>
                    {pastDueBills.length} {pastDueBills.length === 1 ? 'item' : 'items'}
                  </Text>
                )}
              </div>
            </div>
            <Button 
              type="text" 
              size="small"
              style={styles.toggleButton}
              icon={expanded.pastDue ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              onClick={() => toggleSection('pastDue')}
            />
          </div>
          
          <div style={{
            ...styles.sectionContent,
            maxHeight: expanded.pastDue ? '1000px' : '0px',
          }}>
            {pastDueBills.length === 0 ? (
              <div style={styles.emptySection}>
                <Text type="secondary">No past due payments</Text>
              </div>
            ) : (
              <>
                <List
                  dataSource={pastDueBills}
                  renderItem={(item, index) => (
                    <>
                      <List.Item style={styles.listItem}>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              shape="square" 
                              size={36} 
                              style={{ 
                                ...styles.avatar, 
                                backgroundColor: 'rgba(245, 34, 45, 0.1)' // Light red background
                              }}
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
                      {index < pastDueBills.length - 1 && <Divider style={styles.itemDivider} />}
                    </>
                  )}
                />
                {/* Redesigned total section */}
                <div style={styles.totalSection}>
                  <Text style={styles.totalText}>SECTION TOTAL</Text>
                  <Text style={{...styles.totalAmount, color: iconColors.pastDue}}>
                    ${pastDueTotal.toFixed(2)}
                  </Text>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bill Prep Section - REDESIGNED */}
        <div style={styles.sectionContainer}>
          <div style={{
            ...styles.sectionHeader,
            backgroundColor: sectionColors.billPrep
          }}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{
                ...styles.iconContainer,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}>
                <IconClipboardList size={20} style={{ color: iconColors.billPrep }} />
              </div>
              <div style={styles.titleContainer}>
                <Text style={styles.titleText}>Bill Prep</Text>
                {billPrep.length > 0 && (
                  <Text style={styles.countText}>
                    {billPrep.length} {billPrep.length === 1 ? 'item' : 'items'}
                  </Text>
                )}
              </div>
            </div>
            <Button 
              type="text" 
              size="small"
              style={styles.toggleButton}
              icon={expanded.billPrep ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              onClick={() => toggleSection('billPrep')}
            />
          </div>
          
          <div style={{
            ...styles.sectionContent,
            maxHeight: expanded.billPrep ? '1000px' : '0px',
          }}>
            {billPrep.length === 0 ? (
              <div style={styles.emptySection}>
                <Text type="secondary">No bills in preparation</Text>
              </div>
            ) : (
              <>
                <List
                  dataSource={billPrep}
                  renderItem={(item, index) => (
                    <>
                      <List.Item style={styles.listItem}>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              shape="square" 
                              size={36} 
                              style={{ 
                                ...styles.avatar, 
                                backgroundColor: 'rgba(24, 144, 255, 0.1)' // Light blue background
                              }}
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
                        <Text strong style={{ color: iconColors.billPrep }}>${item.totalAmount.toFixed(2)}</Text>
                      </List.Item>
                      {index < billPrep.length - 1 && <Divider style={styles.itemDivider} />}
                    </>
                  )}
                />
                {/* Redesigned total section */}
                <div style={styles.totalSection}>
                  <Text style={styles.totalText}>SECTION TOTAL</Text>
                  <Text style={{...styles.totalAmount, color: iconColors.billPrep}}>
                    ${billPrepTotal.toFixed(2)}
                  </Text>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Non-Recurring Bills Section - REDESIGNED */}
        <div style={styles.sectionContainer}>
          <div style={{
            ...styles.sectionHeader,
            backgroundColor: sectionColors.nonRecurring
          }}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{
                ...styles.iconContainer,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}>
                <IconRepeatOff size={20} style={{ color: iconColors.nonRecurring }} />
              </div>
              <div style={styles.titleContainer}>
                <Text style={styles.titleText}>Non-Recurring Bills</Text>
                {nonRecurring.length > 0 && (
                  <Text style={styles.countText}>
                    {nonRecurring.length} {nonRecurring.length === 1 ? 'item' : 'items'}
                  </Text>
                )}
              </div>
            </div>
            <Button 
              type="text" 
              size="small"
              style={styles.toggleButton}
              icon={expanded.nonRecurring ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              onClick={() => toggleSection('nonRecurring')}
            />
          </div>
          
          <div style={{
            ...styles.sectionContent,
            maxHeight: expanded.nonRecurring ? '1000px' : '0px',
          }}>
            {nonRecurring.length === 0 ? (
              <div style={styles.emptySection}>
                <Text type="secondary">No non-recurring bills</Text>
              </div>
            ) : (
              <>
                <List
                  dataSource={limitItems(nonRecurring, 'nonRecurring')}
                  renderItem={(item, index) => (
                    <>
                      <List.Item style={styles.listItem}>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              shape="square" 
                              size={36} 
                              style={{ 
                                ...styles.avatar, 
                                backgroundColor: 'rgba(82, 196, 26, 0.1)' // Light green background
                              }}
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
                      {index < limitItems(nonRecurring, 'nonRecurring').length - 1 && 
                        <Divider style={styles.itemDivider} />}
                    </>
                  )}
                />
                {nonRecurring.length > 3 && (
                  <div style={styles.showMoreContainer}>
                    <Button 
                      type="link" 
                      size="small" 
                      style={{...styles.actionButton, color: iconColors.nonRecurring}}
                      onClick={() => toggleShowAll('nonRecurring')}
                    >
                      {showAll.nonRecurring ? 'Show Less' : 'Show All'}
                    </Button>
                  </div>
                )}
                {/* Redesigned total section */}
                <div style={styles.totalSection}>
                  <Text style={styles.totalText}>SECTION TOTAL</Text>
                  <Text style={{...styles.totalAmount, color: iconColors.nonRecurring}}>
                    ${nonRecurringTotal.toFixed(2)}
                  </Text>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Upcoming Bills Section - REDESIGNED */}
        <div style={styles.sectionContainer}>
          <div style={{
            ...styles.sectionHeader,
            backgroundColor: sectionColors.upcoming
          }}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{
                ...styles.iconContainer,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}>
                <IconHourglass size={20} style={{ color: iconColors.upcoming }} />
              </div>
              <div style={styles.titleContainer}>
                <Text style={styles.titleText}>Upcoming Bills</Text>
                {upcoming.length > 0 && (
                  <Text style={styles.countText}>
                    {upcoming.length} {upcoming.length === 1 ? 'item' : 'items'}
                  </Text>
                )}
              </div>
            </div>
            <Button 
              type="text" 
              size="small"
              style={styles.toggleButton}
              icon={expanded.upcoming ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              onClick={() => toggleSection('upcoming')}
            />
          </div>
          
          <div style={{
            ...styles.sectionContent,
            maxHeight: expanded.upcoming ? '1000px' : '0px',
          }}>
            {upcoming.length === 0 ? (
              <div style={styles.emptySection}>
                <Text type="secondary">No upcoming bills</Text>
              </div>
            ) : (
              <>
                <List
                  dataSource={upcoming}
                  renderItem={(item, index) => (
                    <>
                      <List.Item style={styles.listItem}>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              shape="square" 
                              size={36} 
                              style={{ 
                                ...styles.avatar, 
                                backgroundColor: 'rgba(250, 140, 22, 0.1)' // Light orange background
                              }}
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
                        <Text strong style={{ color: iconColors.upcoming }}>${Number(item.amount).toFixed(2)}</Text>
                      </List.Item>
                      {index < upcoming.length - 1 && <Divider style={styles.itemDivider} />}
                    </>
                  )}
                />
                {/* Redesigned total section */}
                <div style={styles.totalSection}>
                  <Text style={styles.totalText}>SECTION TOTAL</Text>
                  <Text style={{...styles.totalAmount, color: iconColors.upcoming}}>
                    ${upcomingTotal.toFixed(2)}
                  </Text>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity Section - REDESIGNED */}
        <div style={styles.sectionContainer}>
          <div style={{
            ...styles.sectionHeader,
            backgroundColor: sectionColors.recentActivity
          }}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{
                ...styles.iconContainer,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}>
                <IconClock size={20} style={{ color: iconColors.recentActivity }} />
              </div>
              <div style={styles.titleContainer}>
                <Text style={styles.titleText}>Recent Activity</Text>
                {recentActivity.length > 0 && (
                  <Text style={styles.countText}>
                    {recentActivity.length} {recentActivity.length === 1 ? 'item' : 'items'}
                  </Text>
                )}
              </div>
            </div>
            <Button 
              type="text" 
              size="small"
              style={styles.toggleButton}
              icon={expanded.recentActivity ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              onClick={() => toggleSection('recentActivity')}
            />
          </div>
          
          <div style={{
            ...styles.sectionContent,
            maxHeight: expanded.recentActivity ? '1000px' : '0px',
          }}>
            {recentActivity.length === 0 ? (
              <div style={styles.emptySection}>
                <Text type="secondary">No recent activity</Text>
              </div>
            ) : (
              <>
                <List
                  dataSource={limitItems(recentActivity, 'recentActivity')}
                  renderItem={(item, index) => (
                    <>
                      <List.Item style={styles.listItem}>
                        <Space direction="vertical" size={0} style={{ width: '100%' }}>
                          <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Space align="center">
                              <Avatar 
                                shape="square" 
                                size={36} 
                                style={{ 
                                  ...styles.avatar, 
                                  backgroundColor: 'rgba(114, 46, 209, 0.1)' // Light purple background
                                }}
                                icon={<IconCircleCheck size={18} style={{ color: iconColors.recentActivity }} />}
                              />
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
                      {index < limitItems(recentActivity, 'recentActivity').length - 1 && 
                        <Divider style={styles.itemDivider} />}
                    </>
                  )}
                />
                {recentActivity.length > 3 && (
                  <div style={styles.showMoreContainer}>
                    <Button 
                      type="link" 
                      size="small" 
                      style={{...styles.actionButton, color: iconColors.recentActivity}}
                      onClick={() => toggleShowAll('recentActivity')}
                    >
                      {showAll.recentActivity ? 'Show Less' : 'Show All'}
                    </Button>
                  </div>
                )}
                {/* Redesigned total section */}
                <div style={styles.totalSection}>
                  <Text style={styles.totalText}>SECTION TOTAL</Text>
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