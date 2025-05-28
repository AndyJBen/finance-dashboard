// src/components/FinancialSummary/FinancialOverviewCards/BankBalanceEditModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Modal, Form, InputNumber, Typography, Row, Col, Button, message
} from 'antd'; // Using Ant Design components
import {
  IconBuildingBank,
  IconCheck,
  IconCoin
} from '@tabler/icons-react'; // Using Tabler icons
import { FinanceContext } from '../../../contexts/FinanceContext'; // Importing finance context
import './BankBalanceEditModal.css';

const { Title, Text } = Typography;

export default function BankBalanceEditModal({ open, onClose }) {
  // Ant Design form instance
  const [form] = Form.useForm();
  // Get balance and update function from context
  const { bankBalance, updateBalance } = useContext(FinanceContext);
  // State to manage submission loading status
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State to track if the viewport is mobile size
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Effect to update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    // Cleanup listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to initialize the form field with the current bank balance
  // when the modal opens or the balance changes.
  useEffect(() => {
    if (open && typeof bankBalance === 'number') {
      form.setFieldsValue({ balance: bankBalance });
    }
    // Reset submitting state when modal opens/closes or balance changes
    // This prevents the button staying in loading state if modal is closed prematurely
    if (!open) {
        setIsSubmitting(false);
    }
  }, [open, bankBalance, form]);

  // Handler for the OK button click (form submission)
  const handleOk = async () => {
    setIsSubmitting(true); // Set loading state
    try {
      // Validate form fields
      const values = await form.validateFields();

      // Additional check to ensure balance is a valid number
      if (typeof values.balance !== 'number' || isNaN(values.balance)) {
        message.warning('Please enter a valid amount');
        setIsSubmitting(false); // Reset loading state
        return;
      }

      // Call the updateBalance function from context
      // Assuming updateBalance returns a truthy value on success
      const result = await updateBalance({ balance: values.balance });

      if (result) {
        message.success('Bank balance updated successfully');
        onClose(); // Close the modal on success
      } else {
        // Handle potential failure case if updateBalance returns falsy
        message.error('Failed to update bank balance');
      }
    } catch (errInfo) {
      // Handle validation errors or errors from the updateBalance API call
      console.error('Validation Failed or API Error:', errInfo);
      message.error('Failed to update bank balance');
    } finally {
      // Always reset loading state, regardless of success or failure
      setIsSubmitting(false);
    }
  };

  // Handler for the Cancel button click or modal close
  const handleCancel = () => {
    form.resetFields(); // Reset form fields to initial state
    onClose(); // Call the onClose prop to close the modal
  };

  return (
    <Modal
      open={open} // Control modal visibility
      title={null} // Custom header is used instead of default title
      onOk={handleOk} // Handler for OK button
      onCancel={handleCancel} // Handler for Cancel button/closing
      width={isMobile ? '92%' : 420} // Responsive width
      style={{
        top: 20, // Position modal slightly from the top
        margin: '0 auto', // Center modal horizontally
        padding: 0 // Remove default padding
      }}
      bodyStyle={{
        padding: 0, // Remove default body padding
        borderRadius: '20px', // Apply border radius to body
        overflow: 'hidden' // Hide overflow
      }}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker mask
        backdropFilter: 'blur(4px)' // Apply blur effect to background
      }}
      className="bank-balance-modal modern-overlay" // Custom class for styling
      footer={ // Custom footer buttons
        <div className="modal-footer">
          <Button onClick={handleCancel} className="cancel-button">Cancel</Button>
          <Button
            type="primary"
            onClick={handleOk}
            loading={isSubmitting} // Show loading state on button
            icon={<IconCheck size={16} />} // Add check icon
            className="complete-button"
          >
            {isSubmitting ? 'Updating...' : 'Update Balance'}
          </Button>
        </div>
      }
    >
      {/* Custom Header Section */}
      <div className="modal-header">
        <Row align="middle" gutter={12}>
          <Col>
            <div className="modal-icon-container">
              <IconBuildingBank size={22} /> {/* Bank Icon */}
            </div>
          </Col>
          <Col>
            <Title level={4} className="modal-title">Update Bank Balance</Title>
          </Col>
        </Row>
      </div>

      {/* Form Section */}
      <div className="balance-form-container">
        <Form
          form={form} // Ant Design form instance
          layout="vertical" // Vertical layout for labels and inputs
          name="bankBalanceForm"
          autoComplete="off" // Disable browser autocomplete
          className="balance-form"
        >
          <div className="balance-form-content">
            {/* Display Current Balance */}
            <div className="current-balance-display">
              <Text className="balance-label">Current Balance</Text>
              <Text className="balance-value">
                {/* Format balance as currency or show 0.00 */}
                ${typeof bankBalance === 'number' ? bankBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
              </Text>
            </div>

            {/* Input for New Balance */}
            <Form.Item
              name="balance" // Field name
              label={<Text className="new-balance-label">Enter New Balance</Text>} // Custom label
              rules={[{ required: true, message: 'Please enter your bank balance' }]} // Validation rule
            >
              <InputNumber
                className="balance-input" // Custom class for styling
                prefix={<IconCoin size={18} className="field-icon" />} // Coin icon prefix
                placeholder="New Balance"
                // Formatter to display value with $ and commas
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                // Parser to remove $ and commas before processing
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                precision={2} // Allow up to 2 decimal places
                controls={false} // Hide spinner controls
                style={{ width: '100%' }} // Ensure input takes full width
              />
            </Form.Item>

            {/* Help Text */}
            <div className="balance-help-text">
              <Text type="secondary">
                This will update your current bank balance across all views.
              </Text>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
