// src/components/FinancialSummary/FinancialOverviewCards/index.jsx
// This file replaces the original FinancialOverviewCards.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Row, Spin, Alert } from 'antd';
import { FinanceContext } from '../../../contexts/FinanceContext'; // Adjust path as needed

// Import the newly created card components
import NetPositionCard from './NetPositionCard';
import DueBalanceCard from './DueBalanceCard';
import BankBalanceCard from './BankBalanceCard';

// Main container component for the overview cards
const FinancialOverviewCardsContainer = () => {
  // Get loading and error states from context
  const { loading, loadingBalance, loadingCreditCards, error } = useContext(FinanceContext);

  // State for responsive design
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Effect for handling window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Responsive Styling Definitions ---
  const desktopStyles = {
    cardHeight: '160px',
    cardPadding: 'var(--space-20)',
    gutter: [16, 16],
    marginBottom: 'var(--space-24)',
    spaceMargin: 'var(--space-16)',
    fontSize: { title: '0.875rem', value: '1.75rem', subtext: '0.75rem' },
    iconSize: { standard: 22, small: 18, edit: 16 }
  };

  const mobileStyles = {
    cardHeight: '100px',
    cardPadding: '12px',
    gutter: [8, 8],
    marginBottom: 8, // Applied to individual cards now
    spaceMargin: 8,
    fontSize: { title: '0.75rem', value: '1.25rem', subtext: '0.65rem' },
    iconSize: { standard: 18, small: 16, edit: 14 },
    editButtonStyle: { padding: '0px', minWidth: '24px', height: '24px' }
  };

  const styles = isMobile ? mobileStyles : desktopStyles;
  // --- End Responsive Styling ---

  // Determine overall loading state
  const isComponentLoading = loading || loadingBalance || loadingCreditCards;

  // --- Loading and Error Handling ---
  if (error && !isComponentLoading) {
    return (
      <Alert
        message="Error loading financial data"
        description={error.message || String(error)} // Display error message
        type="error"
        showIcon
        style={{ marginBottom: styles.marginBottom || 16 }} // Use defined margin or fallback
      />
    );
  }
  // --- End Loading and Error Handling ---

  // --- DEBUG LOGGING (Optional - can be removed) ---
  // console.log(`[FinancialOverviewContainer] Rendering: isComponentLoading=${isComponentLoading}, isMobile=${isMobile}`);
  // ---

  return (
    // Spin wrapper for loading state
    <Spin spinning={isComponentLoading} size="large" tip="Loading Overview...">
      {/* Row container for the cards */}
      <Row
        gutter={styles.gutter}
        style={{ marginBottom: isMobile ? 0 : styles.marginBottom }} // Apply margin only on desktop row
      >
        {/* Render each card component, passing necessary props */}
        <NetPositionCard
          isMobile={isMobile}
          styles={styles}
          isComponentLoading={isComponentLoading}
        />
        <DueBalanceCard
          isMobile={isMobile}
          styles={styles}
          isComponentLoading={isComponentLoading}
        />
        <BankBalanceCard
          isMobile={isMobile}
          styles={styles}
          isComponentLoading={isComponentLoading}
        />
      </Row>

      {/* Mobile-specific global styles for card spacing/rounding */}
      {isMobile && (
        <style jsx global>{`
          @media (max-width: 768px) {
            .ant-col-xs-24 {
              padding-left: 4px !important;
              padding-right: 4px !important;
            }
            /* Card styles moved to individual components */
          }
        `}</style>
      )}

      {/* Global currency formatting styles */}
      <style jsx global>{`
        /* Global currency formatting styles */
        .currency-wrapper {
          position: relative;
          display: inline-flex;
          align-items: flex-start;
        }
        
        .cents-superscript {
          font-size: 45%;
          line-height: 1;
          margin-left: 2px;
          font-weight: inherit;
          vertical-align: super;
          opacity: 0.85;
        }
        
        /* Ensure proper vertical alignment in Ant Design Statistic component */
        .ant-statistic-content-value {
          display: inline-flex;
          align-items: flex-start;
        }
      `}</style>
    </Spin>
  );
};

// Export the container component as the default export
export default FinancialOverviewCardsContainer;