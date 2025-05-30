// src/components/FinancialSummary/FinancialOverviewCards/BankBalanceCard.jsx

import React, { useContext } from 'react';
import { Card, Col, Space, Statistic, Typography, Tooltip } from 'antd';
import { IconBuildingBank } from '@tabler/icons-react';
import { FinanceContext } from '../../../contexts/FinanceContext';
import BankBalanceEditModal from '../../PopUpModals/BankBalanceEditModal';
import './BankBalanceCard.css';

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
  const { bankBalance, loadingBalance, isEditingBankBalance, toggleBankBalanceEdit } = useContext(FinanceContext);

  // Determine text color based on balance
  const bankBalanceColor =
    bankBalance === null || bankBalance >= 0
      ? 'var(--success-500)'
      : 'var(--danger-500)';

  // Card click handler to open the modal
  const handleCardClick = () => {
    toggleBankBalanceEdit(true);
  };

  return (
    <>
      <Col xs={24} md={8}>
        <Card
          style={{
            background: 'white',
            minHeight: isMobile ? '90px' : styles?.cardHeight,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: 'none',
            borderRadius: isMobile ? 10 : undefined,
            marginBottom: isMobile ? 8 : undefined,
            cursor: 'pointer' // Show it's clickable
          }}
          bodyStyle={{
            padding: isMobile ? '8px 10px' : styles?.cardPadding,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          onClick={handleCardClick} // Make the entire card clickable
        >
          <div>
            <Space
              align="center"
              justify="space-between"
              style={{ width: '100%', marginBottom: isMobile ? 4 : styles?.spaceMargin }}
            >
              <Space align="center">
                <IconBuildingBank
                  size={isMobile ? 16 : styles?.iconSize?.standard}
                  style={{ color: '#47586d', opacity: 0.8, display: 'flex' }}
                />
                <Text style={{
                  fontSize: isMobile ? '0.75rem' : styles?.fontSize?.title,
                  fontWeight: 500,
                  color: '#47586d',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  Bank Balance
                </Text>
              </Space>
            </Space>
          </div>

          <div>
            <Statistic
              value={loadingBalance || isComponentLoading ? null : (bankBalance ?? 0)}
              valueStyle={{
                fontSize: isMobile ? '18px' : styles?.fontSize?.value,
                fontWeight: 700,
                lineHeight: 1,
                marginBottom: 0,
                marginTop: isMobile ? 4 : 0,
                color: bankBalanceColor,
              }}
              formatter={formatCurrencySuperscript}
            />
          </div>
        </Card>
      </Col>

      {/* Bank Balance Edit Modal */}
      <BankBalanceEditModal
        open={isEditingBankBalance}
        onClose={() => toggleBankBalanceEdit(false)}
      />
    </>
  );
};

export default BankBalanceCard;