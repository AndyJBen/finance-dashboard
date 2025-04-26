// src/components/FinanceFeed/MobileFinanceFeed.jsx
import React, { useState, useContext } from 'react';
import { Typography, List, Badge, Tag, Avatar, Button, Space, Divider } from 'antd';
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

const { Text } = Typography;

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

// Section header colors for visual distinction - DARKER SHADES
const sectionColors = {
  pastDue: '#FFEBE6',       // Darker red background
  billPrep: '#D6F0FF',      // Darker blue background
  nonRecurring: '#E7F7DE',  // Darker green background
  upcoming: '#FFF1D9',      // Darker orange background
  recentActivity: '#F2E6FF' // Darker purple background
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
    padding: '4px 4px 100px 4px', // Further reduced horizontal padding to make cards even wider
    backgroundColor: 'transparent' // Use transparent background to show the parent background
  },
  
  // Container for each section - MADE WIDER with MORE SPACE BETWEEN
  sectionContainer: {
    marginBottom: 30, // Increased spacing between sections from 20px to 30px
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
    width: '100%' // Ensure full width
  },
  
  // Section header styling - MADE NARROWER
  sectionHeader: {
    padding: '10px 14px', // Reduced vertical padding from 16px to 10px
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: 'none',
    height: 'auto' // Remove fixed height
  },
  
  // Icon container - MADE SMALLER
  iconContainer: {
    width: 28, // Reduced from 36px
    height: 28, // Reduced from 36px
    borderRadius: 6, // Slightly smaller radius
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10, // Reduced spacing
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)'
  },
  
  // Updated title container
  titleContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  
  // Updated title text - MADE SMALLER
  titleText: {
    fontSize: '0.9rem', // Reduced from 1rem
    lineHeight: 1.2,
    fontWeight: 600
  },
  
  // Count text below title - MADE SMALLER
  countText: { 
    fontSize: '0.7rem', // Reduced from 0.75rem
    opacity: 0.8,
    marginTop: 1 // Reduced from 2px
  },
  
  // Toggle button - MADE SMALLER
  toggleButton: {
    padding: 2,
    width: 24, // Reduced from 32px
    height: 24, // Reduced from 32px
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: 'rgba(0, 0, 0, 0.45)'
  },
  
  // Section content - IMPROVED DISTINCTION
  sectionContent: {
    overflow: 'hidden',
    transition: 'max-height 0.3s ease',
    backgroundColor: '#fff',
    borderTop: '1px solid rgba(0, 0, 0, 0.03)' // Light separator line
  },
  
  // Empty section styling
  emptySection: {
    padding: 20, // Reduced from 24px
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.45)',
    backgroundColor: '#fafafa'
  },
  
  // List item styling - MADE NARROWER
  listItem: {
    padding: '8px 14px', // Reduced from 12px 16px
    display: 'flex',
    alignItems: 'center',
    borderBottom: 'none'
  },
  
  // Avatar styling - EXPLICIT SIZING
  avatar: {
    borderRadius: 6, // Reduced from 8px
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32, // Explicitly set width
    height: 32 // Explicitly set height
  },
  
  // Due date text - MADE SMALLER
  dueDateText: {
    fontSize: '0.7rem', // Reduced from 0.75rem
    lineHeight: 1.2
  },
  
  // Section for recent activity items
  recentActivityItem: {
    paddingLeft: 24
  },
  
  // Style for "Show more" button container
  showMoreContainer: {
    textAlign: 'center',
    padding: '8px 0', // Reduced from 12px
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
    backgroundColor: '#fafafa'
  },
  
  // Style for action buttons
  actionButton: {
    padding: '2px 8px', // Reduced padding
    height: 'auto',
    fontSize: '0.75rem', // Reduced from 0.8rem
    fontWeight: 500
  },
  
  // Tag styling
  tag: {
    margin: 0, 
    padding: '0 6px', // Reduced from 0 8px
    height: 18, // Reduced from 20px
    lineHeight: '18px',
    fontSize: '0.65rem', // Reduced from 0.7rem
    fontWeight: 700
  },
  
  // Item header with flex layout
  itemHeader: {
    display: 'flex', 
    justifyContent: 'space-between'
  },
  
  // Item divider - MORE SUBTLE
  itemDivider: {
    margin: '0 14px',
    opacity: 0.4,
    height: 1
  },
  
  // Total section styling - DISTINCTIVE
  totalSection: {
    padding: '8px 14px', // Reduced from 12px 16px
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Slightly darker than content
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
    height: 'auto' // Let height adjust naturally
  },
  
  // Total text styling
  totalText: {
    fontSize: '0.7rem', // Reduced from 0.75rem
    fontWeight: 700,
    color: 'rgba(0, 0, 0, 0.65)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  
  // Amount text in total section
  totalAmount: {
    fontSize: '0.95rem', // Reduced from 1rem
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
              <IconAlertOctagon size={16} style={{ color: iconColors.pastDue }} />
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
            icon={expanded.pastDue ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
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
                            size={32} 
                            style={{ 
                              ...styles.avatar, 
                              backgroundColor: 'rgba(245, 34, 45, 0.1)' // Light red background
                            }}
                            icon={getCategoryIcon(item.category, 16)}
                          />
                        }
                        title={<Text strong style={{fontSize: '0.85rem'}}>{item.name}</Text>}
                        description={
                          <Text type="danger" style={styles.dueDateText}>
                            Due {daysAgo(item.dueDate)} days ago
                          </Text>
                        }
                      />
                      <Text strong style={{ color: iconColors.pastDue, fontSize: '0.85rem' }}>${Number(item.amount).toFixed(2)}</Text>
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
              <IconClipboardList size={16} style={{ color: iconColors.billPrep }} />
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
            icon={expanded.billPrep ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
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
                            size={32} 
                            style={{ 
                              ...styles.avatar, 
                              backgroundColor: 'rgba(24, 144, 255, 0.1)' // Light blue background
                            }}
                            icon={getCategoryIcon(item.category, 16)}
                          />
                        }
                        title={<Text strong style={{fontSize: '0.85rem'}}>{item.name}</Text>}
                        description={
                          <Text type="secondary" style={styles.dueDateText}>
                            {item.bills.length} {item.bills.length === 1 ? 'Item' : 'Items'}
                          </Text>
                        }
                      />
                      <Text strong style={{ color: iconColors.billPrep, fontSize: '0.85rem' }}>${item.totalAmount.toFixed(2)}</Text>
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
              <IconRepeatOff size={16} style={{ color: iconColors.nonRecurring }} />
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
            icon={expanded.nonRecurring ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
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
                            size={32} 
                            style={{ 
                              ...styles.avatar, 
                              backgroundColor: 'rgba(82, 196, 26, 0.1)' // Light green background
                            }}
                            icon={getCategoryIcon(item.category, 16)}
                          />
                        }
                        title={
                          <div style={styles.itemHeader}>
                            <Text strong style={{fontSize: '0.85rem'}}>{item.name}</Text>
                            <Text strong style={{ color: item.isPaid ? iconColors.nonRecurring : iconColors.pastDue, fontSize: '0.85rem' }}>
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
              <IconHourglass size={16} style={{ color: iconColors.upcoming }} />
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
            icon={expanded.upcoming ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
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
                            size={32} 
                            style={{ 
                              ...styles.avatar, 
                              backgroundColor: 'rgba(250, 140, 22, 0.1)' // Light orange background
                            }}
                            icon={getCategoryIcon(item.category, 16)}
                          />
                        }
                        title={<Text strong style={{fontSize: '0.85rem'}}>{item.name}</Text>}
                        description={
                          <Text type="secondary" style={styles.dueDateText}>
                            Due {formatDueDate(item.dueDate)}
                          </Text>
                        }
                      />
                      <Text strong style={{ color: iconColors.upcoming, fontSize: '0.85rem' }}>${Number(item.amount).toFixed(2)}</Text>
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
              <IconClock size={16} style={{ color: iconColors.recentActivity }} />
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
            icon={expanded.recentActivity ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
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
                              size={32} 
                              style={{ 
                                ...styles.avatar, 
                                backgroundColor: 'rgba(114, 46, 209, 0.1)' // Light purple background
                              }}
                              icon={<IconCircleCheck size={16} style={{ color: iconColors.recentActivity }} />}
                            />
                            <Text strong style={{fontSize: '0.85rem'}}>{item.name}</Text>
                          </Space>
                          <Space direction="vertical" align="end" size={0}>
                            <Text strong style={{fontSize: '0.85rem'}}>${Number(item.amount).toFixed(2)}</Text>
                            <Text type="secondary" style={{ fontSize: '0.7rem' }}>{item.category}</Text>
                          </Space>
                        </Space>
                        <div style={styles.recentActivityItem}>
                          <Text type="secondary" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                            <IconClock size={10} style={{ marginRight: 4 }} />
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
    </div>
  );
};

export default MobileFinanceFeed;