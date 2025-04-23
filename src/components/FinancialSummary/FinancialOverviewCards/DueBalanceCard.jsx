// src/components/FinancialSummary/FinancialOverviewCards/DueBalanceCard.jsx

import React, { useContext } from 'react';
import { Card, Col, Space, Statistic, Typography } from 'antd';
import { IconFlagFilled, IconCircleCheck } from '@tabler/icons-react';
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

// Basic currency for subtext
const formatCurrency = (value) => {
  const number = Number(value) || 0;
  return number.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const DueBalanceCard = ({ isMobile, styles, isComponentLoading }) => {
  const {
    currentDueAmt,
    totalCreditCardBalance,
    hasAnyPastDueBills,
    pastDueAmountFromPreviousMonths,
  } = useContext(FinanceContext);

  const combinedTotalDue = (currentDueAmt ?? 0) + (totalCreditCardBalance ?? 0);
  const showDueWarning =
    (currentDueAmt ?? 0) > 0 ||
    (totalCreditCardBalance ?? 0) > 0 ||
    hasAnyPastDueBills;

  const dueCardIcon = showDueWarning ? (
    <IconFlagFilled size={styles.iconSize.standard} />
  ) : (
    <IconCircleCheck size={styles.iconSize.small} />
  );

  const generateDueSubtext = () => {
    const hasCC = (totalCreditCardBalance ?? 0) > 0;
    const past = formatCurrency(pastDueAmountFromPreviousMonths);
    const cc = formatCurrency(totalCreditCardBalance);
    let subtext = '';

    if (isMobile) {
      if (hasAnyPastDueBills && hasCC) subtext = `${past} Past | ${cc} CC`;
      else if (hasAnyPastDueBills) subtext = `${past} Past`;
      else if (hasCC) subtext = `${cc} CC`;
    } else {
      if (hasAnyPastDueBills && hasCC) subtext = `Incl. ${past} in Bill Prep | ${cc} CC`;
      else if (hasAnyPastDueBills) subtext = `Incl. ${past} in Bill Prep`;
      else if (hasCC) subtext = `Incl. ${cc} CC`;
    }

    return subtext ? (
      <Text
        style={{
          fontSize: styles.fontSize.subtext,
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.9)',
          opacity: 0.9,
          marginTop: '4px',
          display: 'block',
        }}
      >
        {subtext}
      </Text>
    ) : null;
  };

  return (
    <Col xs={24} md={8}>
      <Card
        style={{
          background: showDueWarning
            ? 'linear-gradient(145deg, var(--danger-500), var(--danger-700))'
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
        }}
      >
        <div>
          <Space align="center" style={{ marginBottom: styles.spaceMargin, height: "22px" }}>
            {React.cloneElement(dueCardIcon, {
              style: { opacity: 0.9, color: 'white', display: 'flex' },
            })}
            <Text
              style={{
                fontSize: styles.fontSize.title,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Due Balance
            </Text>
          </Space>
        </div>
        <div>
          <Statistic
            value={isComponentLoading ? null : combinedTotalDue}
            valueStyle={{
              color: 'white',
              fontSize: styles.fontSize.value,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 0,
            }}
            formatter={formatCurrencySuperscript}
          />
          {!isComponentLoading && generateDueSubtext()}
        </div>
      </Card>
      <style jsx>{`
        .currency-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center; /* Changed to center alignment */
        }
        
        .cents-superscript {
          font-size: 45%;
          margin-left: 2px;
          font-weight: inherit;
          position: relative;
          top: -40%; /* This positions the cents to align with the dollar digits */
          line-height: 1;
          opacity: 0.85;
        }
      `}</style>
    </Col>
  );
};

export default DueBalanceCard;