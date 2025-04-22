// src/components/FinancialSummary/FinancialOverviewCards.jsx
// COMPLETE FILE CODE
// Changes:
// 1. Added Grid and useBreakpoint hook.
// 2. Changed Col xs={24} to xs={8} for all three cards to force row layout on mobile.
// 3. Added optional responsive font/icon sizing based on screen size.

import React, { useContext, useState, useEffect } from 'react';
import {
    Card, Row, Col, Spin, Alert, Typography, Space, Statistic,
    InputNumber, Button, Tooltip, message, Grid // Added Grid
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
import { FinanceContext } from '../../contexts/FinanceContext';

const { Text } = Typography;
const { useBreakpoint } = Grid; // Import hook

// Helper function to format currency (remains the same)
const formatCurrency = (value) => {
    const number = Number(value) || 0;
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
      loading,
  } = useContext(FinanceContext);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(0);

  // --- Breakpoint Detection ---
  const screens = useBreakpoint();
  // Determine if we are on a small screen (xs or sm)
  const isSmallScreen = screens.xs || screens.sm;
  // --- End Breakpoint Detection ---


  // Effect and Handlers remain the same...
  useEffect(() => {
    if (typeof bankBalance === 'number' && !isEditing) { setEditValue(bankBalance); }
    if (bankBalance !== null && editValue === 0 && !isEditing) { setEditValue(bankBalance); }
  }, [bankBalance, isEditing]);
  const handleEditClick = () => { setEditValue(bankBalance ?? 0); setIsEditing(true); };
  const handleCancelClick = () => { setIsEditing(false); };
  const handleSaveClick = async () => {
    if (typeof editValue === 'number' && !isNaN(editValue)) {
        const result = await updateBalance({ balance: editValue });
        if (result !== null) { setIsEditing(false); }
    } else { message.error("Invalid balance amount entered."); }
  };

  // Calculations remain the same
  const combinedTotalDue = (totalCurrentlyDue ?? 0) + (totalCreditCardBalance ?? 0);
  const grandTotal = (bankBalance !== null) ? bankBalance - combinedTotalDue : null;

  // --- Responsive Styling ---
  const grandTotalIsNegative = grandTotal !== null && grandTotal < 0;
  // Base card styles
  const baseCardStyle = { minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: 'none' };
  const cardBodyStyle = { padding: 'var(--space-16)', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }; // Slightly reduced padding on mobile potentially

  // Net Position Card Styles
  const grandTotalCardStyle = {
      ...baseCardStyle,
      background: grandTotal === null ? 'white' : grandTotalIsNegative ? 'linear-gradient(145deg, var(--danger-700), #A51F49)' : 'linear-gradient(145deg, var(--success-500), var(--success-700))',
      color: 'white',
  };
  const grandTotalTextStyle = { fontSize: isSmallScreen ? '0.75rem' : '0.875rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' };
  const grandTotalIconStyle = { fontSize: isSmallScreen ? '1rem' : '1.1rem', opacity: 0.9, color: 'white' };
  const grandTotalValueStyle = { color: 'white', fontSize: isSmallScreen ? '1.5rem' : '1.75rem', fontWeight: 700, lineHeight: 1.2, marginBottom: 0 };

  // Due Balance Card Styles
  const showDueWarning = hasAnyPastDueBills || (totalCreditCardBalance ?? 0) > 0;
  const dueCardStyle = {
      ...baseCardStyle,
      background: showDueWarning ? 'linear-gradient(145deg, var(--danger-500), var(--danger-700))' : 'linear-gradient(145deg, var(--success-500), var(--success-700))',
      color: 'white',
  };
  const dueCardIcon = showDueWarning ? <IconFlagFilled size={isSmallScreen ? 18 : 22} /> : <IconCircleCheck size={isSmallScreen ? 16 : 18} />;
  const dueCardTextStyle = { fontSize: isSmallScreen ? '0.75rem' : '0.875rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' };
  const dueCardIconStyle = { fontSize: '1rem', opacity: 0.9, color: 'white' }; // Icon size handled above
  const dueCardValueStyle = { color: 'white', fontSize: isSmallScreen ? '1.5rem' : '1.75rem', fontWeight: 700, lineHeight: 1.2, marginBottom: 0 };
  const dueSubtextStyle = { ...dueCardTextStyle, fontSize: isSmallScreen ? '0.65rem' : '0.75rem', opacity: 0.9, marginTop: '4px', display: 'block' };

  // Bank Balance Card Styles
  const bankBalanceColor = bankBalance === null || bankBalance >= 0 ? 'var(--success-500)' : 'var(--danger-500)'; // >= 0 is success
  const whiteCardStyle = { ...baseCardStyle, background: 'white' };
  const whiteCardTextStyle = { fontSize: isSmallScreen ? '0.75rem' : '0.875rem', fontWeight: 500, color: '#47586d' };
  const whiteCardIconStyle = { fontSize: '1rem', color: '#47586d', opacity: 0.8 };
  const whiteCardValueBaseStyle = { fontSize: isSmallScreen ? '1.5rem' : '1.75rem', fontWeight: 700, lineHeight: 1.2, marginBottom: 0 };
  const whiteCardEditButtonStyle = { color: '#47586d' }; // Keep edit button style consistent

  // --- End Responsive Styling ---


  // --- Subtext Generation Logic ---
  const generateDueSubtext = () => {
      const hasCCBalance = (totalCreditCardBalance ?? 0) > 0;
      const pastDueFormatted = formatCurrency(pastDueAmountFromPreviousMonths);
      const ccBalanceFormatted = formatCurrency(totalCreditCardBalance);
      let subtext = '';
      if (hasAnyPastDueBills && hasCCBalance) { subtext = `Incl. ${pastDueFormatted} Past | ${ccBalanceFormatted} CC`; } // Shortened 'Bill Prep'
      else if (hasAnyPastDueBills) { subtext = `Incl. ${pastDueFormatted} Past Due`; } // Shortened
      else if (hasCCBalance) { subtext = `Incl. ${ccBalanceFormatted} CC`; }
      if (subtext) {
          // Apply responsive style
          return ( <Text style={dueSubtextStyle}>{subtext}</Text> );
      }
      return null;
  };

  // --- Render Logic ---
  if (error && !loading && !loadingBalance) {
    return <Alert message="Error loading financial data" description={error} type="error" showIcon style={{ marginBottom: 'var(--space-24)' }} />;
  }

  const isComponentLoading = loading || loadingBalance;

  return (
    <Spin spinning={isComponentLoading} size="large" tip="Loading Overview...">
      {/* Changed gutter for potentially tighter mobile spacing */}
      <Row gutter={[isSmallScreen ? 8 : 16, 16]} style={{ marginBottom: 'var(--space-24)' }}>

          {/* Card 1: Net Position */}
          {/* MODIFIED: xs={8} forces row layout on mobile */}
          <Col xs={8} md={8}>
            <Card style={grandTotalCardStyle} styles={{ body: cardBodyStyle }}>
              <div>
                  <Space align="center" style={{ marginBottom: 'var(--space-16)' }}>
                      <IconCoinFilled size={isSmallScreen ? 18 : 22} style={grandTotalIconStyle} />
                      <Text style={grandTotalTextStyle}> Net Position </Text>
                  </Space>
              </div>
              <div>
                  <Statistic
                      value={isComponentLoading ? "-" : (grandTotal ?? 0)}
                      precision={2}
                      valueStyle={grandTotalValueStyle} // Apply responsive style
                      formatter={formatCurrency}
                  />
              </div>
            </Card>
          </Col>

          {/* Card 2: Due Balance */}
          {/* MODIFIED: xs={8} forces row layout on mobile */}
          <Col xs={8} md={8}>
            <Card style={dueCardStyle} styles={{ body: cardBodyStyle }}>
              <div>
                <Space align="center" style={{ marginBottom: 'var(--space-16)' }}>
                    {/* Icon size adjusted via variable */}
                    {React.cloneElement(dueCardIcon, { style: dueCardIconStyle })}
                    <Text style={dueCardTextStyle}> Due Balance </Text>
                </Space>
              </div>
              <div>
                <Statistic
                    value={isComponentLoading ? "-" : (combinedTotalDue ?? 0)}
                    precision={2}
                    valueStyle={dueCardValueStyle} // Apply responsive style
                    formatter={formatCurrency}
                />
                {!isComponentLoading && generateDueSubtext()}
              </div>
            </Card>
          </Col>

          {/* Card 3: Current Bank Balance */}
          {/* MODIFIED: xs={8} forces row layout on mobile */}
          <Col xs={8} md={8}>
            <Card style={whiteCardStyle} styles={{ body: cardBodyStyle }} >
              <div>
                <Space align="center" justify="space-between" style={{ width: '100%', marginBottom: 'var(--space-16)' }}>
                    <Space align="center">
                        <IconBuildingBank size={isSmallScreen ? 18 : 22} style={whiteCardIconStyle} />
                        <Text style={whiteCardTextStyle}> Bank Balance </Text>
                    </Space>
                    {/* Edit buttons remain same */}
                    {!isEditing ? ( <Tooltip title="Edit Balance"><Button type="text" shape="circle" icon={<IconEdit size={16} />} onClick={handleEditClick} style={whiteCardEditButtonStyle} /></Tooltip> )
                    : ( <Space size="small"><Tooltip title="Save Balance"><Button type="text" shape="circle" icon={<IconCircleCheck size={16} style={{ color: 'var(--success-500)' }} />} onClick={handleSaveClick} style={whiteCardEditButtonStyle} /></Tooltip><Tooltip title="Cancel Edit"><Button type="text" shape="circle" icon={<IconX size={16} style={{ color: 'var(--danger-500)' }} />} onClick={handleCancelClick} style={whiteCardEditButtonStyle} /></Tooltip></Space> )}
                </Space>
              </div>
              <div>
                {!isEditing ? (
                    <Statistic
                        value={loadingBalance ? "-" : (bankBalance ?? 0)}
                        precision={2}
                        // Apply responsive style
                        valueStyle={{...whiteCardValueBaseStyle, color: bankBalanceColor}}
                        formatter={formatCurrency}
                    /> )
                : ( <InputNumber value={editValue} onChange={(value) => setEditValue(value ?? 0)} formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? ''} precision={2} style={{ width: '100%' }} size="large" autoFocus /> )}
              </div>
            </Card>
          </Col>

      </Row>
    </Spin>
  );
};

export default FinancialOverviewCards;
