// MobileFinanceFeed.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Card, Space, List, Badge, Tag, Avatar, Button, Select, Spin } from 'antd';
import {
  IconAlertOctagon,
  IconClipboardList,
  IconRepeatOff,
  IconChevronUp,
  IconCircleCheck,
  IconClock,
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react';
import { categoryIcons } from '../../utils/categoryIcons';

import { fetchBills } from '../../services/api';
import dayjs from 'dayjs';
import './styles/MobileFinanceFeed.css';

const { Text, Title } = Typography;


const MobileFinanceFeed = () => {

  const [feedMonth, setFeedMonth] = useState(dayjs());
  const [feedBills, setFeedBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeedBills = useCallback(async (target = feedMonth) => {
    setLoading(true);
    try {
      const data = await fetchBills(target.format('YYYY-MM'), true);
      setFeedBills(Array.isArray(data) ? data : []);
    } catch {
      setFeedBills([]);
    } finally {
      setLoading(false);
    }
  }, [feedMonth]);

  useEffect(() => { loadFeedBills(); }, [feedMonth, loadFeedBills]);

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Get the data we need for each section using the locally loaded bills
  const pastDueBills = feedBills.filter(bill => {
    const dueDate = dayjs(bill.dueDate);
    const isBillPrep = bill.category?.toLowerCase() === 'bill prep';
    return !bill.isPaid && !isBillPrep && dueDate.isValid() && dueDate.isBefore(feedMonth.startOf('month'));
  });

  // Bill Prep items
  const billPrepItems = feedBills.filter(bill =>
    bill.category?.toLowerCase() === 'bill prep' && !bill.isPaid
  );

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
  const nonRecurring = feedBills.filter(bill => !bill.isRecurring);

  // Upcoming Bills (unpaid bills with future due dates)
  const today = new Date();
  const upcoming = feedBills.filter(bill =>
    !bill.isPaid && new Date(bill.dueDate) >= today
  );

  // Recent Activity (paid bills, ordered by payment date)
  const recentActivity = feedBills
    .filter(bill => bill.isPaid)
    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
    .slice(0, 10);

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
    pastDue: false,
    billPrep: false,
    nonRecurring: false,
    upcoming: false,
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
  const limitItems = (items, section, limit = 4) => {
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
  const SectionCard = ({ title, icon, children, section, empty = false, count, emptyText }) => (
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
              {count !== undefined && (
                <Badge
                  count={`${count} ${count === 1 ? 'Item' : 'Items'}`}
                  showZero={true} // Always show zero
                  style={{ 
                    backgroundColor: empty ? '#e0e0e0' : '#0066FF',
                    marginLeft: 8,
                    fontSize: '0.7rem',
                    minWidth: 18, // Auto-adjust for any text length
                    height: 18,
                    borderRadius: 9,
                    color: '#fff',
                    fontWeight: 'bold',
                    lineHeight: '18px',
                    padding: '0 8px', // Consistent padding for all states
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
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
    <Spin spinning={loading}>
    <div className="finance-feed-mobile">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <Button
          type="text"
          icon={<IconChevronLeft size={16} />}
          onClick={() => setFeedMonth(prev => prev.subtract(1, 'month'))}
        />
        <span style={{ flexGrow: 1, textAlign: 'center', fontWeight: 600 }}>
          {feedMonth.format('MMMM')}
        </span>
        <Button
          type="text"
          icon={<IconChevronRight size={16} />}
          onClick={() => setFeedMonth(prev => prev.add(1, 'month'))}
        />
        <Select
          value={feedMonth.year()}
          style={{ width: 80, marginLeft: 8 }}
          onChange={year => setFeedMonth(prev => prev.year(year))}
        >
          {Array.from({ length: 5 }, (_, i) => dayjs().year() - 2 + i).map(y => (
            <Select.Option key={y} value={y}>{y}</Select.Option>
          ))}
        </Select>
      </div>
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
          dataSource={limitItems(pastDueBills, 'pastDue')}
          renderItem={item => (
            <List.Item className="feed-list-item">
              <Avatar
                shape="circle"
                className="feed-item-avatar"
                style={{ backgroundColor: '#FFF5F5', borderRadius: 30 }}
                icon={
                  <span className="material-symbols-outlined">
                    {categoryIcons[item.category] || 'category'}
                  </span>
                }
              />
              <div className="feed-item-content">
                <Text className="feed-item-title">{item.name}</Text>
                <Text type="danger" className="due-date-text">
                  Due {daysAgo(item.dueDate)} days ago
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text strong style={{ color: '#F1476F' }}>
                  ${formatAmount(item.amount)}
                </Text>
                <Text type="secondary" style={{ fontSize: '0.7rem', display: 'block' }}>
                  {item.category}
                </Text>
              </div>
            </List.Item>
          )}
        />
        {pastDueBills.length > 4 && (
          <div
            className="show-more-container"
            onClick={() => toggleShowAll('pastDue')}
            style={{ cursor: 'pointer' }}
          >
            <Button
              type="link"
              className="show-more-button"
              style={{ color: '#F1476F' }}
              onClick={(e) => {
                e.stopPropagation();
                toggleShowAll('pastDue');
              }}
            >
              {showAll.pastDue ? 'Show Less' : 'Show All'}
            </Button>
          </div>
        )}
        {pastDueBills.length > 0 && (
          <div className="section-total">
            <Text className="total-label">SECTION TOTAL</Text>
            <Text className="total-amount total-amount-pastdue">
              ${formatAmount(pastDueTotal)}
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
          dataSource={limitItems(billPrep, 'billPrep')}
          renderItem={item => (
            <List.Item className="feed-list-item">
              <Avatar
                shape="circle"
                className="feed-item-avatar"
                style={{ backgroundColor: '#EBF5FF', borderRadius: 30 }}
                icon={
                  <span className="material-symbols-outlined">
                    {categoryIcons[item.category] || 'category'}
                  </span>
                }
              />
              <div className="feed-item-content">
                <Text className="feed-item-title">{item.name}</Text>
                <Text type="secondary" className="feed-item-subtitle">
                  {item.bills.length} {item.bills.length === 1 ? 'Item' : 'Items'}
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text strong style={{ color: '#1890FF' }}>
                  ${formatAmount(item.totalAmount)}
                </Text>
                <Text type="secondary" style={{ fontSize: '0.7rem', display: 'block' }}>
                  {item.category}
                </Text>
              </div>
            </List.Item>
          )}
        />
        {billPrep.length > 4 && (
          <div
            className="show-more-container"
            onClick={() => toggleShowAll('billPrep')}
            style={{ cursor: 'pointer' }}
          >
            <Button
              type="link"
              className="show-more-button"
              style={{ color: '#1890FF' }}
              onClick={(e) => {
                e.stopPropagation();
                toggleShowAll('billPrep');
              }}
            >
              {showAll.billPrep ? 'Show Less' : 'Show All'}
            </Button>
          </div>
        )}
        {billPrep.length > 0 && (
          <div className="section-total">
            <Text className="total-label">SECTION TOTAL</Text>
            <Text className="total-amount total-amount-billprep">
              ${formatAmount(billPrepTotal)}
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
                icon={
                  <span className="material-symbols-outlined">
                    {categoryIcons[item.category] || 'category'}
                  </span>
                }
              />
              <div className="feed-item-content">
                <Text className="feed-item-title">{item.name}</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Text type="secondary" className="due-date-text">
                    {daysAgo(item.dueDate)} days ago
                  </Text>
                  {item.isPaid && (
                    <Tag className="status-tag status-tag-paid">Paid</Tag>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text strong style={{ color: item.isPaid ? '#26C67B' : '#F1476F' }}>
                  ${formatAmount(item.amount)}
                </Text>
                <Text type="secondary" style={{ fontSize: '0.7rem', display: 'block' }}>
                  {item.category}
                </Text>
              </div>
            </List.Item>
          )}
        />
        {nonRecurring.length > 4 && (
          <div
            className="show-more-container"
            onClick={() => toggleShowAll('nonRecurring')} // Added onClick here to make whole area clickable
            style={{
              textAlign: 'center',
              marginTop: 'var(--space-12)',
              paddingBottom: 'var(--space-4)',
              cursor: 'pointer' // Add cursor pointer to indicate clickable
            }}
          >
            <Button
              type="link"
              className="show-more-button"
              style={{color: '#52C41A'}}
              onClick={(e) => {
                e.stopPropagation(); // Prevent double triggering
                toggleShowAll('nonRecurring');
              }}
            >
              {showAll.nonRecurring ? 'Show Less' : 'Show All'}
            </Button>
          </div>
        )}
        {nonRecurring.length > 0 && (
          <div className="section-total">
            <Text className="total-label">SECTION TOTAL</Text>
            <Text className="total-amount total-amount-nonrecurring">
              ${formatAmount(nonRecurringTotal)}
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
          dataSource={limitItems(upcoming, 'upcoming')}
          renderItem={item => (
            <List.Item className="feed-list-item">
              <Avatar
                shape="circle"
                className="feed-item-avatar"
                style={{ backgroundColor: '#EBF5FF', borderRadius: 30 }}
                icon={
                  <span className="material-symbols-outlined">
                    {categoryIcons[item.category] || 'category'}
                  </span>
                }
              />
              <div className="feed-item-content">
                <Text className="feed-item-title">{item.name}</Text>
                <Text type="secondary" className="feed-item-subtitle">
                  Due {formatDueDate(item.dueDate)}
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text strong style={{ color: '#0066FF' }}>
                  ${formatAmount(item.amount)}
                </Text>
                <Text type="secondary" style={{ fontSize: '0.7rem', display: 'block' }}>
                  {item.category}
                </Text>
              </div>
            </List.Item>
          )}
        />
        {upcoming.length > 4 && (
          <div
            className="show-more-container"
            onClick={() => toggleShowAll('upcoming')}
            style={{ cursor: 'pointer' }}
          >
            <Button
              type="link"
              className="show-more-button"
              style={{ color: '#0066FF' }}
              onClick={(e) => {
                e.stopPropagation();
                toggleShowAll('upcoming');
              }}
            >
              {showAll.upcoming ? 'Show Less' : 'Show All'}
            </Button>
          </div>
        )}
        {upcoming.length > 0 && (
          <div className="section-total">
            <Text className="total-label">SECTION TOTAL</Text>
            <Text className="total-amount total-amount-upcoming">
              ${formatAmount(upcomingTotal)}
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
              <Avatar
                shape="circle"
                className="feed-item-avatar"
                style={{ backgroundColor: 'rgba(114, 46, 209, 0.1)' }}
                icon={<IconCircleCheck size={16} style={{ color: '#722ED1' }} />}
              />
              <div className="feed-item-content">
                <Text className="feed-item-title">{item.name}</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconClock size={10} style={{ marginRight: 2 }} />
                  <Text type="secondary" className="due-date-text">
                    {daysAgo(item.dueDate)} days ago
                  </Text>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text strong>${formatAmount(item.amount)}</Text>
                <Text type="secondary" style={{ fontSize: '0.7rem', display: 'block' }}>
                  {item.category}
                </Text>
              </div>
            </List.Item>
          )}
        />
        {recentActivity.length > 4 && (
          <div
            className="show-more-container"
            onClick={() => toggleShowAll('recentActivity')}
            style={{ cursor: 'pointer' }}
          >
            <Button
              type="link"
              className="show-more-button"
              style={{ color: '#722ED1' }}
              onClick={(e) => {
                e.stopPropagation();
                toggleShowAll('recentActivity');
              }}
            >
              {showAll.recentActivity ? 'Show Less' : 'Show All'}
            </Button>
          </div>
        )}
        {recentActivity.length > 0 && (
          <div className="section-total">
            <Text className="total-label">SECTION TOTAL</Text>
            <Text className="total-amount total-amount-activity">
              ${formatAmount(recentActivityTotal)}
            </Text>
          </div>
        )}
      </SectionCard>
    </div>
    </Spin>
  );
};

export default MobileFinanceFeed;