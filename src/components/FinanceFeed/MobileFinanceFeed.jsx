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

// Import the CSS file
import './MobileFinanceFeed.css';

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
    <div className="finance-feed-mobile">
      {/* Past Due Payments Section */}
      <section className="finance-section-card">
        <div className="section-header section-header-pastdue">
          <div className="section-title-container">
            <div className="section-icon-container">
              <IconAlertOctagon size={16} className="icon-pastdue" />
            </div>
            <div>
              <Text className="section-title">Past Due Payments</Text>
              {pastDueBills.length > 0 && (
                <Text className="section-subtitle">
                  {pastDueBills.length} {pastDueBills.length === 1 ? 'item' : 'items'}
                </Text>
              )}
            </div>
          </div>
          <Button 
            type="text" 
            className="section-toggle-button"
            icon={expanded.pastDue ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            onClick={() => toggleSection('pastDue')}
          />
        </div>
        
        <div className="section-content" style={{maxHeight: expanded.pastDue ? '1000px' : '0px'}}>
          {pastDueBills.length === 0 ? (
            <div className="empty-section">
              <Text type="secondary">No past due payments</Text>
            </div>
          ) : (
            <>
              <List
                className="apple-style-list"
                dataSource={pastDueBills}
                renderItem={(item, index) => (
                  <>
                    <List.Item className="feed-list-item">
                      <Avatar 
                        shape="square" 
                        className="feed-item-avatar"
                        style={{backgroundColor: 'rgba(245, 34, 45, 0.1)'}}
                        icon={getCategoryIcon(item.category, 16)}
                      />
                      <div className="feed-item-content">
                        <Text className="feed-item-title">{item.name}</Text>
                        <Text type="danger" className="due-date-text">
                          Due {daysAgo(item.dueDate)} days ago
                        </Text>
                      </div>
                      <Text strong style={{color: '#F5222D'}}>${Number(item.amount).toFixed(2)}</Text>
                    </List.Item>
                    {index < pastDueBills.length - 1 && <Divider className="item-divider" />}
                  </>
                )}
              />
              <div className="section-total">
                <Text className="total-label">SECTION TOTAL</Text>
                <Text className="total-amount total-amount-pastdue">
                  ${pastDueTotal.toFixed(2)}
                </Text>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Bill Prep Section */}
      <section className="finance-section-card">
        <div className="section-header section-header-billprep">
          <div className="section-title-container">
            <div className="section-icon-container">
              <IconClipboardList size={16} className="icon-billprep" />
            </div>
            <div>
              <Text className="section-title">Bill Prep</Text>
              {billPrep.length > 0 && (
                <Text className="section-subtitle">
                  {billPrep.length} {billPrep.length === 1 ? 'item' : 'items'}
                </Text>
              )}
            </div>
          </div>
          <Button 
            type="text" 
            className="section-toggle-button"
            icon={expanded.billPrep ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            onClick={() => toggleSection('billPrep')}
          />
        </div>
        
        <div className="section-content" style={{maxHeight: expanded.billPrep ? '1000px' : '0px'}}>
          {billPrep.length === 0 ? (
            <div className="empty-section">
              <Text type="secondary">No bills in preparation</Text>
            </div>
          ) : (
            <>
              <List
                className="apple-style-list"
                dataSource={billPrep}
                renderItem={(item, index) => (
                  <>
                    <List.Item className="feed-list-item">
                      <Avatar 
                        shape="square" 
                        className="feed-item-avatar"
                        style={{backgroundColor: 'rgba(24, 144, 255, 0.1)'}}
                        icon={getCategoryIcon(item.category, 16)}
                      />
                      <div className="feed-item-content">
                        <Text className="feed-item-title">{item.name}</Text>
                        <Text type="secondary" className="feed-item-subtitle">
                          {item.bills.length} {item.bills.length === 1 ? 'Item' : 'Items'}
                        </Text>
                      </div>
                      <Text strong style={{color: '#1890FF'}}>${item.totalAmount.toFixed(2)}</Text>
                    </List.Item>
                    {index < billPrep.length - 1 && <Divider className="item-divider" />}
                  </>
                )}
              />
              <div className="section-total">
                <Text className="total-label">SECTION TOTAL</Text>
                <Text className="total-amount total-amount-billprep">
                  ${billPrepTotal.toFixed(2)}
                </Text>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Non-Recurring Bills Section */}
      <section className="finance-section-card">
        <div className="section-header section-header-nonrecurring">
          <div className="section-title-container">
            <div className="section-icon-container">
              <IconRepeatOff size={16} className="icon-nonrecurring" />
            </div>
            <div>
              <Text className="section-title">Non-Recurring Bills</Text>
              {nonRecurring.length > 0 && (
                <Text className="section-subtitle">
                  {nonRecurring.length} {nonRecurring.length === 1 ? 'item' : 'items'}
                </Text>
              )}
            </div>
          </div>
          <Button 
            type="text" 
            className="section-toggle-button"
            icon={expanded.nonRecurring ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            onClick={() => toggleSection('nonRecurring')}
          />
        </div>
        
        <div className="section-content" style={{maxHeight: expanded.nonRecurring ? '1000px' : '0px'}}>
          {nonRecurring.length === 0 ? (
            <div className="empty-section">
              <Text type="secondary">No non-recurring bills</Text>
            </div>
          ) : (
            <>
              <List
                className="apple-style-list"
                dataSource={limitItems(nonRecurring, 'nonRecurring')}
                renderItem={(item, index) => (
                  <>
                    <List.Item className="feed-list-item">
                      <Avatar 
                        shape="square" 
                        className="feed-item-avatar"
                        style={{backgroundColor: 'rgba(82, 196, 26, 0.1)'}}
                        icon={getCategoryIcon(item.category, 16)}
                      />
                      <div className="feed-item-content">
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <Text className="feed-item-title">{item.name}</Text>
                          <Text strong style={{color: item.isPaid ? '#52C41A' : '#F5222D'}}>
                            ${Number(item.amount).toFixed(2)}
                          </Text>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4}}>
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
                    {index < limitItems(nonRecurring, 'nonRecurring').length - 1 && 
                      <Divider className="item-divider" />}
                  </>
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
              <div className="section-total">
                <Text className="total-label">SECTION TOTAL</Text>
                <Text className="total-amount total-amount-nonrecurring">
                  ${nonRecurringTotal.toFixed(2)}
                </Text>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Upcoming Bills Section */}
      <section className="finance-section-card">
        <div className="section-header section-header-upcoming">
          <div className="section-title-container">
            <div className="section-icon-container">
              <IconHourglass size={16} className="icon-upcoming" />
            </div>
            <div>
              <Text className="section-title">Upcoming Bills</Text>
              {upcoming.length > 0 && (
                <Text className="section-subtitle">
                  {upcoming.length} {upcoming.length === 1 ? 'item' : 'items'}
                </Text>
              )}
            </div>
          </div>
          <Button 
            type="text" 
            className="section-toggle-button"
            icon={expanded.upcoming ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            onClick={() => toggleSection('upcoming')}
          />
        </div>
        
        <div className="section-content" style={{maxHeight: expanded.upcoming ? '1000px' : '0px'}}>
          {upcoming.length === 0 ? (
            <div className="empty-section">
              <Text type="secondary">No upcoming bills</Text>
            </div>
          ) : (
            <>
              <List
                className="apple-style-list"
                dataSource={upcoming}
                renderItem={(item, index) => (
                  <>
                    <List.Item className="feed-list-item">
                      <Avatar 
                        shape="square" 
                        className="feed-item-avatar"
                        style={{backgroundColor: 'rgba(250, 140, 22, 0.1)'}}
                        icon={getCategoryIcon(item.category, 16)}
                      />
                      <div className="feed-item-content">
                        <Text className="feed-item-title">{item.name}</Text>
                        <Text type="secondary" className="feed-item-subtitle">
                          Due {formatDueDate(item.dueDate)}
                        </Text>
                      </div>
                      <Text strong style={{color: '#FA8C16'}}>${Number(item.amount).toFixed(2)}</Text>
                    </List.Item>
                    {index < upcoming.length - 1 && <Divider className="item-divider" />}
                  </>
                )}
              />
              <div className="section-total">
                <Text className="total-label">SECTION TOTAL</Text>
                <Text className="total-amount total-amount-upcoming">
                  ${upcomingTotal.toFixed(2)}
                </Text>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="finance-section-card">
        <div className="section-header section-header-activity">
          <div className="section-title-container">
            <div className="section-icon-container">
              <IconClock size={16} className="icon-activity" />
            </div>
            <div>
              <Text className="section-title">Recent Activity</Text>
              {recentActivity.length > 0 && (
                <Text className="section-subtitle">
                  {recentActivity.length} {recentActivity.length === 1 ? 'item' : 'items'}
                </Text>
              )}
            </div>
          </div>
          <Button 
            type="text" 
            className="section-toggle-button"
            icon={expanded.recentActivity ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            onClick={() => toggleSection('recentActivity')}
          />
        </div>
        
        <div className="section-content" style={{maxHeight: expanded.recentActivity ? '1000px' : '0px'}}>
          {recentActivity.length === 0 ? (
            <div className="empty-section">
              <Text type="secondary">No recent activity</Text>
            </div>
          ) : (
            <>
              <List
                className="apple-style-list"
                dataSource={limitItems(recentActivity, 'recentActivity')}
                renderItem={(item, index) => (
                  <>
                    <List.Item className="feed-list-item">
                      <Space direction="vertical" size={0} style={{ width: '100%' }}>
                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space align="center">
                            <Avatar 
                              shape="square" 
                              className="feed-item-avatar"
                              style={{backgroundColor: 'rgba(114, 46, 209, 0.1)'}}
                              icon={<IconCircleCheck size={16} style={{ color: '#722ED1' }} />}
                            />
                            <Text strong style={{fontSize: '0.9rem'}}>{item.name}</Text>
                          </Space>
                          <Space direction="vertical" align="end" size={0}>
                            <Text strong style={{fontSize: '0.9rem'}}>${Number(item.amount).toFixed(2)}</Text>
                            <Text type="secondary" style={{ fontSize: '0.7rem' }}>{item.category}</Text>
                          </Space>
                        </Space>
                        <div style={{paddingLeft: 48}}>
                          <Text type="secondary" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                            <IconClock size={10} style={{ marginRight: 4 }} />
                            {daysAgo(item.dueDate)} days ago
                          </Text>
                        </div>
                      </Space>
                    </List.Item>
                    {index < limitItems(recentActivity, 'recentActivity').length - 1 && 
                      <Divider className="item-divider" />}
                  </>
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
              <div className="section-total">
                <Text className="total-label">SECTION TOTAL</Text>
                <Text className="total-amount total-amount-activity">
                  ${recentActivityTotal.toFixed(2)}
                </Text>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default MobileFinanceFeed;