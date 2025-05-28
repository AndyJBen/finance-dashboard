import React, { useContext } from 'react';
// Import Card, Progress, Spin, Alert, Typography, Row, Col, Statistic
import { Card, Progress, Spin, Alert, Typography, Row, Col, Statistic } from 'antd';
// Import Tabler icons
import {
    IconCalendar, // New title icon
    IconCircleCheck, // Icon for Paid
    IconClock, // Icon for Remaining
    IconCurrencyDollar // Icon for Total Amount
} from '@tabler/icons-react';
import { FinanceContext } from '../../../contexts/FinanceContext';
import './MonthlyProgressCard.css';

const { Text, Title } = Typography;

const MonthlyProgressCard = ({ style }) => {
  const { loading, error, paidBills, totalBills, totalAmountDue, totalExpenses } = useContext(FinanceContext);

  // Calculate percentage, handle division by zero
  const percentPaid = totalBills > 0 ? Math.round((paidBills / totalBills) * 100) : 0;
  // Calculate total bill amount (paid + unpaid)
  const totalBillAmount = totalExpenses + totalAmountDue;

  // Use totalExpenses for 'Paid' amount as it sums paid bills
  // Use totalAmountDue for 'Remaining' amount

  if (error && !loading) { // Show error only if not loading initially
    return <Alert message="Error loading monthly progress" type="warning" showIcon style={style} />;
  }

  return (
    <Spin spinning={loading} size="small">
      <Card
        style={style} // Pass style prop for margins etc.
        // Styling from global CSS (radius, shadow)
        // Use variant="borderless" if desired
      >
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}> {/* Adjusted alignment and margin */}
          <div>
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', marginBottom: 'var(--space-4)' }}> {/* Added bottom margin */}
              {/* Changed Icon to Tabler */}
              <IconCalendar size={18} style={{ marginRight: 'var(--space-8)', color: 'var(--primary-600)' }} />
              Monthly Bills
            </Title>
            {/* Display Paid/Total count */}
            {totalBills > 0 && (
                 <Text type="secondary" style={{ fontSize: '0.875rem' }}>
                    {paidBills} / {totalBills} Bills Paid
                 </Text>
            )}
          </div>
          {/* Percentage Badge (optional, could be removed if count is preferred) */}
          {totalBills > 0 && (
              <Text style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--primary-600)',
                  backgroundColor: 'var(--primary-100)',
                  padding: '0.25rem 0.625rem',
                  borderRadius: 'var(--radius-full)',
                  whiteSpace: 'nowrap' // Prevent wrapping
              }}>
                {percentPaid}% Complete
              </Text>
          )}
        </div>

        {/* Progress Bar */}
        {totalBills > 0 && ( // Only show progress bar if there are bills
            <Progress
                percent={percentPaid}
                strokeColor="var(--success-500)" // Use success color from variables
                trailColor="var(--neutral-200)"
                showInfo={false} // Hide default percentage text
                style={{ marginBottom: 'var(--space-20)' }}
                size="small" // Make bar thinner
            />
        )}

        {/* Stats Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div className="stat-card-item"> {/* Use class for potential styling */}
              <Statistic
                // Added Icon
                title={<Text type="secondary" style={{ fontSize: '0.75rem' }}>Total Amount</Text>}
                value={totalBillAmount}
                precision={2}
                prefix={<IconCurrencyDollar size={16} style={{ color: 'var(--neutral-900)'}}/>} // Added Tabler icon
                valueStyle={{ fontSize: '1rem', fontWeight: 700, color: 'var(--neutral-900)' }}
              />
            </div>
          </Col>
          <Col xs={24} sm={8}>
             <div className="stat-card-item">
               <Statistic
                // Added Icon
                title={<Text type="secondary" style={{ fontSize: '0.75rem' }}>Paid</Text>}
                value={totalExpenses} // Sum of paid bills from context
                precision={2}
                prefix={<IconCircleCheck size={16} style={{ color: 'var(--success-500)'}}/>} // Added Tabler icon
                valueStyle={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success-500)' }} // Success color
              />
            </div>
          </Col>
          <Col xs={24} sm={8}>
             <div className="stat-card-item">
               <Statistic
                // Added Icon
                title={<Text type="secondary" style={{ fontSize: '0.75rem' }}>Remaining</Text>}
                value={totalAmountDue} // Sum of unpaid bills from context
                precision={2}
                prefix={<IconClock size={16} style={{ color: 'var(--danger-500)'}}/>} // Added Tabler icon
                valueStyle={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger-500)' }} // Danger color
              />
            </div>
          </Col>
        </Row>
         {totalBills === 0 && !loading && (
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 'var(--space-16)'}}> {/* Centered text */}
                No bills found for this period.
            </Text>
         )}
      </Card>
    </Spin>
  );
};

export default MonthlyProgressCard;