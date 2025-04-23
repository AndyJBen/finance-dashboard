// src/components/FinancialSummary/FinancialOverviewCards/NetPositionCard.jsx
// Highlight: Added formatCurrencySuperscript function and updated Statistic component.

import React, { useContext } from 'react';
import { Card, Col, Space, Statistic, Typography } from 'antd';
import { IconCoinFilled } from '@tabler/icons-react';
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


// Component for the Net Position card
const NetPositionCard = ({ isMobile, styles, isComponentLoading }) => {
  // Get necessary data from context
  const { bankBalance, currentDueAmt, totalCreditCardBalance } = useContext(FinanceContext);

  // --- Calculations specific to this card ---
  const combinedTotalDue = (currentDueAmt ?? 0) + (totalCreditCardBalance ?? 0);
  const grandTotal = (bankBalance !== null) ? bankBalance - combinedTotalDue : null; // Handle null bankBalance
  const grandTotalIsNegative = grandTotal !== null && grandTotal < 0;
  // --- End Calculations ---

  return (
    <Col xs={24} md={8}>
      <Card
        style={{
          background: grandTotal === null || isComponentLoading // Check loading state
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
            zIndex: 1, // Keep zIndex if needed for overlapping elements/effects
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
            value={isComponentLoading ? null : (grandTotal ?? 0)} // Pass raw value or null
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
        </div>
      </Card>
    </Col>
  );
};

export default NetPositionCard;
