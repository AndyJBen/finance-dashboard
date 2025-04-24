// src/components/FinancialSummary/FinancialOverviewCards/index.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Row, Spin, Alert } from 'antd';
import { FinanceContext } from '../../../contexts/FinanceContext'; // Adjust path as needed

// Import the card components
import NetPositionCard from './NetPositionCard';
import DueBalanceCard from './DueBalanceCard';
import BankBalanceCard from './BankBalanceCard';

// Main container component for the overview cards
const FinancialOverviewCardsContainer = () => {
  // Get loading and error states from context
  const { loading, loadingBalance, loadingCreditCards, error } = useContext(FinanceContext);

  // State for responsive design
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 480);

  // Effect for handling window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsMobile(width <= 768);
      setIsSmallScreen(width <= 480);
    };
    
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

  const tabletStyles = {
    cardHeight: '130px',
    cardPadding: '16px',
    gutter: [12, 12],
    marginBottom: 16,
    spaceMargin: 10,
    fontSize: { title: '0.8rem', value: '1.5rem', subtext: '0.7rem' },
    iconSize: { standard: 20, small: 17, edit: 15 },
    editButtonStyle: { padding: '0px', minWidth: '24px', height: '24px' }
  };

  const mobileStyles = {
    cardHeight: isSmallScreen ? '80px' : '100px',
    cardPadding: isSmallScreen ? '8px' : '12px',
    gutter: [8, 8],
    marginBottom: 8,
    spaceMargin: 6,
    fontSize: { 
      title: isSmallScreen ? '0.65rem' : '0.75rem', 
      value: isSmallScreen ? '1rem' : '1.25rem', 
      subtext: isSmallScreen ? '0.6rem' : '0.65rem' 
    },
    iconSize: { 
      standard: isSmallScreen ? 16 : 18, 
      small: isSmallScreen ? 14 : 16, 
      edit: isSmallScreen ? 12 : 14 
    },
    editButtonStyle: { 
      padding: '0px', 
      minWidth: isSmallScreen ? '20px' : '24px', 
      height: isSmallScreen ? '20px' : '24px' 
    }
  };

  // Determine which styles to use based on screen size
  const styles = isMobile ? mobileStyles : desktopStyles;
  // --- End Responsive Styling ---

  // Determine overall loading state
  const isComponentLoading = loading || loadingBalance || loadingCreditCards;

  // --- Loading and Error Handling ---
  if (error && !isComponentLoading) {
    return (
      <Alert
        message="Error loading financial data"
        description={error.message || String(error)}
        type="error"
        showIcon
        style={{ marginBottom: styles.marginBottom || 16 }}
      />
    );
  }
  // --- End Loading and Error Handling ---

  return (
    // Spin wrapper for loading state
    <Spin spinning={isComponentLoading} size={isMobile ? "default" : "large"} tip="Loading Overview...">
      {/* Row container for the cards */}
      <Row
        gutter={styles.gutter}
        style={{ marginBottom: styles.marginBottom }}
        className="financial-overview-row"
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

      {/* Responsive global styles for cards */}
      <style jsx global>{`
        /* Global currency formatting styles */
        .currency-wrapper {
          position: relative;
          display: inline-flex;
          align-items: flex-start;
        }
        
        .cents-superscript {
          font-size: 45%;
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

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .financial-overview-row {
            margin: 0 -4px !important;
          }
          
          .financial-overview-row .ant-col {
            padding: 0 4px !important;
            flex: 1;
            width: auto !important;
            max-width: none !important;
          }

          .financial-overview-row .ant-card {
            border-radius: 12px !important;
            margin-bottom: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }
        }

        /* Extra small screens */
        @media (max-width: 480px) {
          .ant-statistic-content-value {
            font-size: 90%;
          }
          
          .financial-overview-row .ant-card {
            border-radius: 10px !important;
          }
        }
      `}</style>
    </Spin>
  );
};

// Export the container component as the default export
export default FinancialOverviewCardsContainer;