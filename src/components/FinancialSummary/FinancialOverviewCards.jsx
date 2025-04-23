// src/components/FinancialSummary/FinancialOverviewCards.jsx
// COMPLETE FILE CODE
// Corrected version using Ant Design's useBreakpoint hook for responsiveness.

import React, { useContext, useState, useEffect } from 'react';
import {
    Card, Row, Col, Spin, Alert, Typography, Space, Statistic,
    InputNumber, Button, Tooltip, message, Grid // Ensure Grid is imported
} from 'antd';
import {
    IconBuildingBank,
    IconCoinFilled,
    IconFlagFilled,
    IconCircleCheck,
    IconEdit,
    IconX,
    IconCreditCard // Keep existing icons
} from '@tabler/icons-react';
// Ensure the path to your context is correct
import { FinanceContext } from '../../contexts/FinanceContext';

const { Text } = Typography;
const { useBreakpoint } = Grid; // Import hook

// Helper function to format currency
const formatCurrency = (value) => {
    const number = Number(value) || 0;
    // Ensure value is a number before formatting
    if (isNaN(number)) {
        return '$0.00'; // Or some placeholder for invalid input
    }
    return number.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
};


const FinancialOverviewCards = () => {
  const {
      loadingBalance,
      error,
      bankBalance,
      updateBalance,
      totalCurrentlyDue,
      hasAnyPastDueBills,
      pastDueAmountFromPreviousMonths,
      totalCreditCardBalance,
      loading, // This might be a general loading state, ensure it's distinct if needed
  } = useContext(FinanceContext);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(0);

  // --- Breakpoint Detection ---
  const screens = useBreakpoint();
  // Determine if we are on a small screen (xs or sm are typically mobile/small tablet)
  const isSmallScreen = !screens.md; // True if screen is smaller than md (768px)
  // --- End Breakpoint Detection ---


  // Effect to initialize editValue when bankBalance loads or editing stops
  useEffect(() => {
    // Only update if not editing and bankBalance is a valid number
    if (!isEditing && typeof bankBalance === 'number' && !isNaN(bankBalance)) {
         setEditValue(bankBalance);
    }
    // Reset editValue if bankBalance becomes null while not editing
    else if (!isEditing && bankBalance === null) {
         setEditValue(0);
    }
  }, [bankBalance, isEditing]);

  // --- Event Handlers ---
  const handleEditClick = () => {
      // Initialize with current balance or 0 if null/undefined
      setEditValue(typeof bankBalance === 'number' ? bankBalance : 0);
      setIsEditing(true);
  };
  const handleCancelClick = () => {
      setIsEditing(false);
      // Optionally reset editValue to bankBalance on cancel
      // setEditValue(typeof bankBalance === 'number' ? bankBalance : 0);
  };
  const handleSaveClick = async () => {
    if (typeof editValue === 'number' && !isNaN(editValue)) {
        // Ensure updateBalance function exists before calling
        if (updateBalance) {
            const result = await updateBalance({ balance: editValue });
            // Assuming updateBalance returns truthy on success
            if (result) {
                setIsEditing(false);
                message.success("Bank balance updated.");
            } else {
                message.error("Failed to update balance.");
            }
        } else {
            console.error("updateBalance function not found in context.");
            message.error("Error: Update function unavailable.");
        }
    } else {
        message.error("Invalid balance amount entered.");
    }
  };
  // --- End Event Handlers ---

  // --- Calculations ---
  // Use nullish coalescing (??) for safer defaults
  const currentTotalDue = totalCurrentlyDue ?? 0;
  const currentCCBalance = totalCreditCardBalance ?? 0;
  const combinedTotalDue = currentTotalDue + currentCCBalance;
  const currentBankBalance = bankBalance ?? null; // Keep null if not loaded
  const grandTotal = currentBankBalance !== null ? currentBankBalance - combinedTotalDue : null;
  // --- End Calculations ---


  // --- Responsive Styling ---
  const grandTotalIsNegative = grandTotal !== null && grandTotal < 0;
  // Base card styles
  const baseCardStyle = {
      minHeight: isSmallScreen ? '120px' : '160px', // Shorter cards on mobile
      height: '100%', // Allow card to fill Col height
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      border: 'none',
      borderRadius: 'var(--radius-md)', // Use CSS variable if defined
      boxShadow: 'var(--shadow-sm)' // Use CSS variable if defined
  };
  const cardBodyStyle = {
      padding: isSmallScreen ? '12px' : 'var(--space-20, 20px)', // Reduced padding on mobile
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
  };

  // Net Position Card Styles
  const grandTotalCardStyle = {
      ...baseCardStyle,
      background: grandTotal === null ? '#f0f0f0' : grandTotalIsNegative ? 'linear-gradient(145deg, var(--danger-700, #a50f15), var(--danger-500, #cf1322))' : 'linear-gradient(145deg, var(--success-500, #52c41a), var(--success-700, #389e0d))',
      color: 'white',
  };
  const grandTotalTextStyle = { fontSize: isSmallScreen ? '0.75rem' : '0.875rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' };
  const grandTotalIconStyle = { opacity: 0.9, color: 'white' }; // Size set directly on icon
  const grandTotalValueStyle = { color: 'white', fontSize: isSmallScreen ? '1.5rem' : '1.75rem', fontWeight: 700, lineHeight: 1.2, marginBottom: 0 };

  // Due Balance Card Styles
  const showDueWarning = hasAnyPastDueBills || currentCCBalance > 0;
  const dueCardStyle = {
      ...baseCardStyle,
      background: showDueWarning ? 'linear-gradient(145deg, var(--danger-500, #cf1322), var(--danger-700, #a50f15))' : 'linear-gradient(145deg, var(--success-500, #52c41a), var(--success-700, #389e0d))',
      color: 'white',
  };
  // Conditionally render icon component with size prop
  const dueCardIcon = showDueWarning
      ? <IconFlagFilled size={isSmallScreen ? 18 : 22} style={{ color: 'white' }} />
      : <IconCircleCheck size={isSmallScreen ? 18 : 22} style={{ color: 'white' }} />;
  const dueCardTextStyle = { fontSize: isSmallScreen ? '0.75rem' : '0.875rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' };
  const dueCardValueStyle = { color: 'white', fontSize: isSmallScreen ? '1.5rem' : '1.75rem', fontWeight: 700, lineHeight: 1.2, marginBottom: 0 };
  const dueSubtextStyle = { ...dueCardTextStyle, fontSize: isSmallScreen ? '0.65rem' : '0.75rem', opacity: 0.9, marginTop: '4px', display: 'block' };

  // Bank Balance Card Styles
  const bankBalanceColor = currentBankBalance === null || currentBankBalance >= 0 ? 'var(--success-600, #389e0d)' : 'var(--danger-600, #cf1322)';
  const whiteCardStyle = { ...baseCardStyle, background: 'white' };
  const whiteCardTextStyle = { fontSize: isSmallScreen ? '0.75rem' : '0.875rem', fontWeight: 500, color: 'var(--neutral-700, #4a5568)' };
  const whiteCardIconStyle = { color: 'var(--neutral-500, #718096)' }; // Size set directly on icon
  const whiteCardValueBaseStyle = { fontSize: isSmallScreen ? '1.5rem' : '1.75rem', fontWeight: 700, lineHeight: 1.2, marginBottom: 0 };
  const whiteCardEditButtonStyle = { color: 'var(--neutral-600, #4a5568)' };
  const editButtonSize = isSmallScreen ? 14 : 16; // Size for edit/cancel/save icons

  // --- End Responsive Styling ---


  // --- Subtext Generation Logic ---
  const generateDueSubtext = () => {
      const hasCCBalance = currentCCBalance > 0;
      const currentPastDue = pastDueAmountFromPreviousMonths ?? 0;
      const pastDueFormatted = formatCurrency(currentPastDue);
      const ccBalanceFormatted = formatCurrency(currentCCBalance);
      let subtextParts = [];

      if (hasAnyPastDueBills && currentPastDue > 0) {
          subtextParts.push(`${pastDueFormatted} Past`);
      }
      if (hasCCBalance) {
          subtextParts.push(`${ccBalanceFormatted} CC`);
      }

      const subtext = subtextParts.join(' | '); // Join with separator

      if (subtext) {
          return ( <Text style={dueSubtextStyle}>{subtext}</Text> );
      }
      return null;
  };
  // --- End Subtext Generation Logic ---


  // --- Render Logic ---
  // Display error only if not loading
  if (error && !loading && !loadingBalance) {
    return <Alert message="Error loading financial data" description={String(error)} type="error" showIcon style={{ marginBottom: 'var(--space-24, 24px)' }} />;
  }

  // Unified loading state for the whole component
  const isComponentLoading = loading || loadingBalance;

  return (
    // Use Spin wrapper around the Row for better loading indication
    <Spin spinning={isComponentLoading} size="large" tip="Loading Overview...">
      <Row gutter={[isSmallScreen ? 8 : 16, 16]} style={{ marginBottom: 'var(--space-24, 24px)' }}>

          {/* Card 1: Net Position */}
          {/* Set xs={8} to make it 1/3 width on mobile */}
          <Col xs={8} md={8} style={{ display: 'flex' }}> {/* Added display flex to Col */}
            <Card style={grandTotalCardStyle} bodyStyle={cardBodyStyle}>
              {/* Top Section */}
              <div>
                  <Space align="center" style={{ marginBottom: 'var(--space-12, 12px)' }}>
                      <IconCoinFilled size={isSmallScreen ? 18 : 22} style={grandTotalIconStyle} />
                      <Text style={grandTotalTextStyle}> Net Position </Text>
                  </Space>
              </div>
              {/* Bottom Section */}
              <div>
                  <Statistic
                      value={grandTotal ?? 0} // Show 0 if null while not loading
                      precision={2}
                      valueStyle={grandTotalValueStyle}
                      formatter={formatCurrency}
                  />
              </div>
            </Card>
          </Col>

          {/* Card 2: Due Balance */}
          {/* Set xs={8} to make it 1/3 width on mobile */}
          <Col xs={8} md={8} style={{ display: 'flex' }}> {/* Added display flex to Col */}
            <Card style={dueCardStyle} bodyStyle={cardBodyStyle}>
              {/* Top Section */}
              <div>
                <Space align="center" style={{ marginBottom: 'var(--space-12, 12px)' }}>
                    {/* Render the icon directly */}
                    {dueCardIcon}
                    <Text style={dueCardTextStyle}> Due Balance </Text>
                </Space>
              </div>
              {/* Bottom Section */}
              <div>
                <Statistic
                    value={combinedTotalDue}
                    precision={2}
                    valueStyle={dueCardValueStyle}
                    formatter={formatCurrency}
                />
                {generateDueSubtext()}
              </div>
            </Card>
          </Col>

          {/* Card 3: Current Bank Balance */}
          {/* Set xs={8} to make it 1/3 width on mobile */}
          <Col xs={8} md={8} style={{ display: 'flex' }}> {/* Added display flex to Col */}
            <Card style={whiteCardStyle} bodyStyle={cardBodyStyle} >
              {/* Top Section */}
              <div>
                <Space align="center" justify="space-between" style={{ width: '100%', marginBottom: 'var(--space-12, 12px)' }}>
                    <Space align="center">
                        <IconBuildingBank size={isSmallScreen ? 18 : 22} style={whiteCardIconStyle} />
                        <Text style={whiteCardTextStyle}> Bank Balance </Text>
                    </Space>
                    {/* Edit buttons */}
                    {!isEditing ? (
                        <Tooltip title="Edit Balance">
                            <Button type="text" shape="circle" icon={<IconEdit size={editButtonSize} />} onClick={handleEditClick} style={whiteCardEditButtonStyle} size="small"/>
                        </Tooltip>
                     ) : (
                        <Space size="small">
                            <Tooltip title="Save Balance">
                                <Button type="text" shape="circle" icon={<IconCircleCheck size={editButtonSize} style={{ color: 'var(--success-500)' }} />} onClick={handleSaveClick} style={whiteCardEditButtonStyle} size="small"/>
                            </Tooltip>
                            <Tooltip title="Cancel Edit">
                                <Button type="text" shape="circle" icon={<IconX size={editButtonSize} style={{ color: 'var(--danger-500)' }} />} onClick={handleCancelClick} style={whiteCardEditButtonStyle} size="small"/>
                            </Tooltip>
                        </Space>
                     )}
                </Space>
              </div>
              {/* Bottom Section */}
              <div>
                {!isEditing ? (
                    <Statistic
                        value={currentBankBalance ?? 0} // Show 0 if null while not loading
                        precision={2}
                        valueStyle={{...whiteCardValueBaseStyle, color: bankBalanceColor}}
                        formatter={formatCurrency}
                    /> )
                : (
                    <InputNumber
                        value={editValue}
                        onChange={(value) => setEditValue(value ?? 0)}
                        formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? ''}
                        precision={2}
                        style={{ width: '100%' }}
                        size={isSmallScreen ? "middle" : "large"} // Adjust size based on screen
                        autoFocus
                    />
                 )}
              </div>
            </Card>
          </Col>

      </Row>
    </Spin>
  );
};

export default FinancialOverviewCards;
