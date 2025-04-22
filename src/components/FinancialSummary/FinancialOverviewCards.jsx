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
    IconX,
    IconCreditCard
} from '@tabler/icons-react';
import { FinanceContext } from '../../contexts/FinanceContext';

const { Text } = Typography;

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  // Styling logic with mobile adjustments
  const grandTotalIsNegative = grandTotal !== null && grandTotal < 0;
  const cardHeight = isMobile ? '120px' : '160px';
  
  const grandTotalCardStyle = { 
    background: grandTotal === null ? 'white' : grandTotalIsNegative ? 'linear-gradient(145deg, var(--danger-700), #A51F49)' : 'linear-gradient(145deg, var(--success-500), var(--success-700))', 
    color: 'white', 
    minHeight: cardHeight, 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between', 
    border: 'none',
  };
  
  const grandTotalTextStyle = { 
    fontSize: isMobile ? '0.75rem' : '0.875rem', 
    fontWeight: 500, 
    color: 'rgba(255, 255, 255, 0.9)' 
  };
  
  const grandTotalIconStyle = { 
    fontSize: isMobile ? '0.875rem' : '1rem', 
    opacity: 0.9, 
    color: 'white' 
  };
  
  const grandTotalValueStyle = { 
    color: 'white', 
    fontSize: isMobile ? '1.25rem' : '1.75rem', 
    fontWeight: 700, 
    lineHeight: 1.2, 
    marginBottom: 0 
  };
  
  const bankBalanceColor = bankBalance === null || bankBalance > 0 ? 'var(--success-500)' : 'var(--danger-500)';
  const showDueWarning = hasAnyPastDueBills || (totalCreditCardBalance ?? 0) > 0;
  
  const dueCardStyle = { 
    background: showDueWarning ? 'linear-gradient(145deg, var(--danger-500), var(--danger-700))' : 'linear-gradient(145deg, var(--success-500), var(--success-700))', 
    color: 'white', 
    minHeight: cardHeight, 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between', 
    border: 'none',
  };
  
  const dueCardIcon = showDueWarning ? <IconFlagFilled size={isMobile ? 18 : 22} /> : <IconCircleCheck size={isMobile ? 16 : 18} />;
  
  const dueCardTextStyle = { 
    fontSize: isMobile ? '0.75rem' : '0.875rem', 
    fontWeight: 500, 
    color: 'rgba(255, 255, 255, 0.9)' 
  };
  
  const dueCardIconStyle = { 
    fontSize: isMobile ? '0.875rem' : '1rem', 
    opacity: 0.9, 
    color: 'white' 
  };
  
  const dueCardValueStyle = { 
    color: 'white', 
    fontSize: isMobile ? '1.25rem' : '1.75rem', 
    fontWeight: 700, 
    lineHeight: 1.2, 
    marginBottom: 0 
  };
  
  const whiteCardTextStyle = { 
    fontSize: isMobile ? '0.75rem' : '0.875rem', 
    fontWeight: 500, 
    color: '#47586d' 
  };
  
  const whiteCardIconStyle = { 
    fontSize: isMobile ? '0.875rem' : '1rem', 
    color: '#47586d', 
    opacity: 0.8 
  };
  
  const whiteCardValueBaseStyle = { 
    fontSize: isMobile ? '1.25rem' : '1.75rem', 
    fontWeight: 700, 
    lineHeight: 1.2, 
    marginBottom: 0 
  };
  
  const whiteCardEditButtonStyle = { 
    color: '#47586d',
    padding: isMobile ? '0px' : undefined,
    minWidth: isMobile ? '24px' : undefined,
    height: isMobile ? '24px' : undefined
  };


  // --- Subtext Generation Logic (with mobile adjustments) ---
  const generateDueSubtext = () => {
      const hasCCBalance = (totalCreditCardBalance ?? 0) > 0;
      const pastDueFormatted = formatCurrency(pastDueAmountFromPreviousMonths);
      const ccBalanceFormatted = formatCurrency(totalCreditCardBalance);
      let subtext = '';
      if (hasAnyPastDueBills && hasCCBalance) { 
        subtext = isMobile ? 
          `${pastDueFormatted} Past | ${ccBalanceFormatted} CC` : 
          `Incl. ${pastDueFormatted} in Bill Prep | ${ccBalanceFormatted} CC`; 
      }
      else if (hasAnyPastDueBills) { 
        subtext = isMobile ? 
          `${pastDueFormatted} Past` : 
          `Incl. ${pastDueFormatted} in Bill Prep`; 
      }
      else if (hasCCBalance) { 
        subtext = isMobile ? 
          `${ccBalanceFormatted} CC` : 
          `Incl. ${ccBalanceFormatted} CC`; 
      }
      
      if (subtext) { 
        return (
          <Text style={{
            ...dueCardTextStyle, 
            fontSize: isMobile ? '0.65rem' : '0.75rem', 
            opacity: 0.9, 
            marginTop: '4px', 
            display: 'block'
          }}>
            {subtext}
          </Text>
        );
      }
      return null;
  };

  // --- Render Logic ---
  if (error && !loading && !loadingBalance) {
    return <Alert message="Error loading financial data" description={error} type="error" showIcon style={{ marginBottom: 'var(--space-24)' }} />;
  }

  const isComponentLoading = loading || loadingBalance;
  const cardPadding = isMobile ? 'var(--space-12)' : 'var(--space-20)';
  const spaceMargin = isMobile ? 'var(--space-8)' : 'var(--space-16)';

  return (
    <Spin spinning={isComponentLoading} size="large" tip="Loading Overview...">
      <Row gutter={[8, 8]} style={{ marginBottom: 'var(--space-24)' }}>
        {/* Card 1: Net Position */}
        <Col xs={8} style={{ paddingRight: isMobile ? 4 : 8, paddingLeft: isMobile ? 4 : 8 }}>
          <Card 
            style={grandTotalCardStyle} 
            styles={{ 
              body: { 
                padding: cardPadding, 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                zIndex: 1 
              } 
            }}
          >
            <div>
              <Space align="center" style={{ marginBottom: spaceMargin }}>
                <IconCoinFilled size={isMobile ? 18 : 22} style={grandTotalIconStyle} />
                <Text style={grandTotalTextStyle}>Net Position</Text>
              </Space>
            </div>
            <div>
              <Statistic
                value={isComponentLoading ? "-" : (grandTotal ?? 0)}
                precision={2}
                valueStyle={grandTotalValueStyle}
                formatter={formatCurrency}
              />
            </div>
          </Card>
        </Col>

        {/* Card 2: Due Balance */}
        <Col xs={8} style={{ paddingRight: isMobile ? 4 : 8, paddingLeft: isMobile ? 4 : 8 }}>
          <Card 
            style={dueCardStyle} 
            styles={{ 
              body: { 
                padding: cardPadding, 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between' 
              } 
            }}
          >
            <div>
              <Space align="center" style={{ marginBottom: spaceMargin }}>
                {React.cloneElement(dueCardIcon, { style: dueCardIconStyle })}
                <Text style={dueCardTextStyle}>Due Balance</Text>
              </Space>
            </div>
            <div>
              <Statistic
                value={isComponentLoading ? "-" : (combinedTotalDue ?? 0)}
                precision={2}
                valueStyle={dueCardValueStyle}
                formatter={formatCurrency}
              />
              {!isComponentLoading && generateDueSubtext()}
            </div>
          </Card>
        </Col>

        {/* Card 3: Current Bank Balance */}
        <Col xs={8} style={{ paddingRight: isMobile ? 4 : 8, paddingLeft: isMobile ? 4 : 8 }}>
          <Card 
            style={{ 
              background: 'white', 
              minHeight: cardHeight, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              border: 'none' 
            }} 
            styles={{ 
              body: { 
                padding: cardPadding, 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between' 
              } 
            }}
          >
            <div>
              <Space align="center" justify="space-between" style={{ width: '100%', marginBottom: spaceMargin }}>
                <Space align="center">
                  <IconBuildingBank size={isMobile ? 18 : 22} style={whiteCardIconStyle} />
                  <Text style={whiteCardTextStyle}>Bank Balance</Text>
                </Space>
                {/* Edit buttons with mobile adjustments */}
                {!isEditing ? (
                  <Tooltip title="Edit Balance">
                    <Button 
                      type="text" 
                      shape="circle" 
                      icon={<IconEdit size={isMobile ? 14 : 16} />} 
                      onClick={handleEditClick} 
                      style={whiteCardEditButtonStyle} 
                    />
                  </Tooltip>
                ) : (
                  <Space size={isMobile ? 'small' : 'small'}>
                    <Tooltip title="Save Balance">
                      <Button 
                        type="text" 
                        shape="circle" 
                        icon={<IconCircleCheck size={isMobile ? 14 : 16} style={{ color: 'var(--success-500)' }} />} 
                        onClick={handleSaveClick} 
                        style={whiteCardEditButtonStyle} 
                      />
                    </Tooltip>
                    <Tooltip title="Cancel Edit">
                      <Button 
                        type="text" 
                        shape="circle" 
                        icon={<IconX size={isMobile ? 14 : 16} style={{ color: 'var(--danger-500)' }} />} 
                        onClick={handleCancelClick} 
                        style={whiteCardEditButtonStyle} 
                      />
                    </Tooltip>
                  </Space>
                )}
              </Space>
            </div>
            <div>
              {!isEditing ? (
                <Statistic
                  value={loadingBalance ? "-" : (bankBalance ?? 0)}
                  precision={2}
                  valueStyle={{...whiteCardValueBaseStyle, color: bankBalanceColor}}
                  formatter={formatCurrency}
                />
              ) : (
                <InputNumber 
                  value={editValue} 
                  onChange={(value) => setEditValue(value ?? 0)} 
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? ''} 
                  precision={2} 
                  style={{ width: '100%' }} 
                  size={isMobile ? "middle" : "large"} 
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