//> START finance-app/src/components/FinancialSummary/FinancialOverviewCards.jsx
// src/components/FinancialSummary/FinancialOverviewCards.jsx
import React, { useContext, useState, useEffect } from 'react';
import {
  Card, Row, Col, Spin, Alert, Typography, Space, Statistic,
  InputNumber, Button, Tooltip, message
} from 'antd';
import {
  IconBuildingBank,
  IconCoinFilled,
  IconFlagFilled,
  IconCircleCheck,
  IconEdit,
  IconX
} from '@tabler/icons-react';
// Import the context to access shared financial state
import { FinanceContext } from '../../contexts/FinanceContext';

const { Text } = Typography;

// Helper function to format numbers as US currency
const formatCurrency = (value) => {
  const number = Number(value) || 0; // Ensure it's a number, default to 0
  return number.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

// Component to display the main financial overview cards (Net Position, Due Balance, Bank Balance)
const FinancialOverviewCards = () => {
  // Destructure necessary values and functions from the FinanceContext
  const {
    loadingBalance, // State indicating if the bank balance is currently being fetched/updated
    error,          // Any error message from fetching data
    bankBalance,    // The current bank balance value
    updateBalance,  // Function to update the bank balance on the server
    currentDueAmt, // 🟩 CORRECTED: Changed from totalCurrentlyDue - Total amount of unpaid bills (current month + past due)
    hasAnyPastDueBills, // Boolean indicating if there are any unpaid bills from previous months
    pastDueAmountFromPreviousMonths, // The total amount of only the past due bills
    totalCreditCardBalance, // The sum of balances across all credit cards
    loading,        // General loading state for bills data
  } = useContext(FinanceContext);

  // State for managing the inline editing of the bank balance
  const [isEditing, setIsEditing] = useState(false); // Is the bank balance input field active?
  const [editValue, setEditValue] = useState(0); // The value currently in the input field
  // State to track if the view is mobile for responsive styling
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Effect hook to handle window resize events for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Update mobile state based on width
    };

    window.addEventListener('resize', handleResize); // Add listener
    // Cleanup function to remove the listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array means this effect runs only once on mount

  // Effect hook to update the edit input value when the bank balance changes externally,
  // but only if the user isn't currently editing it.
  useEffect(() => {
    // If bankBalance is a valid number and we are not in edit mode, update the input field's value
    if (typeof bankBalance === 'number' && !isEditing) {
      setEditValue(bankBalance);
    }
    // Also handles the initial load case where editValue might be 0 but bankBalance is fetched
    if (bankBalance !== null && editValue === 0 && !isEditing) {
      setEditValue(bankBalance);
    }
  }, [bankBalance, isEditing, editValue]); // Re-run if bankBalance, isEditing, or editValue changes

  // --- Event Handlers for Bank Balance Editing ---
  const handleEditClick = () => {
    setEditValue(bankBalance ?? 0); // Set input field to current balance (or 0 if null)
    setIsEditing(true); // Activate edit mode
  };

  const handleCancelClick = () => {
    setIsEditing(false); // Deactivate edit mode, discarding changes
  };

  const handleSaveClick = async () => {
    // Validate the input value before saving
    if (typeof editValue === 'number' && !isNaN(editValue)) {
      // Call the updateBalance function from the context
      const result = await updateBalance({ balance: editValue });
      // If the update was successful (not null), exit edit mode
      if (result !== null) {
        setIsEditing(false);
      }
      // Error handling is done within updateBalance and shown via message.error
    } else {
      // Show an error message if the input is invalid
      message.error("Invalid balance amount entered.");
    }
  };
  // --- End Event Handlers ---

  // --- Derived Financial Calculations ---
  // Calculate the total amount due (unpaid bills + credit card balances)
  const combinedTotalDue = (currentDueAmt ?? 0) + (totalCreditCardBalance ?? 0); // 🟩 CORRECTED: Changed from totalCurrentlyDue
  // Calculate the net position (bank balance minus total due)
  const grandTotal = (bankBalance !== null) ? bankBalance - combinedTotalDue : null; // Null if balance isn't loaded
  // Determine if the net position is negative for styling
  const grandTotalIsNegative = grandTotal !== null && grandTotal < 0;
  // Determine the color for the bank balance display (red if negative/zero, green otherwise)
  const bankBalanceColor = bankBalance === null || bankBalance > 0 ? 'var(--success-500)' : 'var(--danger-500)';
  // Determine if a warning state should be shown on the "Due Balance" card
  const showDueWarning = hasAnyPastDueBills || (totalCreditCardBalance ?? 0) > 0;
  // --- End Derived Financial Calculations ---

  // --- Subtext Generation for "Due Balance" Card ---
  // Creates a dynamic subtext explaining the components of the due balance
  const generateDueSubtext = () => {
    const hasCCBalance = (totalCreditCardBalance ?? 0) > 0;
    // Format the past due and credit card amounts for display
    const pastDueFormatted = formatCurrency(pastDueAmountFromPreviousMonths);
    const ccBalanceFormatted = formatCurrency(totalCreditCardBalance);
    let subtext = ''; // Initialize empty subtext

    // Generate different text based on whether it's mobile or desktop view
    if (isMobile) {
      // Mobile view: Use shorter, more concise text
      if (hasAnyPastDueBills && hasCCBalance) {
        subtext = `${pastDueFormatted} Past | ${ccBalanceFormatted} CC`;
      } else if (hasAnyPastDueBills) {
        subtext = `${pastDueFormatted} Past`;
      } else if (hasCCBalance) {
        subtext = `${ccBalanceFormatted} CC`;
      }
    } else {
      // Desktop view: Use the original, slightly more descriptive text
      if (hasAnyPastDueBills && hasCCBalance) {
        subtext = `Incl. ${pastDueFormatted} in Bill Prep | ${ccBalanceFormatted} CC`;
      } else if (hasAnyPastDueBills) {
        subtext = `Incl. ${pastDueFormatted} in Bill Prep`;
      } else if (hasCCBalance) {
        subtext = `Incl. ${ccBalanceFormatted} CC`;
      }
    }

    // If any subtext was generated, return it wrapped in a Text component
    if (subtext) {
      return (
        <Text style={{
          fontSize: isMobile ? '0.65rem' : '0.75rem', // Smaller font on mobile
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
          opacity: 0.9,
          marginTop: '4px', // Space above the subtext
          display: 'block' // Ensure it takes its own line
        }}>
          {subtext}
        </Text>
      );
    }
    return null; // Return null if no subtext is needed
  };
  // --- End Subtext Generation ---

  // --- Loading and Error Handling ---
  // If there's an error and data isn't loading, display an error alert
  if (error && !loading && !loadingBalance) {
    return (
      <Alert
        message="Error loading financial data"
        description={error} // Show the error message details
        type="error"
        showIcon
        style={{ marginBottom: 'var(--space-24)' }} // Add some space below the alert
      />
    );
  }

  // Determine the overall loading state for the component
  const isComponentLoading = loading || loadingBalance;
  // Choose the icon for the "Due Balance" card based on whether there's a warning state
  const dueCardIcon = showDueWarning ? <IconFlagFilled size={isMobile ? 18 : 22} /> : <IconCircleCheck size={isMobile ? 16 : 18} />;
  // --- End Loading and Error Handling ---

  // --- Responsive Styling Definitions ---
  // Define base styles (considered desktop)
  const desktopStyles = {
    cardHeight: '160px',
    cardPadding: 'var(--space-20)',
    gutter: [16, 16], // Spacing between columns/rows
    marginBottom: 'var(--space-24)',
    spaceMargin: 'var(--space-16)', // Margin for Space components
    fontSize: { title: '0.875rem', value: '1.75rem', subtext: '0.75rem' },
    iconSize: { standard: 22, small: 18, edit: 16 }
  };

  // Define overrides for mobile styles
  const mobileStyles = {
    cardHeight: '100px', // Shorter cards on mobile
    cardPadding: '12px', // Less padding
    gutter: [8, 8], // Less spacing
    marginBottom: 8,
    spaceMargin: 8,
    fontSize: { title: '0.75rem', value: '1.25rem', subtext: '0.65rem' }, // Smaller fonts
    iconSize: { standard: 18, small: 16, edit: 14 }, // Smaller icons
    editButtonStyle: { padding: '0px', minWidth: '24px', height: '24px' } // Compact edit buttons
  };

  // Select the appropriate style object based on the current isMobile state
  const styles = isMobile ? mobileStyles : desktopStyles;
  // --- End Responsive Styling Definitions ---

  // --- Component JSX Rendering ---
  return (
    // Wrap the entire component in a Spin component to show a loading indicator
    <Spin spinning={isComponentLoading} size="large" tip="Loading Overview...">
      {/* Use Ant Design Row and Col for layout */}
      <Row gutter={styles.gutter} style={{ marginBottom: styles.marginBottom }}>

        {/* Card 1: Net Position */}
        <Col xs={24} md={8}> {/* Full width on extra-small screens, 1/3 width on medium and up */}
          <Card
            style={{
              // Dynamic background gradient based on net position (red if negative, green if positive)
              background: grandTotal === null
                ? 'white' // Default background if loading
                : grandTotalIsNegative
                  ? 'linear-gradient(145deg, var(--danger-700), #A51F49)'
                  : 'linear-gradient(145deg, var(--success-500), var(--success-700))',
              color: 'white', // White text for contrast on gradients
              minHeight: styles.cardHeight, // Ensure consistent height
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between', // Space out title and value vertically
              border: 'none', // Remove default card border
              marginBottom: isMobile ? 8 : undefined // Add bottom margin only on mobile
            }}
            styles={{
              body: {
                padding: styles.cardPadding, // Apply responsive padding
                flexGrow: 1, // Allow body to fill height
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between', // Space out content vertically
                zIndex: 1 // Ensure content is above any potential pseudo-elements
              }
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
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  Net Position
                </Text>
              </Space>
            </div>
            {/* Bottom section: Statistic Value */}
            <div>
              <Statistic
                value={isComponentLoading ? "-" : (grandTotal ?? 0)} // Show '-' while loading
                precision={2} // Show two decimal places
                valueStyle={{
                  color: 'white',
                  fontSize: styles.fontSize.value,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  marginBottom: 0
                }}
                formatter={formatCurrency} // Use the currency formatting helper
              />
            </div>
          </Card>
        </Col>

        {/* Card 2: Due Balance */}
        <Col xs={24} md={8}>
          <Card
            style={{
              // Dynamic background based on whether there's a due warning (red if warning, green otherwise)
              background: showDueWarning
                ? 'linear-gradient(145deg, var(--danger-500), var(--danger-700))'
                : 'linear-gradient(145deg, var(--success-500), var(--success-700))',
              color: 'white',
              minHeight: styles.cardHeight,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: 'none',
              marginBottom: isMobile ? 8 : undefined
            }}
            styles={{
              body: {
                padding: styles.cardPadding,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }
            }}
          >
            {/* Top section: Icon and Title */}
            <div>
              <Space align="center" style={{ marginBottom: styles.spaceMargin }}>
                {/* Clone the selected icon and apply styles */}
                {React.cloneElement(dueCardIcon, {
                  style: {
                    fontSize: '1rem', // Consistent icon size appearance
                    opacity: 0.9,
                    color: 'white'
                  }
                })}
                <Text style={{
                  fontSize: styles.fontSize.title,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  Due Balance
                </Text>
              </Space>
            </div>
            {/* Bottom section: Statistic Value and Subtext */}
            <div>
              <Statistic
                value={isComponentLoading ? "-" : (combinedTotalDue ?? 0)} // Show calculated due balance
                precision={2}
                valueStyle={{
                  color: 'white',
                  fontSize: styles.fontSize.value,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  marginBottom: 0
                }}
                formatter={formatCurrency}
              />
              {/* Render the generated subtext if not loading */}
              {!isComponentLoading && generateDueSubtext()}
            </div>
          </Card>
        </Col>

        {/* Card 3: Current Bank Balance */}
        <Col xs={24} md={8}>
          <Card
            style={{
              background: 'white', // White background for this card
              minHeight: styles.cardHeight,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: 'none'
            }}
            styles={{
              body: {
                padding: styles.cardPadding,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }
            }}
          >
            {/* Top section: Icon, Title, and Edit Controls */}
            <div>
              <Space align="center" justify="space-between" style={{
                width: '100%', // Make space take full width
                marginBottom: styles.spaceMargin
              }}>
                {/* Left side: Icon and Title */}
                <Space align="center">
                  <IconBuildingBank
                    size={styles.iconSize.standard}
                    style={{
                      fontSize: '1rem',
                      color: '#47586d', // Neutral color for icon
                      opacity: 0.8
                    }}
                  />
                  <Text style={{
                    fontSize: styles.fontSize.title,
                    fontWeight: 500,
                    color: '#47586d' // Matching text color
                  }}>
                    Bank Balance
                  </Text>
                </Space>

                {/* Right side: Edit/Save/Cancel Buttons */}
                {!isEditing ? (
                  // Show Edit button when not in edit mode
                  <Tooltip title="Edit Balance">
                    <Button
                      type="text" // Less prominent button style
                      shape="circle" // Circular button
                      icon={<IconEdit size={styles.iconSize.edit} />} // Edit icon
                      onClick={handleEditClick} // Trigger edit mode
                      style={{
                        color: '#47586d',
                        ...(isMobile ? mobileStyles.editButtonStyle : {}) // Apply mobile button styles if needed
                      }}
                    />
                  </Tooltip>
                ) : (
                  // Show Save and Cancel buttons when in edit mode
                  <Space size="small">
                    <Tooltip title="Save Balance">
                      <Button
                        type="text"
                        shape="circle"
                        icon={<IconCircleCheck
                          size={styles.iconSize.edit}
                          style={{ color: 'var(--success-500)' }} // Green check icon
                        />}
                        onClick={handleSaveClick} // Trigger save action
                        style={{
                          color: '#47586d',
                          ...(isMobile ? mobileStyles.editButtonStyle : {})
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Cancel Edit">
                      <Button
                        type="text"
                        shape="circle"
                        icon={<IconX
                          size={styles.iconSize.edit}
                          style={{ color: 'var(--danger-500)' }} // Red 'X' icon
                        />}
                        onClick={handleCancelClick} // Trigger cancel action
                        style={{
                          color: '#47586d',
                          ...(isMobile ? mobileStyles.editButtonStyle : {})
                        }}
                      />
                    </Tooltip>
                  </Space>
                )}
              </Space>
            </div>
            {/* Bottom section: Display Value or Input Field */}
            <div>
              {!isEditing ? (
                // Display the bank balance using Statistic when not editing
                <Statistic
                  value={loadingBalance ? "-" : (bankBalance ?? 0)} // Show '-' while loading
                  precision={2}
                  valueStyle={{
                    fontSize: styles.fontSize.value,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    marginBottom: 0,
                    color: bankBalanceColor // Apply dynamic color (red/green)
                  }}
                  formatter={formatCurrency}
                />
              ) : (
                // Display the InputNumber field when editing
                <InputNumber
                  value={editValue} // Controlled input value
                  onChange={(value) => setEditValue(value ?? 0)} // Update state on change
                  // Format display with '$' and commas
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  // Remove formatting characters when parsing input
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? ''}
                  precision={2} // Allow two decimal places
                  style={{ width: '100%' }} // Take full width
                  size={isMobile ? "middle" : "large"} // Adjust size for mobile/desktop
                  autoFocus // Focus the input field automatically
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Mobile-specific global styles using styled-jsx */}
      {isMobile && (
        <style jsx global>{`
          /* Reduce padding around columns on mobile */
          @media (max-width: 768px) {
            .ant-col-xs-24 {
              padding-left: 4px !important;
              padding-right: 4px !important;
            }
            /* Add bottom margin and rounded corners to cards on mobile */
            .ant-card {
              margin-bottom: 8px !important;
              border-radius: 8px; /* Add rounded corners */
            }
          }
        `}</style>
      )}
    </Spin>
  );
  // --- End Component JSX Rendering ---
};