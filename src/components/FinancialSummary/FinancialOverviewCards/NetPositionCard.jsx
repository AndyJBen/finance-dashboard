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
    <span className="currency-wrapper">
      {sign}${formattedDollars}
      <sup className="cents-superscript">{cents}</sup>
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
          minHeight: isMobile ? '90px' : styles.cardHeight,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: 'none',
          borderRadius: isMobile ? 8 : undefined,
          marginBottom: isMobile ? 8 : undefined,
        }}
        bodyStyle={{
          padding: isMobile ? '8px 10px' : styles.cardPadding,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 1,
        }}
      >
        <div>
          <Space align="center" style={{ marginBottom: isMobile ? 4 : styles.spaceMargin, height: isMobile ? '18px' : '22px' }}>
            <IconCoinFilled
              size={styles.iconSize.standard}
              style={{ opacity: 0.9, color: 'white', display: 'flex' }}
            />
            <Text
              style={{
                fontSize: isMobile ? '0.8rem' : styles.fontSize.title,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
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
              fontSize: isMobile ? '18px' : styles.fontSize.value,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 0,
            }}
            formatter={formatCurrencySuperscript}
          />
        </div>
      </Card>
      <style jsx>{`
        .currency-wrapper {
          position: relative;
          display: inline-flex;
          align-items: flex-start;
        }
        
        .cents-superscript {
          font-size: ${isMobile ? '40%' : '45%'};
          margin-left: 2px;
          font-weight: inherit;
          line-height: 1;
          opacity: 0.85;
          vertical-align: text-top;
          margin-top: ${isMobile ? '2px' : '4px'};
        }
      `}</style>
    </Col>
  );
};

export default NetPositionCard;