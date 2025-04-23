// src/components/FinancialSummary/FinancialOverviewCards/DueBalanceCard.jsx
import React, { useContext } from 'react';
import { Card, Col, Space, Statistic, Typography } from 'antd';
import { IconFlagFilled, IconCircleCheck } from '@tabler/icons-react';
import { FinanceContext } from '../../../contexts/FinanceContext'; // Adjust path as needed

const { Text } = Typography;

// Helper function to format currency (Consider moving to a utils file)
const formatCurrency = (value) => {
  const number = Number(value) || 0;
  return number.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Component for the Due Balance card
const DueBalanceCard = ({ isMobile, styles, isComponentLoading }) => {
  // Get necessary data from context
  const {
    currentDueAmt,
    totalCreditCardBalance,
    hasAnyPastDueBills,
    pastDueAmountFromPreviousMonths,
  } = useContext(FinanceContext);

  // --- Calculations specific to this card ---
  const combinedTotalDue = (currentDueAmt ?? 0) + (totalCreditCardBalance ?? 0);
  const showDueWarning = (currentDueAmt ?? 0) > 0 || (totalCreditCardBalance ?? 0) > 0;
  const dueCardIcon = showDueWarning
    ? <IconFlagFilled size={isMobile ? styles.iconSize.standard : styles.iconSize.standard} /> // Use consistent size reference
    : <IconCircleCheck size={isMobile ? styles.iconSize.small : styles.iconSize.small} />;
  // --- End Calculations ---

  // --- Subtext Generation ---
  const generateDueSubtext = () => {
    const hasCCBalance = (totalCreditCardBalance ?? 0) > 0;
    const pastDueFormatted = formatCurrency(pastDueAmountFromPreviousMonths);
    const ccBalanceFormatted = formatCurrency(totalCreditCardBalance);
    let subtext = '';

    if (isMobile) {
      if (hasAnyPastDueBills && hasCCBalance) subtext = `${pastDueFormatted} Past | ${ccBalanceFormatted} CC`;
      else if (hasAnyPastDueBills) subtext = `${pastDueFormatted} Past`;
      else if (hasCCBalance) subtext = `${ccBalanceFormatted} CC`;
    } else {
      if (hasAnyPastDueBills && hasCCBalance) subtext = `Incl. ${pastDueFormatted} in Bill Prep | ${ccBalanceFormatted} CC`;
      else if (hasAnyPastDueBills) subtext = `Incl. ${pastDueFormatted} in Bill Prep`;
      else if (hasCCBalance) subtext = `Incl. ${ccBalanceFormatted} CC`;
    }

    if (subtext) {
      return (
        <Text style={{
          fontSize: styles.fontSize.subtext, // Use style definition
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.9)',
          opacity: 0.9,
          marginTop: '4px',
          display: 'block',
        }}>
          {subtext}
        </Text>
      );
    }
    return null;
  };
  // --- End Subtext Generation ---

  return (
    <Col xs={24} md={8}>
      <Card
        style={{
          background: showDueWarning
            ? 'linear-gradient(145deg, var(--danger-500), var(--danger-700))' // Red gradient if due
            : 'linear-gradient(145deg, var(--success-500), var(--success-700))', // Green gradient if zero due
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
          },
        }}
      >
        {/* Top section: Icon and Title */}
        <div>
          <Space align="center" style={{ marginBottom: styles.spaceMargin }}>
            {React.cloneElement(dueCardIcon, {
              style: {
                // Ensure icon size is applied correctly via styles prop if needed, or direct size prop works
                opacity: 0.9,
                color: 'white',
              },
            })}
            <Text style={{
              fontSize: styles.fontSize.title,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.9)',
            }}>
              Due Balance
            </Text>
          </Space>
        </div>
        {/* Bottom section: Statistic Value and Subtext */}
        <div>
          <Statistic
            value={isComponentLoading ? "-" : (combinedTotalDue ?? 0)} // Show '-' while loading
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
          {!isComponentLoading && generateDueSubtext()}
        </div>
      </Card>
    </Col>
  );
};

export default DueBalanceCard;
