// src/components/FinancialSummary/FinancialOverviewCards/NetPositionCard.jsx
import React, { useContext } from 'react';
import { Card, Col, Space, Statistic, Typography } from 'antd';
import { IconCoinFilled } from '@tabler/icons-react';
import { FinanceContext } from '../../../contexts/FinanceContext'; // Adjust path as needed

const { Text } = Typography;

// Helper function to format currency (Consider moving to a utils file)
const formatCurrency = (value) => {
  const number = Number(value) || 0;
  return number.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Component for the Net Position card
const NetPositionCard = ({ isMobile, styles, isComponentLoading }) => {
  // Get necessary data from context
  const { bankBalance, currentDueAmt, totalCreditCardBalance } = useContext(FinanceContext);

  // --- Calculations specific to this card ---
  const combinedTotalDue = (currentDueAmt ?? 0) + (totalCreditCardBalance ?? 0);
  const grandTotal = (bankBalance !== null) ? bankBalance - combinedTotalDue : null;
  const grandTotalIsNegative = grandTotal !== null && grandTotal < 0;
  // --- End Calculations ---

  return (
    <Col xs={24} md={8}>
      <Card
        style={{
          background: grandTotal === null
            ? 'var(--neutral-100)' // Neutral background while loading
            : grandTotalIsNegative
              ? 'linear-gradient(145deg, var(--danger-700), #A51F49)' // Red gradient if negative
              : 'linear-gradient(145deg, var(--success-500), var(--success-700))', // Green gradient if positive
          color: 'white',
          minHeight: styles.cardHeight,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: 'none',
          borderRadius: isMobile ? 8 : undefined, // Rounded corners on mobile
          marginBottom: isMobile ? 8 : undefined,
        }}
        styles={{
          body: {
            padding: styles.cardPadding,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 1,
          },
        }}
      >
        {/* Top section: Icon and Title */}
        <div>
          <Space align="center" style={{ marginBottom: styles.spaceMargin }}>
            <IconCoinFilled
              size={styles.iconSize.standard}
              style={{ opacity: 0.9, color: 'white' }}
            />
            <Text style={{
              fontSize: styles.fontSize.title,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.9)',
            }}>
              Net Position
            </Text>
          </Space>
        </div>
        {/* Bottom section: Statistic Value */}
        <div>
          <Statistic
            value={isComponentLoading ? "-" : (grandTotal ?? 0)} // Show '-' while loading
            precision={2}
            valueStyle={{
              color: 'white',
              fontSize: styles.fontSize.value,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 0,
            }}
            formatter={formatCurrency}
          />
        </div>
      </Card>
    </Col>
  );
};

export default NetPositionCard;
