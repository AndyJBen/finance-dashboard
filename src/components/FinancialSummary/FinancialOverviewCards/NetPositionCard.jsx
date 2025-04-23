// src/components/FinancialSummary/FinancialOverviewCards/NetPositionCard.jsx

import React, { useContext } from 'react';
import { Card, Col, Space, Statistic, Typography } from 'antd';
import { IconCoinFilled } from '@tabler/icons-react';
import { FinanceContext } from '../../../contexts/FinanceContext';

const { Text } = Typography;

// Helper: format dollars and superscript cents (no dot)
const formatCurrencySuperscript = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '-';
  }

  const numericValue = Number(value);
  const sign = numericValue < 0 ? '-' : '';
  const formatted = Math.abs(numericValue).toFixed(2);
  const [dollars, cents] = formatted.split('.');
  const formattedDollars = parseInt(dollars, 10).toLocaleString('en-US');

  return (
    <span>
      {sign}${formattedDollars}
      <sup className="text-xs ml-px">{cents}</sup>
    </span>
  );
};

const NetPositionCard = ({ isMobile, styles, isComponentLoading }) => {
  const { bankBalance, currentDueAmt, totalCreditCardBalance } = useContext(FinanceContext);
  const combinedTotalDue = (currentDueAmt ?? 0) + (totalCreditCardBalance ?? 0);
  const grandTotal = bankBalance !== null ? bankBalance - combinedTotalDue : null;
  const grandTotalIsNegative = grandTotal !== null && grandTotal < 0;

  return (
    <Col xs={24} md={8}>
      <Card
        style={{
          background:
            grandTotal === null || isComponentLoading
              ? 'var(--neutral-100)'
              : grandTotalIsNegative
              ? 'linear-gradient(145deg, var(--danger-700), #A51F49)'
              : 'linear-gradient(145deg, var(--success-500), var(--success-700))',
          color: 'white',
          minHeight: styles.cardHeight,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: 'none',
          borderRadius: isMobile ? 8 : undefined,
          marginBottom: isMobile ? 8 : undefined,
        }}
        bodyStyle={{
          padding: styles.cardPadding,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 1,
        }}
      >
        <div>
          <Space align="center" style={{ marginBottom: styles.spaceMargin }}>
            <IconCoinFilled
              size={styles.iconSize.standard}
              style={{ opacity: 0.9, color: 'white' }}
            />
            <Text
              style={{
                fontSize: styles.fontSize.title,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              Net Position
            </Text>
          </Space>
        </div>
        <div>
          <Statistic
            value={isComponentLoading ? null : (grandTotal ?? 0)}
            valueStyle={{
              color: 'white',
              fontSize: styles.fontSize.value,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 0,
            }}
            formatter={formatCurrencySuperscript}
          />
        </div>
      </Card>
    </Col>
  );
};

export default NetPositionCard;
