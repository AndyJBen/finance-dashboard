// src/components/FinancialSummary/FinancialOverviewCards/index.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Row, Spin, Alert } from 'antd';
import { FinanceContext } from '../../../contexts/FinanceContext'; // Adjust path as needed

// Import the newly created card components
import NetPositionCard from './NetPositionCard';
import DueBalanceCard from './DueBalanceCard';
import BankBalanceCard from './BankBalanceCard';
// Import the skeleton component
import FinancialOverviewSkeleton from '../../skeletons/FinancialOverviewSkeleton/FinancialOverviewSkeleton'; // Adjust path if needed
import './index.css';

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
    cardHeight: '90px',
    cardPadding: '8px 10px',
    gutter: [8, 8],
    marginBottom: 8,
    spaceMargin: 4,
    fontSize: { title: '0.75rem', value: '22px', subtext: '0.65rem' }, // Set to 0.7rem
    iconSize: { standard: 16, small: 14, edit: 14 },
    editButtonStyle: { padding: '0px', minWidth: '24px', height: '24px' }
  };

  const styles = isMobile ? mobileStyles : desktopStyles;
  // --- End Responsive Styling ---

  // Determine overall loading state
  const isComponentLoading = loading || loadingBalance || loadingCreditCards;

  // --- Loading and Error Handling ---
  // Show skeleton while loading
  if (isComponentLoading) {
    return <FinancialOverviewSkeleton />; // Render skeleton component
  }

  // Show error message if there's an error and not loading
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

  // Render actual cards if not loading and no error
  return (
    // No Spin wrapper needed here anymore as loading is handled above
    <>
      {/* Row container for the cards */}
      <Row
        gutter={styles.gutter}
        style={{
          marginBottom: isMobile ? 0 : styles.marginBottom,
          margin: isMobile ? 0 : undefined,
          width: '100%'
        }}
        className="financial-overview-row"
      >
        {/* Render each card component, passing necessary props */}
        <NetPositionCard
          isMobile={isMobile}
          styles={styles}
          isComponentLoading={isComponentLoading} // Pass loading state (though handled above now)
        />
        <DueBalanceCard
          isMobile={isMobile}
          styles={styles}
          isComponentLoading={isComponentLoading} // Pass loading state
        />
        <BankBalanceCard
          isMobile={isMobile}
          styles={styles}
          isComponentLoading={isComponentLoading} // Pass loading state
        />
      </Row>

      {/* Global currency formatting styles */}
      <style jsx global>{`
        /* Global currency formatting styles */
        .currency-wrapper {
          position: relative;
          display: inline-flex;
          align-items: flex-start;
        }

        .cents-superscript {
          font-size: 50%;
          margin-left: 2px;
          font-weight: inherit;
          line-height: 1;
          opacity: 0.85;
          vertical-align: text-top;
          margin-top: 4px;
        }

        /* Ensure proper vertical alignment in Ant Design Statistic component */
        .ant-statistic-content-value {
          display: inline-flex;
          align-items: flex-start;
        }

        /* Icon alignment fixes */
        .ant-space-align-center {
          align-items: center !important;
        }

        .ant-space-item {
          display: flex !important;
          align-items: center !important;
        }

        /* Mobile only changes - won't affect desktop */
        @media (max-width: 768px) {
          /* Keep all 3 cards in a row on mobile with equal width */
          .financial-overview-row {
            display: flex !important;
            flex-wrap: nowrap !important;
            margin: 0 !important;
            width: 100% !important;
            justify-content: space-between !important;
          }

          .financial-overview-row .ant-col {
            flex: 1 1 0 !important;
            width: 33.33% !important;
            max-width: 33.33% !important;
            padding: 0 3px !important;
          }

          /* More compact cards on mobile */
          .financial-overview-row .ant-card {
            border-radius: 10px !important;
            margin-bottom: 8px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
            min-height: 75px !important; /* Corrected from 75 */
          }

          /* Reduced internal padding */
          .financial-overview-row .ant-card-body {
            padding: 8px 10px !important;
          }

          /* Adjust statistic size */
          .financial-overview-row .ant-statistic-content {
            font-size: 18px !important;
            line-height: 1 !important;
            margin-top: 4px !important;
          }

          /* Smaller cents indication */
          .financial-overview-row .cents-superscript {
            font-size: 50% !important;
            margin-top: 2px !important;
          }

          /* Smaller spacing in header */
          .financial-overview-row .ant-space {
            margin-bottom: 4px !important;
          }

          /* Hide bill prep subtext on mobile */
          .financial-overview-row .due-balance-subtext {
            display: none !important;
          }

          /* Smaller title text */
          .financial-overview-row .ant-typography {
            font-size: 0.75rem !important;
          }

          /* Smaller icons */
          .financial-overview-row .tabler-icon {
            width: 16px !important;
            height: 16px !important;
          }
        }
      `}</style>
    </>
  );
};

// Export the container component as the default export
export default FinancialOverviewCardsContainer;
