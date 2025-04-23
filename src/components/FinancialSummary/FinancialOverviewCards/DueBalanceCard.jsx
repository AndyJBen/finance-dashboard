// src/components/FinancialSummary/FinancialOverviewCards/DueBalanceCard.jsx
// Highlight: Added formatCurrencySuperscript function and updated Statistic component.

import React, { useContext } from 'react';
import { Card, Col, Space, Statistic, Typography } from 'antd';
import { IconFlagFilled, IconCircleCheck } from '@tabler/icons-react';
import { FinanceContext } from '../../../contexts/FinanceContext'; // Adjust path as needed

const { Text } = Typography;

// Helper function to format currency with superscript cents using Tailwind CSS
const formatCurrencySuperscript = (value) => {
  // Handle loading state or null/undefined/NaN values
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '-'; // Display a dash for loading or invalid states
  }

  const numericValue = Number(value);
  const sign = numericValue < 0 ? '-' : '';
  // Format the absolute value to ensure two decimal places for splitting
  const formatted = Math.abs(numericValue).toFixed(2);
  const [dollars, cents] = formatted.split('.');

  // Add commas to the dollar part
  const formattedDollars = parseInt(dollars, 10).toLocaleString('en-US');

  return (
    // Use spans and Tailwind classes for styling
    // Ensure your project's Tailwind setup includes these classes
    <span>
      {sign}${formattedDollars}
      {/* Styling for cents: smaller text, aligned top, slightly raised, small left margin */}
      <span className="text-xs align-top relative top-[-0.3em] ml-px">.{cents}</span>
    </span>
  );
};

// Helper function to format currency (basic string version - kept for subtext)
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
  const showDueWarning = (currentDueAmt ?? 0) > 0 || (totalCreditCardBalance ?? 0) > 0 || hasAnyPastDueBills; // Include past due check
  const dueCardIcon = showDueWarning
    ? <IconFlagFilled size={isMobile ? styles.iconSize.standard : styles.iconSize.standard} /> // Use consistent size reference
    : <IconCircleCheck size={isMobile ? styles.iconSize.small : styles.iconSize.small} />;
  // --- End Calculations ---

  // --- Subtext Generation ---
  const generateDueSubtext = () => {
    const hasCCBalance = (totalCreditCardBalance ?? 0) > 0;
    // Use the basic formatCurrency for the subtext parts
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
            value={isComponentLoading ? null : (combinedTotalDue ?? 0)} // Pass raw value or null
            // precision prop is removed as formatter handles it
            valueStyle={{
              color: 'white',
              fontSize: styles.fontSize.value,
              fontWeight: 700,
              lineHeight: 1.2, // Adjust line height if needed for superscript alignment
              marginBottom: 0,
            }}
            formatter={formatCurrencySuperscript} // Use the new JSX formatter
          />
          {!isComponentLoading && generateDueSubtext()}
        </div>
      </Card>
    </Col>
  );
};

export default DueBalanceCard;
