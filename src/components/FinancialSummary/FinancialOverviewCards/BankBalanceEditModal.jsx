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

      {/* Global JSX Styles specific to this modal */}
      {/* Note: Using <style jsx global> applies styles globally, which might affect
          other modals if class names are not specific enough. Consider scoping
          styles or using CSS Modules if conflicts arise. */}
      <style jsx global>{`
        /* Style the modal content container */
        .bank-balance-modal .ant-modal-content {
          border-radius: 20px; /* Rounded corners for the modal */
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.12); /* Soft shadow */
          overflow: hidden; /* Ensure content respects border radius */
          padding: 0; /* Remove default padding */
        }

        /* Style the custom header */
        .modal-header {
          padding: 16px 24px; /* Padding inside the header */
          background: linear-gradient(135deg, #1D4ED8, #3B82F6); /* Blue gradient background */
          color: white; /* White text color */
          border-radius: 20px 20px 0 0; /* Rounded top corners */
        }

        /* Style the icon container in the header */
        .modal-icon-container {
          width: 38px;
          height: 38px;
          background-color: rgba(255, 255, 255, 0.2); /* Semi-transparent white background */
          border-radius: 12px; /* Rounded corners for the icon background */
          display: flex;
          align-items: center;
          justify-content: center;
          color: white; /* White icon color */
        }

        /* Style the modal title */
        .modal-title {
          color: white !important; /* Ensure white color overrides Ant Design defaults */
          margin: 0 !important; /* Remove default margins */
          font-size: 18px !important; /* Set font size */
          font-weight: 600 !important; /* Medium font weight */
        }

        /* Container for the form elements */
        .balance-form-container {
          padding: 24px; /* Padding around the form */
        }

        /* Flex container for form items */
        .balance-form-content {
          display: flex;
          flex-direction: column;
          gap: 20px; /* Space between form elements */
        }

        /* Style the current balance display box */
        .current-balance-display {
          background-color: #F9FAFC; /* Light grey background */
          border: 1px solid #EDF1F7; /* Light border */
          border-radius: 14px; /* Rounded corners */
          padding: 16px; /* Padding inside the box */
          display: flex;
          flex-direction: column;
          gap: 4px; /* Space between label and value */
        }

        /* Style the 'Current Balance' label */
        .balance-label {
          font-size: 14px;
          color: #64748B; /* Grey text color */
          font-weight: 500; /* Medium weight */
        }

        /* Style the balance value */
        .balance-value {
          font-size: 24px;
          font-weight: 600; /* Semi-bold weight */
          color: #0F172A; /* Dark text color */
        }

        /* Style the 'Enter New Balance' label */
        .new-balance-label {
          font-size: 14px;
          font-weight: 500;
          color: #334155; /* Darker grey text */
        }

        /* Style the InputNumber component */
        .balance-input {
          height: 48px !important; /* Taller input */
          width: 100% !important; /* Full width */
          border-radius: 12px !important; /* Rounded corners */
          font-size: 16px !important; /* Larger font size */
          padding: 8px 12px !important; /* Padding inside input */
          border: 1px solid #D1D5DB !important; /* Standard border */
        }
        .balance-input:focus-within { /* Style when input is focused */
           border-color: #3B82F6 !important; /* Blue border on focus */
           box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important; /* Blue shadow on focus */
        }

        /* Ensure the actual input field within InputNumber respects height */
        .balance-input .ant-input-number-input {
          height: 100% !important;
          font-size: 16px !important;
          padding-left: 30px !important; /* Make space for the icon */
        }

        /* Style the icon inside the input */
        .field-icon {
          color: #9CA3AF !important; /* Grey icon color */
          position: absolute; /* Position icon absolutely */
          left: 12px; /* Position from left */
          top: 50%; /* Center vertically */
          transform: translateY(-50%); /* Fine-tune vertical centering */
          z-index: 1; /* Ensure icon is above input field */
        }

        /* Style the help text below the input */
        .balance-help-text {
          font-size: 13px; /* Slightly smaller font size */
          color: #64748B; /* Grey text color */
          text-align: center; /* Center align text */
          margin-top: -8px; /* Reduce space above help text */
        }

        /* Style the custom footer */
        .modal-footer {
          display: flex;
          justify-content: flex-end; /* Align buttons to the right */
          padding: 14px 24px; /* Padding for the footer */
          border-top: 1px solid #F0F0F0; /* Light top border */
          gap: 12px; /* Space between buttons */
        }

        /* Common styles for footer buttons */
        .modal-footer .ant-btn {
          padding: 0 20px; /* Horizontal padding */
          height: 44px; /* Button height */
          font-size: 15px; /* Button font size */
          border-radius: 12px; /* Rounded corners */
          min-width: 100px; /* Minimum width */
          font-weight: 500; /* Medium font weight */
          display: inline-flex; /* Align icon and text */
          align-items: center;
          justify-content: center;
          gap: 6px; /* Space between icon and text */
        }

        /* Style the cancel button */
        .cancel-button {
          color: #4B5563; /* Dark grey text */
          background-color: #FFFFFF; /* White background */
          border-color: #D1D5DB; /* Grey border */
        }
         .cancel-button:hover {
           background-color: #F9FAFB !important; /* Light grey on hover */
           border-color: #9CA3AF !important; /* Darker grey border on hover */
           color: #1F2937 !important; /* Darker text on hover */
         }

        /* Style the primary update button */
        .complete-button {
          background-color: #2563EB; /* Blue background */
          border-color: #2563EB; /* Blue border */
        }
        .complete-button:hover {
           background-color: #1D4ED8 !important; /* Darker blue on hover */
           border-color: #1D4ED8 !important;
        }
        .complete-button.ant-btn-loading { /* Style when button is loading */
            background-color: #60A5FA !important; /* Lighter blue when loading */
            border-color: #60A5FA !important;
        }

        /* Responsive adjustments for smaller screens */
        @media (max-width: 768px) {
          .balance-value {
            font-size: 22px; /* Slightly smaller balance value */
          }

          .balance-input {
            font-size: 16px !important; /* Adjust input font size if needed */
          }

          .modal-footer .ant-btn {
            min-width: 90px; /* Slightly smaller min-width for buttons */
            height: 40px; /* Slightly shorter buttons */
            font-size: 14px; /* Smaller font */
          }
          .modal-footer {
             gap: 8px; /* Reduce gap between buttons */
             padding: 12px 16px; /* Reduce footer padding */
          }
           .balance-form-container {
              padding: 20px 16px; /* Reduce form padding */
           }
           .modal-header {
              padding: 14px 16px; /* Reduce header padding */
           }
        }
      `}</style>
    </Modal>
  );
}
