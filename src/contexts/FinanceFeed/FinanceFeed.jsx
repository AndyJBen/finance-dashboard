// src/components/FinanceFeed/FinanceFeed.jsx
import React from 'react';
import { Row, Col, Typography } from 'antd';

// Import components for the Finance Feed
import BillPrepCard from '../FinancialSummary/BillPrepCard';
import PastDuePayments from '../RecentActivity/PastDuePayments';
import NonRecurringTransactions from '../RecentActivity/NonRecurringTransactions';
import UpcomingPayments from '../RecentActivity/UpcomingPayments';
import ActivityFeed from '../RecentActivity/ActivityFeed';

const { Title } = Typography;

/**
 * Finance Feed component - A dedicated page showing financial activity
 * Components are arranged in a mobile-friendly layout
 */
const FinanceFeed = ({ isMobileView, onEditBill, onAddBill }) => {
  // Define styles for the container
  const containerStyle = {
    padding: isMobileView ? 'var(--space-8) var(--space-4)' : 'var(--space-16)',
    maxWidth: '100%',
  };

  // Define common card styles
  const cardStyle = {
    width: '100%',
    height: 'auto',
    marginBottom: isMobileView ? 'var(--space-16)' : 'var(--space-24)',
  };

  // For mobile view, we use a single column layout with optimized spacing
  if (isMobileView) {
    return (
      <div style={containerStyle} className="finance-feed-container">
        <Title 
          level={4} 
          style={{ 
            marginBottom: 'var(--space-16)', 
            fontSize: '1.25rem',
            textAlign: 'left',
            color: 'var(--neutral-800)'
          }}
        >
          Finance Feed
        </Title>
        
        {/* Mobile view - Single column layout */}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'var(--space-16)',
            width: '100%'
          }}
        >
          {/* Order is important for mobile: most urgent/important first */}
          <PastDuePayments style={{...cardStyle, marginBottom: 0}} />
          <BillPrepCard style={{...cardStyle, marginBottom: 0}} />
          <NonRecurringTransactions style={{...cardStyle, marginBottom: 0}} />
          <UpcomingPayments style={{...cardStyle, marginBottom: 0}} />
          <ActivityFeed style={{...cardStyle, marginBottom: 0}} />
        </div>
      </div>
    );
  }

  // For desktop view, we keep the layout similar to the dashboard
  return (
    <div style={containerStyle} className="finance-feed-container">
      <Title 
        level={3} 
        style={{ 
          marginBottom: 'var(--space-24)',
          color: 'var(--neutral-800)'
        }}
      >
        Finance Feed
      </Title>
      
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