// src/components/Sidebar/EditCreditCardModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Typography, message, Row, Col } from 'antd';
import { IconEdit, IconCreditCard, IconCoin } from '@tabler/icons-react';
import './styles/EditCreditCardModal.css';

const { Title } = Typography;

// FIX 1: Change 'visible' to 'open' in props destructuring
const EditCreditCardModal = ({ open, onClose, onSubmit, cardData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // FIX 2: Use 'open' in the condition and dependency array
    if (open && cardData) {
      form.setFieldsValue({
        name: cardData.name,
        balance: cardData.balance,
      });
    }
  }, [open, cardData, form]); // <--- Depends on 'open' now

  // FIX 4: Revert handleOk to its original logic
  const handleOk = async () => {
    if (!cardData) {
        console.error("Edit modal handleOk called without cardData!");
        return;
    }
    try {
      const values = await form.validateFields();
      setLoading(true);

      const updatePayload = {};
      const trimmedName = values.name.trim();
      const newBalance = values.balance ?? 0;

      if (trimmedName !== cardData.name) {
          updatePayload.name = trimmedName;
      }
      if (Number(newBalance) !== Number(cardData.balance)) {
          updatePayload.balance = newBalance;
      }

      if (Object.keys(updatePayload).length === 0) {
          message.info("No changes detected.");
          setLoading(false);
          onClose();
          return;
      }

      const result = await onSubmit(cardData.id, updatePayload);
      setLoading(false);
      if (result) {
        onClose();
      }
    } catch (validationErrorInfo) {
      console.log('Edit Card Form Validation Failed:', validationErrorInfo);
      setLoading(false); // Ensure loading is false on validation error too
    }
  };

  // Custom styles (no changes needed here)
  const modalStyles = { /* ... */ };
  const inputHeight = '45px';

  return (
    <Modal
      title={null}
      // FIX 3: Use the 'open' prop correctly here
      open={open}
      onOk={handleOk} // Use the original handleOk
      onCancel={onClose}
      confirmLoading={loading}
      okText="Save Changes"
      destroyOnClose
      maskClosable={!loading}
      width={450}
      // Use styles prop, remove bodyStyle/footerStyle if they exist
      styles={{
         body: modalStyles.body,
         footer: modalStyles.footer
      }}
      // bodyStyle={modalStyles.body} // Remove this if present
      // footerStyle={modalStyles.footer} // Remove this if present
    >
      {/* Custom Header */}
      <div style={modalStyles.header}>
        {/* ... header content ... */}
         <Row align="middle" gutter={16}>
            <Col>
                <div style={{ backgroundColor: '#1677ff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px', fontSize: '18px' }}>
                <IconEdit size={20} />
                </div>
            </Col>
            <Col>
                <Title level={4} style={{ margin: 0 }}>Edit Credit Card</Title>
            </Col>
         </Row>
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        name="editCreditCardForm"
        style={{ marginTop: '16px' }}
      >
        {/* Card Name Input Field */}
        <Form.Item
          name="name"
          label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Card Name</span>}
          rules={[ { required: true, message: 'Please input the card name!' }, { whitespace: true, message: 'Card name cannot be just spaces!' }, { max: 50, message: 'Card name too long (max 50 chars)!' } ]}
        >
          <Input
            prefix={<IconCreditCard size={16} style={{ color: '#1677ff' }} />}
            placeholder="e.g., Visa Gold"
            style={{ height: inputHeight, borderRadius: '8px' }}
          />
        </Form.Item>

        {/* Balance Input Field */}
        <Form.Item
          name="balance"
          label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Current Balance</span>}
          rules={[{ required: true, message: 'Please input the current balance!' }]}
        >
          <InputNumber
            prefix={<IconCoin size={16} style={{ color: '#1677ff' }} />}
            precision={2}
            step={10}
            formatter={(value) => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? ''}
            style={{ width: '100%', height: inputHeight, borderRadius: '8px' }}
            placeholder="Enter the current balance"
            inputMode="decimal"
            pattern="[0-9]*"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCreditCardModal;