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
import { FinanceContext } from '../../contexts/FinanceContext';

const { Text } = Typography;

// Helper function to format currency
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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update edit value when bank balance changes
  useEffect(() => {
    if (typeof bankBalance === 'number' && !isEditing) { 
      setEditValue(bankBalance); 
    }
    if (bankBalance !== null && editValue === 0 && !isEditing) { 
      setEditValue(bankBalance); 
    }
  }, [bankBalance, isEditing, editValue]);
  
  // Form handlers
  const handleEditClick = () => { 
    setEditValue(bankBalance ?? 0); 
    setIsEditing(true); 
  };
  
  const handleCancelClick = () => { 
    setIsEditing(false); 
  };
  
  const handleSaveClick = async () => {
    if (typeof editValue === 'number' && !isNaN(editValue)) {
      const result = await updateBalance({ balance: editValue });
      if (result !== null) { 
        setIsEditing(false); 
      }
    } else { 
      message.error("Invalid balance amount entered."); 
    }
  };

  // Financial calculations
  const combinedTotalDue = (totalCurrentlyDue ?? 0) + (totalCreditCardBalance ?? 0);
  const grandTotal = (bankBalance !== null) ? bankBalance - combinedTotalDue : null;
  const grandTotalIsNegative = grandTotal !== null && grandTotal < 0;
  const bankBalanceColor = bankBalance === null || bankBalance > 0 ? 'var(--success-500)' : 'var(--danger-500)';
  const showDueWarning = hasAnyPastDueBills || (totalCreditCardBalance ?? 0) > 0;
  
  // Due Balance subtext
  const generateDueSubtext = () => {
    const hasCCBalance = (totalCreditCardBalance ?? 0) > 0;
    const pastDueFormatted = formatCurrency(pastDueAmountFromPreviousMonths);
    const ccBalanceFormatted = formatCurrency(totalCreditCardBalance);
    let subtext = '';
    
    if (isMobile) {
      // Mobile view - shorter text
      if (hasAnyPastDueBills && hasCCBalance) { 
        subtext = `${pastDueFormatted} Past | ${ccBalanceFormatted} CC`; 
      } else if (hasAnyPastDueBills) { 
        subtext = `${pastDueFormatted} Past`; 
      } else if (hasCCBalance) { 
        subtext = `${ccBalanceFormatted} CC`; 
      }
    } else {
      // Desktop view - original text
      if (hasAnyPastDueBills && hasCCBalance) { 
        subtext = `Incl. ${pastDueFormatted} in Bill Prep | ${ccBalanceFormatted} CC`; 
      } else if (hasAnyPastDueBills) { 
        subtext = `Incl. ${pastDueFormatted} in Bill Prep`; 
      } else if (hasCCBalance) { 
        subtext = `Incl. ${ccBalanceFormatted} CC`; 
      }
    }
    
    if (subtext) {
      return (
        <Text style={{
          fontSize: isMobile ? '0.65rem' : '0.75rem',
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.9)',
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

  // Handle error state
  if (error && !loading && !loadingBalance) {
    return (
      <Alert 
        message="Error loading financial data" 
        description={error} 
        type="error" 
        showIcon 
        style={{ marginBottom: 'var(--space-24)' }} 
      />
    );
  }

  const isComponentLoading = loading || loadingBalance;
  const dueCardIcon = showDueWarning ? <IconFlagFilled size={isMobile ? 18 : 22} /> : <IconCircleCheck size={isMobile ? 16 : 18} />;

  // Desktop styling
  const desktopStyles = {
    // Card layouts
    cardHeight: '160px',
    cardPadding: 'var(--space-20)',
    gutter: [16, 16],
    marginBottom: 'var(--space-24)',
    spaceMargin: 'var(--space-16)',
    
    // Typography
    fontSize: {
      title: '0.875rem',
      value: '1.75rem',
      subtext: '0.75rem'
    },
    
    // Icons
    iconSize: {
      standard: 22,
      small: 18,
      edit: 16
    }
  };
  
  // Mobile styling overrides
  const mobileStyles = {
    // Card layouts
    cardHeight: '100px',
    cardPadding: '12px',
    gutter: [8, 8],
    marginBottom: 8,
    spaceMargin: 8,
    
    // Typography
    fontSize: {
      title: '0.75rem',
      value: '1.25rem',
      subtext: '0.65rem'
    },
    
    // Icons
    iconSize: {
      standard: 18,
      small: 16,
      edit: 14
    },
    
    // Buttons
    editButtonStyle: {
      padding: '0px',
      minWidth: '24px',
      height: '24px'
    }
  };
  
  // Apply correct styles based on device
  const styles = isMobile ? mobileStyles : desktopStyles;

  return (
    <Spin spinning={isComponentLoading} size="large" tip="Loading Overview...">
      <Row gutter={styles.gutter} style={{ marginBottom: styles.marginBottom }}>
        {/* Card 1: Net Position */}
        <Col xs={24} md={8}>
          <Card 
            style={{ 
              background: grandTotal === null 
                ? 'white' 
                : grandTotalIsNegative 
                  ? 'linear-gradient(145deg, var(--danger-700), #A51F49)' 
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
                justifyContent: 'space-between',
                zIndex: 1
              } 
            }}
          >
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
            <div>
              <Statistic
                value={isComponentLoading ? "-" : (grandTotal ?? 0)}
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
            </div>
          </Card>
        </Col>

        {/* Card 2: Due Balance */}
        <Col xs={24} md={8}>
          <Card 
            style={{ 
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
            <div>
              <Space align="center" style={{ marginBottom: styles.spaceMargin }}>
                {React.cloneElement(dueCardIcon, { 
                  style: { 
                    fontSize: '1rem',
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
            <div>
              <Statistic
                value={isComponentLoading ? "-" : (combinedTotalDue ?? 0)}
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
              {!isComponentLoading && generateDueSubtext()}
            </div>
          </Card>
        </Col>

        {/* Card 3: Current Bank Balance */}
        <Col xs={24} md={8}>
          <Card 
            style={{ 
              background: 'white',
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
            <div>
              <Space align="center" justify="space-between" style={{ 
                width: '100%', 
                marginBottom: styles.spaceMargin 
              }}>
                <Space align="center">
                  <IconBuildingBank 
                    size={styles.iconSize.standard}
                    style={{ 
                      fontSize: '1rem',
                      color: '#47586d',
                      opacity: 0.8
                    }}
                  />
                  <Text style={{ 
                    fontSize: styles.fontSize.title,
                    fontWeight: 500,
                    color: '#47586d'
                  }}>
                    Bank Balance
                  </Text>
                </Space>
                
                {/* Edit buttons */}
                {!isEditing ? (
                  <Tooltip title="Edit Balance">
                    <Button 
                      type="text" 
                      shape="circle" 
                      icon={<IconEdit size={styles.iconSize.edit} />} 
                      onClick={handleEditClick} 
                      style={{
                        color: '#47586d',
                        ...(isMobile ? mobileStyles.editButtonStyle : {})
                      }} 
                    />
                  </Tooltip>
                ) : (
                  <Space size="small">
                    <Tooltip title="Save Balance">
                      <Button 
                        type="text" 
                        shape="circle" 
                        icon={<IconCircleCheck 
                          size={styles.iconSize.edit}
                          style={{ color: 'var(--success-500)' }} 
                        />} 
                        onClick={handleSaveClick} 
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
                          style={{ color: 'var(--danger-500)' }} 
                        />} 
                        onClick={handleCancelClick} 
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
            <div>
              {!isEditing ? (
                <Statistic
                  value={loadingBalance ? "-" : (bankBalance ?? 0)}
                  precision={2}
                  valueStyle={{
                    fontSize: styles.fontSize.value,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    marginBottom: 0,
                    color: bankBalanceColor
                  }}
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
      
      {/* Mobile-specific styles */}
      {isMobile && (
        <style jsx global>{`
          @media (max-width: 768px) {
            .ant-col-xs-24 {
              padding-left: 4px !important;
              padding-right: 4px !important;
            }
            
            .ant-card {
              margin-bottom: 8px !important;
              border-radius: 8px;
            }
          }
        `}</style>
      )}
    </Spin>
  );
};

export default FinancialOverviewCards;