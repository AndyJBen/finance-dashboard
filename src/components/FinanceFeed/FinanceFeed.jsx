// src/components/FinanceFeed/FinanceFeed.jsx
import React from 'react';
import { Row, Col, Typography } from 'antd';

// Import components for the Finance Feed
import BillPrepCard from '../FinancialSummary/BillPrepCard';
import PastDuePayments from '../RecentActivity/PastDuePayments';
import NonRecurringTransactions from '../RecentActivity/NonRecurringTransactions';
import UpcomingPayments from '../RecentActivity/UpcomingPayments';
import ActivityFeed from '../RecentActivity/ActivityFeed';

// Import the mobile-optimized Finance Feed component directly
import MobileFinanceFeed from './MobileFinanceFeed';

// Import the CSS file for mobile styling
import './MobileFinanceFeed.css';

const { Title } = Typography;

/**
 * Finance Feed component - A dedicated page showing financial activity
 * Components are arranged in a mobile-friendly layout
 */
const FinanceFeed = ({ isMobileView, onEditBill, onAddBill }) => {
  // Define styles for the container
  const containerStyle = {
    padding: isMobileView ? '0' : 'var(--space-16)',
    maxWidth: '100%',
  };

  // Define common card styles
  const cardStyle = {
    width: '100%',
    height: 'auto',
    marginBottom: isMobileView ? 'var(--space-16)' : 'var(--space-24)',
  };

  // For mobile view, use the new optimized MobileFinanceFeed component
  if (isMobileView) {
    return (
      <div className="finance-feed-mobile">
        <MobileFinanceFeed onEditBill={onEditBill} onAddBill={onAddBill} />
      </div>
    );
  }

  // For desktop view, we keep the layout exactly the same as before
  return (
    <div style={containerStyle} className="finance-feed-container">
      {/* Desktop view - Two column layout */}
      <Row gutter={[24, 24]}>
        {/* Left column - 2/3 width */}
        <Col xs={24} lg={16}>
          <PastDuePayments style={cardStyle} />
          <UpcomingPayments style={cardStyle} />
        </Col>
        
        {/* Right column - 1/3 width */}
        <Col xs={24} lg={8}>
          <BillPrepCard style={cardStyle} />
          <NonRecurringTransactions style={cardStyle} />
          <ActivityFeed style={cardStyle} />
        </Col>
      </Row>
    </div>
  );
};

export default FinanceFeed;