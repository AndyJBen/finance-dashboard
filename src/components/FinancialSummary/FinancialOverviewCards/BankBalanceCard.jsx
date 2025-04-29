// src/components/FinancialSummary/FinancialOverviewCards/BankBalanceCard.jsx

import React, { useContext, useState, useEffect } from 'react';
import { Card, Col, Space, Statistic, Typography, InputNumber, Button, Tooltip, message } from 'antd';
import { IconBuildingBank, IconCircleCheck, IconEdit, IconX } from '@tabler/icons-react';
import { FinanceContext } from '../../../contexts/FinanceContext'; // Adjust path as needed

const { Text } = Typography;

// Helper: format dollars and superscript cents (no dot)
const formatCurrencySuperscript = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '-';
  }

  const numericValue = Number(value);
  const sign = numericValue < 0 ? '-' : '';
  const formatted = Math.abs(numericValue).toFixed(2);
  const [dollars, cents] = formatted.split('.');
  const formattedDollars = parseInt(dollars, 10).toLocaleString('en-US');

  return (
    <span className="currency-wrapper">
      {sign}${formattedDollars}
      <sup className="cents-superscript">{cents}</sup>
    </span>
  );
};

const BankBalanceCard = ({ isMobile, styles, isComponentLoading }) => {
  // Consume context, including the new state and toggle function
  const { bankBalance, updateBalance, loadingBalance, isEditingBankBalance, toggleBankBalanceEdit } = useContext(FinanceContext);

  // Local state ONLY for the input field value while editing
  const [editValue, setEditValue] = useState(0);

  // Effect to sync local editValue with bankBalance when not editing or when bankBalance changes
  useEffect(() => {
    if (!isEditingBankBalance && typeof bankBalance === 'number') {
      setEditValue(bankBalance);
    }
    // If editing starts externally (e.g., via bottom nav), sync the editValue
    if (isEditingBankBalance && typeof bankBalance === 'number' && editValue !== bankBalance) {
       setEditValue(bankBalance);
    }
  }, [bankBalance, isEditingBankBalance]); // Add isEditingBankBalance dependency

  // Handler for clicking the edit button (desktop)
  const handleEditClick = () => {
    setEditValue(bankBalance ?? 0); // Pre-fill input with current balance
    toggleBankBalanceEdit(true); // Set global editing state to true
  };

  // Handler for clicking the cancel button
  const handleCancelClick = () => {
    toggleBankBalanceEdit(false); // Set global editing state to false
    // No need to reset editValue here, useEffect will handle it
  };

  // Handler for clicking the save button
  const handleSaveClick = async () => {
    if (!isNaN(editValue)) {
      const result = await updateBalance({ balance: editValue });
      if (result !== null) {
        toggleBankBalanceEdit(false); // Set global editing state to false on success
      }
      // Error message handled by updateBalance in context
    } else {
      message.error('Invalid balance amount entered.');
    }
  };

  // Determine text color based on balance
  const bankBalanceColor =
    bankBalance === null || bankBalance >= 0
      ? 'var(--success-500)'
      : 'var(--danger-500)';

  return (
    <Col xs={24} md={8}>
      <Card
        style={{
          background: 'white',
          minHeight: isMobile ? '90px' : styles.cardHeight,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: 'none',
          borderRadius: isMobile ? 10 : undefined,
          marginBottom: isMobile ? 8 : undefined,
        }}
        bodyStyle={{
          padding: isMobile ? '8px 10px' : styles.cardPadding,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Space
            align="center"
            justify="space-between"
            style={{ width: '100%', marginBottom: isMobile ? 4 : styles.spaceMargin }}
          >
            <Space align="center">
              <IconBuildingBank
                size={isMobile ? 16 : styles.iconSize.standard}
                style={{ color: '#47586d', opacity: 0.8, display: 'flex' }}
              />
              <Text style={{
                fontSize: isMobile ? '0.75rem' : styles.fontSize.title,
                fontWeight: 500,
                color: '#47586d',
                display: 'flex',
                alignItems: 'center',
              }}>
                Bank Balance
              </Text>
            </Space>

            {/* Show Edit button only on desktop when NOT editing */}
            {!isEditingBankBalance && !isMobile && (
              <Tooltip title="Edit Balance">
                <Button
                  type="text"
                  shape="circle"
                  icon={<IconEdit size={styles.iconSize.edit} />}
                  onClick={handleEditClick} // Use updated handler
                  style={{ color: '#47586d' }}
                  disabled={loadingBalance || isComponentLoading}
                  className="desktop-only-edit-btn"
                />
              </Tooltip>
            )}

            {/* Show Save/Cancel buttons when editing */}
            {isEditingBankBalance && (
              <Space size="small">
                <Tooltip title="Save Balance">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<IconCircleCheck size={styles.iconSize.edit} style={{ color: 'var(--success-500)' }} />}
                    onClick={handleSaveClick} // Use updated handler
                    style={{ color: '#47586d', ...(isMobile ? styles.editButtonStyle : {}) }}
                    loading={loadingBalance} // Show loading state on save button
                  />
                </Tooltip>
                <Tooltip title="Cancel Edit">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<IconX size={styles.iconSize.edit} style={{ color: 'var(--danger-500)' }} />}
                    onClick={handleCancelClick} // Use updated handler
                    style={{ color: '#47586d', ...(isMobile ? styles.editButtonStyle : {}) }}
                    disabled={loadingBalance} // Disable cancel while saving
                  />
                </Tooltip>
              </Space>
            )}
          </Space>
        </div>

        <div>
          {/* Show Statistic when NOT editing */}
          {!isEditingBankBalance ? (
            <Statistic
              value={loadingBalance || isComponentLoading ? null : (bankBalance ?? 0)}
              valueStyle={{
                fontSize: isMobile ? '18px' : styles.fontSize.value,
                fontWeight: 700,
                lineHeight: 1,
                marginBottom: 0,
                marginTop: isMobile ? 4 : 0,
                color: bankBalanceColor,
              }}
              formatter={formatCurrencySuperscript}
            />
          ) : (
            // Show InputNumber when editing
            <InputNumber
              value={editValue}
              onChange={(val) => setEditValue(val ?? 0)}
              formatter={(val) => `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => val?.replace(/\$\s?|(,*)/g, '') ?? ''}
              precision={2}
              style={{ width: '100%' }}
              size={isMobile ? 'middle' : 'large'}
              autoFocus
              disabled={loadingBalance} // Disable input while saving
              // Pressing Enter triggers save
              onPressEnter={handleSaveClick}
            />
          )}
        </div>
      </Card>
      {/* Keep existing style block */}
      <style jsx>{`
        .currency-wrapper {
          position: relative;
          display: inline-flex;
          align-items: flex-start;
        }

        .cents-superscript {
          font-size: ${isMobile ? '50%' : '50%'};
          margin-left: 2px;
          font-weight: inherit;
          line-height: 1;
          opacity: 0.85;
          vertical-align: text-top;
          margin-top: ${isMobile ? '2px' : '4px'};
        }

        /* Hide edit button on mobile explicitly */
        @media (max-width: 768px) {
          .desktop-only-edit-btn {
            display: none !important;
          }
        }
      `}</style>
    </Col>
  );
};

export default BankBalanceCard;
