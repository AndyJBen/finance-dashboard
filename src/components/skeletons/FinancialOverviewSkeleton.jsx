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
    <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
      {/* Create 3 placeholder columns */}
      {[1, 2, 3].map(i => (
        <Col xs={8} sm={8} md={8} key={i}>
          {/* Use Ant Design Card and Skeleton components */}
          <Card style={cardStyle} bodyStyle={bodyStyle}>
            {/* Skeleton for the title/icon area */}
            <Skeleton.Input
              active // Show animation
              size="small" // Smaller size for title area
              style={{ width: '60%', marginBottom: 16, height: '16px' }} // Adjusted width and height
            />
            {/* Skeleton for the main value area */}
            <Skeleton.Input
              active // Show animation
              size="large" // Larger size for value area
              style={{ width: '80%', height: '24px' }} // Adjusted width and height
              block // Make it take full width available
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default FinancialOverviewSkeleton;
