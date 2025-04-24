// src/components/FinancialSummary/FinancialOverviewCards/BankBalanceCard.jsx

import React, { useContext, useState, useEffect } from 'react';
import { Card, Col, Space, Statistic, Typography, InputNumber, Button, Tooltip, message } from 'antd';
import { IconBuildingBank, IconCircleCheck, IconEdit, IconX } from '@tabler/icons-react';
import { FinanceContext } from '../../../contexts/FinanceContext';

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
  const { bankBalance, updateBalance, loadingBalance } = useContext(FinanceContext);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(0);

  useEffect(() => {
    if (!isEditing && typeof bankBalance === 'number') {
      setEditValue(bankBalance);
    }
  }, [bankBalance, isEditing]);

  const handleEditClick = () => {
    setEditValue(bankBalance ?? 0);
    setIsEditing(true);
  };

  const handleCancelClick = () => setIsEditing(false);

  const handleSaveClick = async () => {
    if (!isNaN(editValue)) {
      const result = await updateBalance({ balance: editValue });
      if (result !== null) setIsEditing(false);
    } else {
      message.error('Invalid balance amount entered.');
    }
  };

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
                fontSize: isMobile ? '0.6rem' : styles.fontSize.title, 
                fontWeight: 500, 
                color: '#47586d',
                display: 'flex',
                alignItems: 'center',
              }}>
                Bank Balance
              </Text>
            </Space>

            {!isEditing && !isMobile && (
              <Tooltip title="Edit Balance">
                <Button
                  type="text"
                  shape="circle"
                  icon={<IconEdit size={styles.iconSize.edit} />}
                  onClick={handleEditClick}
                  style={{ color: '#47586d' }}
                  disabled={loadingBalance || isComponentLoading}
                  className="desktop-only-edit-btn"
                />
              </Tooltip>
            )}

            {isEditing && (
              <Space size="small">
                <Tooltip title="Save Balance">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<IconCircleCheck size={styles.iconSize.edit} style={{ color: 'var(--success-500)' }} />}
                    onClick={handleSaveClick}
                    style={{ color: '#47586d', ...(isMobile ? styles.editButtonStyle : {}) }}
                    loading={loadingBalance}
                  />
                </Tooltip>
                <Tooltip title="Cancel Edit">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<IconX size={styles.iconSize.edit} style={{ color: 'var(--danger-500)' }} />}
                    onClick={handleCancelClick}
                    style={{ color: '#47586d', ...(isMobile ? styles.editButtonStyle : {}) }}
                    disabled={loadingBalance}
                  />
                </Tooltip>
              </Space>
            )}
          </Space>
        </div>

        <div>
          {!isEditing ? (
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
            <InputNumber
              value={editValue}
              onChange={(val) => setEditValue(val ?? 0)}
              formatter={(val) => `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => val?.replace(/\$\s?|(,*)/g, '') ?? ''}
              precision={2}
              style={{ width: '100%' }}
              size={isMobile ? 'middle' : 'large'}
              autoFocus
              disabled={loadingBalance}
            />
          )}
        </div>
      </Card>
      <style jsx>{`
        .currency-wrapper {
          position: relative;
          display: inline-flex;
          align-items: flex-start;
        }
        
        .cents-superscript {
          font-size: ${isMobile ? '40%' : '45%'};
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