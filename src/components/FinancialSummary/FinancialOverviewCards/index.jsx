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
    </>
  );
};

// Export the container component as the default export
export default FinancialOverviewCardsContainer;
