// src/components/Sidebar/AddCreditCardModal.jsx
// COMPLETE FILE CODE
// Highlight: Combined multiple catch blocks in handleOk into one.

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Typography, Row, Col } from 'antd';
import {
    IconPlus,
    IconCreditCard,
    IconCoin
} from '@tabler/icons-react';

const { Title } = Typography;

// Destructure props, using 'open' for AntD v5 compatibility
const AddCreditCardModal = ({ open, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Log the value of the 'open' prop whenever the component re-renders
  // console.log(`[AddCreditCardModal] Rendering with open = ${open}`); // Keep for debugging if needed

  // Effect to reset form fields when the modal becomes visible
  useEffect(() => {
    if (open) {
      // console.log("[AddCreditCardModal] Modal is open, resetting form fields.");
      form.resetFields(); // Reset fields when modal opens
    }
  }, [open, form]); // Depend on 'open' and 'form'

  // Handler for the OK button click
  const handleOk = async () => {
    // Highlight: Combined catch blocks
    try {
      // Validate the form fields
      const values = await form.validateFields();
      console.log("[AddCreditCardModal] Form validated. Values:", values);
      setLoading(true); // Set loading state for confirmation button

      // Prepare payload for submission
      const payload = {
          name: values.name.trim(), // Trim whitespace from name
          balance: values.balance ?? 0 // Default balance to 0 if undefined/null
      };
      console.log("[AddCreditCardModal] Calling onSubmit with payload:", payload);

      // Call the onSubmit function passed via props (should be createCreditCard from context)
      const result = await onSubmit(payload);
      setLoading(false); // Turn off loading state (always do this after await)

      // If the submission was successful (context function returned truthy)
      if (result) {
        console.log("[AddCreditCardModal] onSubmit successful, calling onClose.");
        onClose(); // Close the modal
      } else {
        console.log("[AddCreditCardModal] onSubmit reported failure.");
        // Error message should be handled by the context function
      }
    } catch (errorInfo) { // Single catch block handles both validation and submit errors
      setLoading(false); // Ensure loading is turned off on any error
      // Check if it's a validation error (Ant Design specific structure)
      if (errorInfo && errorInfo.errorFields && Array.isArray(errorInfo.errorFields)) {
          console.error('[AddCreditCardModal] Form Validation Failed:', errorInfo);
          // No need to show message here, Form validation highlights fields
      } else {
          // Assume it's an error during the onSubmit call
          console.error('[AddCreditCardModal] Error during form submission/onSubmit call:', errorInfo);
          // Error message should be handled by the context function, or show a generic one here if needed
          // message.error("Failed to add credit card.");
      }
    }
  };

  // Custom styles for modal parts
  const modalStyles = {
    header: { borderBottom: '1px solid #f0f0f0', padding: '16px 24px', backgroundColor: '#f9fafc' },
    body: { padding: '24px' },
    footer: { borderTop: '1px solid #f0f0f0', padding: '12px 24px' }
  };

  // Consistent input height
  const inputHeight = '45px';

  // --- Component Render ---
  return (
    <Modal
      title={null} // Disable default title
      open={open} // Use 'open' prop (AntD v5)
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Add Card"
      destroyOnClose
      maskClosable={!loading}
      width={450}
      styles={{ // Use 'styles' prop (AntD v5)
          body: modalStyles.body,
          footer: modalStyles.footer,
      }}
    >
      {/* Custom Header */}
      <div style={modalStyles.header}>
        <Row align="middle" gutter={16}>
          <Col>
            <div style={{ backgroundColor: '#52c41a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px', fontSize: '18px' }}>
              <IconPlus size={20} />
            </div>
          </Col>
          <Col>
            <Title level={4} style={{ margin: 0 }}>Add New Credit Card</Title>
          </Col>
        </Row>
      </div>

      {/* Form */}
      <Form form={form} layout="vertical" name="addCreditCardForm" style={{ marginTop: '16px' }} >
        {/* Card Name Input Field */}
        <Form.Item name="name" label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Card Name</span>} rules={[ { required: true, message: 'Please input the card name!' }, { whitespace: true, message: 'Card name cannot be empty spaces!' }, { max: 50, message: 'Card name too long (max 50 chars)!' } ]} >
          <Input prefix={<IconCreditCard size={16} style={{ color: '#1677ff' }} />} placeholder="e.g., Visa Gold" style={{ height: inputHeight, borderRadius: '8px' }} />
        </Form.Item>

        {/* Initial Balance Input Field */}
        <Form.Item name="balance" label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Current Balance</span>} rules={[{ required: true, message: 'Please input the current balance!' }]} initialValue={0} >
          <InputNumber prefix={<IconCoin size={16} style={{ color: '#1677ff' }} />} precision={2} step={10} formatter={(value) => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? ''} style={{ width: '100%', height: inputHeight, borderRadius: '8px' }} placeholder="0.00" />
        </Form.Item>
      </Form>
    </Modal>
  );
  // --- End Component Render ---
};

export default AddCreditCardModal;
