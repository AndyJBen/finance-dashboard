// src/components/skeletons/FinancialOverviewSkeleton.jsx
import React from 'react';
import { Row, Col, Card, Skeleton } from 'antd';

/**
 * A skeleton loading component that mimics the layout of the
 * FinancialOverviewCardsContainer. It shows placeholder cards
 * while the actual data is loading.
 */
const FinancialOverviewSkeleton = () => {
  // Define styles for consistency, similar to the actual cards
  const cardStyle = {
    minHeight: '90px', // Match mobile height or a reasonable default
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: 'none', // Match card style
    borderRadius: 10, // Match card style
  };
  
  const bodyStyle = {
    padding: '8px 10px', // Match mobile padding or a reasonable default
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  return (
    // Use Ant Design Row and Col for layout consistency
    <Row gutter={[8, 8]} style={{ marginBottom: 8 }} className="financial-overview-skeleton">
      {/* Create 3 placeholder columns */}
      {[1, 2, 3].map(i => (
        <Col xs={8} sm={8} md={8} key={i}>
          {/* Use Ant Design Card and Skeleton components */}
          <Card style={cardStyle} bodyStyle={bodyStyle} className="skeleton-card">
            {/* Skeleton for the title/icon area */}
            <Skeleton.Input
              active // Show animation
              size="small" // Smaller size for title area
              className="skeleton-title"
              style={{ marginBottom: 16, height: '16px' }} // Adjusted height
            />
            {/* Skeleton for the main value area */}
            <Skeleton.Input
              active // Show animation
              size="large" // Larger size for value area
              className="skeleton-value"
              style={{ height: '24px' }} // Adjusted height
              block // Make it take full width available
            />
          </Card>
        </Col>
      ))}
      
      {/* Add styles for mobile-specific adjustments */}
      <style jsx>{`
        .financial-overview-skeleton .skeleton-title {
          width: 60%; /* Default desktop width */
        }
        
        .financial-overview-skeleton .skeleton-value {
          width: 80%; /* Default desktop width */
        }
        
        @media (max-width: 768px) {
          .financial-overview-skeleton .skeleton-title {
            width: 50% !important; /* Mobile width */
          }
          
          .financial-overview-skeleton .skeleton-value {
            width: 70% !important; /* Mobile width */
          }
        }
      `}</style>
    </Row>
  );
};

export default FinancialOverviewSkeleton;