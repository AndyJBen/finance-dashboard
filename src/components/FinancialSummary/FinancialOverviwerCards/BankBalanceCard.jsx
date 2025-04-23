// src/components/FinancialSummary/FinancialOverviewCards/BankBalanceCard.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Card, Col, Space, Statistic, Typography, InputNumber, Button, Tooltip, message } from 'antd';
import { IconBuildingBank, IconCircleCheck, IconEdit, IconX } from '@tabler/icons-react';
import { FinanceContext } from '../../../contexts/FinanceContext'; // Adjust path as needed

const { Text } = Typography;

// Helper function to format currency (Consider moving to a utils file)
const formatCurrency = (value) => {
  const number = Number(value) || 0;
  return number.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Component for the Bank Balance card
const BankBalanceCard = ({ isMobile, styles, isComponentLoading }) => {
  // Get necessary data and functions from context
  const { bankBalance, updateBalance, loadingBalance } = useContext(FinanceContext);

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(0);

  // Effect to update edit value when bank balance changes externally
  useEffect(() => {
    if (typeof bankBalance === 'number' && !isEditing) {
      setEditValue(bankBalance);
    }
    if (bankBalance !== null && editValue === 0 && !isEditing) {
      setEditValue(bankBalance);
    }
  }, [bankBalance, isEditing, editValue]);

  // --- Edit Handlers ---
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
  // --- End Edit Handlers ---

  const bankBalanceColor = bankBalance === null || bankBalance > 0 ? 'var(--success-500)' : 'var(--danger-500)';

  return (
    <Col xs={24} md={8}>
      <Card
        style={{
          background: 'white',
          minHeight: styles.cardHeight,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: 'none',
          borderRadius: isMobile ? 8 : undefined, // Rounded corners on mobile
        }}
        styles={{
          body: {
            padding: styles.cardPadding,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        {/* Top section: Icon, Title, and Edit Controls */}
        <div>
          <Space align="center" justify="space-between" style={{ width: '100%', marginBottom: styles.spaceMargin }}>
            <Space align="center">
              <IconBuildingBank size={styles.iconSize.standard} style={{ color: '#47586d', opacity: 0.8 }} />
              <Text style={{ fontSize: styles.fontSize.title, fontWeight: 500, color: '#47586d' }}>
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
                  style={{ color: '#47586d', ...(isMobile ? styles.editButtonStyle : {}) }}
                  disabled={loadingBalance || isComponentLoading} // Disable if loading
                />
              </Tooltip>
            ) : (
              <Space size="small">
                <Tooltip title="Save Balance">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<IconCircleCheck size={styles.iconSize.edit} style={{ color: 'var(--success-500)' }} />}
                    onClick={handleSaveClick}
                    style={{ color: '#47586d', ...(isMobile ? styles.editButtonStyle : {}) }}
                    loading={loadingBalance} // Show loading state on save button
                  />
                </Tooltip>
                <Tooltip title="Cancel Edit">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<IconX size={styles.iconSize.edit} style={{ color: 'var(--danger-500)' }} />}
                    onClick={handleCancelClick}
                    style={{ color: '#47586d', ...(isMobile ? styles.editButtonStyle : {}) }}
                    disabled={loadingBalance} // Disable cancel if save is in progress
                  />
                </Tooltip>
              </Space>
            )}
          </Space>
        </div>
        {/* Bottom section: Display Value or Input Field */}
        <div>
          {!isEditing ? (
            <Statistic
              value={loadingBalance || isComponentLoading ? "-" : (bankBalance ?? 0)} // Show '-' while loading
              precision={2}
              valueStyle={{
                fontSize: styles.fontSize.value,
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: 0,
                color: bankBalanceColor,
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
              disabled={loadingBalance} // Disable input while saving
            />
          )}
        </div>
      </Card>
    </Col>
  );
};

export default BankBalanceCard;
