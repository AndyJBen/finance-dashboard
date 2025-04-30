// src/components/FinancialSummary/FinancialOverviewCards/BankBalanceEditModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Modal, Form, InputNumber, Typography, Row, Col, Button, message
} from 'antd';
import {
  IconBuildingBank,
  IconCheck,
  IconCoin
} from '@tabler/icons-react';
import { FinanceContext } from '../../../contexts/FinanceContext';

const { Title, Text } = Typography;

export default function BankBalanceEditModal({ open, onClose }) {
  const [form] = Form.useForm();
  const { bankBalance, updateBalance } = useContext(FinanceContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize form with current bank balance when the modal opens
  useEffect(() => {
    if (open && typeof bankBalance === 'number') {
      form.setFieldsValue({ balance: bankBalance });
    }
  }, [open, bankBalance, form]);

  const handleOk = async () => {
    setIsSubmitting(true);
    try {
      const values = await form.validateFields();
      
      if (typeof values.balance !== 'number' || isNaN(values.balance)) {
        message.warning('Please enter a valid amount');
        setIsSubmitting(false);
        return;
      }

      const result = await updateBalance({ balance: values.balance });
      
      if (result) {
        message.success('Bank balance updated successfully');
        onClose();
      } else {
        message.error('Failed to update bank balance');
      }
    } catch (errInfo) {
      console.error('Validation Failed or API Error:', errInfo);
      message.error('Failed to update bank balance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={null}
      onOk={handleOk}
      onCancel={handleCancel}
      width={isMobile ? '92%' : 420}
      style={{ 
        top: 20,
        margin: '0 auto',
        padding: 0
      }}
      bodyStyle={{ 
        padding: 0,
        borderRadius: '20px',
        overflow: 'hidden' 
      }}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
      className="bank-balance-modal modern-overlay"
      footer={
        <div className="modal-footer">
          <Button onClick={handleCancel} className="cancel-button">Cancel</Button>
          <Button 
            type="primary" 
            onClick={handleOk} 
            loading={isSubmitting}
            icon={<IconCheck size={16} />}
            className="complete-button"
          >
            {isSubmitting ? 'Updating...' : 'Update Balance'}
          </Button>
        </div>
      }
    >
      {/* Custom Header */}
      <div className="modal-header">
        <Row align="middle" gutter={12}>
          <Col>
            <div className="modal-icon-container">
              <IconBuildingBank size={22} />
            </div>
          </Col>
          <Col>
            <Title level={4} className="modal-title">Update Bank Balance</Title>
          </Col>
        </Row>
      </div>

      {/* Form */}
      <div className="balance-form-container">
        <Form 
          form={form} 
          layout="vertical" 
          name="bankBalanceForm" 
          autoComplete="off"
          className="balance-form"
        >
          <div className="balance-form-content">
            <div className="current-balance-display">
              <Text className="balance-label">Current Balance</Text>
              <Text className="balance-value">
                ${typeof bankBalance === 'number' ? bankBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
              </Text>
            </div>
            
            <Form.Item
              name="balance"
              label={<Text className="new-balance-label">Enter New Balance</Text>}
              rules={[{ required: true, message: 'Please enter your bank balance' }]}
            >
              <InputNumber
                className="balance-input"
                prefix={<IconCoin size={18} className="field-icon" />}
                placeholder="New Balance"
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                precision={2}
                controls={false}
              />
            </Form.Item>
            
            <div className="balance-help-text">
              <Text type="secondary">
                This will update your current bank balance across all views.
              </Text>
            </div>
          </div>
        </Form>
      </div>
      
      {/* Custom styles */}
      <style jsx global>{`
        .bank-balance-modal .ant-modal-content {
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          padding: 0;
        }
        
        .modal-header {
          padding: 16px 24px;
          background: linear-gradient(135deg, #1D4ED8, #3B82F6);
          color: white;
          border-radius: 20px 20px 0 0;
        }
        
        .modal-icon-container {
          width: 38px;
          height: 38px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .modal-title {
          color: white !important;
          margin: 0 !important;
          font-size: 18px !important;
        }
        
        .balance-form-container {
          padding: 24px;
        }
        
        .balance-form-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .current-balance-display {
          background-color: #F9FAFC;
          border: 1px solid #EDF1F7;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .balance-label {
          font-size: 14px;
          color: #64748B;
          font-weight: 500;
        }
        
        .balance-value {
          font-size: 24px;
          font-weight: 600;
          color: #0F172A;
        }
        
        .new-balance-label {
          font-size: 14px;
          font-weight: 500;
          color: #334155;
        }
        
        .balance-input {
          height: 48px !important;
          width: 100% !important;
          border-radius: 12px !important;
          font-size: 16px !important;
          padding: 8px 12px !important;
        }
        
        .balance-input .ant-input-number-input {
          height: 100% !important;
          font-size: 16px !important;
        }
        
        .field-icon {
          color: #1D4ED8 !important;
          margin-right: 8px;
        }
        
        .balance-help-text {
          font-size: 14px;
          color: #64748B;
          text-align: center;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 14px 24px;
          border-top: 1px solid #F0F0F0;
          gap: 16px;
        }
        
        .modal-footer .ant-btn {
          padding: 0 20px;
          height: 44px;
          font-size: 15px;
          border-radius: 12px;
          min-width: 100px;
        }
        
        .cancel-button {
          color: #64748B;
          border-color: #E2E8F0;
        }
        
        .complete-button {
          background-color: #1D4ED8;
        }
        
        /* Enhanced mobile experience */
        @media (max-width: 768px) {
          .balance-value {
            font-size: 22px;
          }
          
          .balance-input {
            font-size: 18px !important;
          }
          
          .modal-footer .ant-btn {
            min-width: 80px;
          }
        }
      `}</style>
    </Modal>
  );
}