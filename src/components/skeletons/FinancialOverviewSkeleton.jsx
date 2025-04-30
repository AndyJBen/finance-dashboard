// src/components/skeletons/FinancialOverviewSkeleton.jsx
import React from 'react';
import { Row, Col, Card, Skeleton } from 'antd';

/**
 * A skeleton loading component that mimics the layout of the
 * FinancialOverviewCardsContainer. It shows placeholder cards
 * while the actual data is loading.
 */
const FinancialOverviewSkeleton = () => {
  // Define styles for consistency
  const cardStyle = {
    minHeight: '90px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: 'none',
    borderRadius: 10,
  };
  const bodyStyle = {
    padding: '8px 10px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  return (
    <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
      {[1, 2, 3].map(i => (
        <Col xs={8} sm={8} md={8} key={i}>
          <Card style={cardStyle} bodyStyle={bodyStyle}>
            <Skeleton.Input
              active
              size="small"
              // Use default desktop width, mobile width will be applied via CSS
              style={{ width: '60%', marginBottom: 16, height: '16px' }}
              className="skeleton-title"
            />
            <Skeleton.Input
              active
              size="large"
              // Use default desktop width, mobile width will be applied via CSS
              style={{ width: '80%', height: '24px' }}
              className="skeleton-value"
              block
            />
          </Card>
        </Col>
      ))}
      
      {/* Add inline style for mobile-only adjustment */}
      <style jsx>{`
        @media (max-width: 768px) {
          .skeleton-title {
            width: 50% !important;
          }
          .skeleton-value {
            width: 70% !important;
          }
        }
      `}</style>
    </Row>
  );
};

export default FinancialOverviewSkeleton;
