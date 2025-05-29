// src/components/Sidebar/AddCreditCardModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Checkbox, Typography, Row, Col } from 'antd';
import {
    IconPlus,
    IconCreditCard,
    IconCoin
} from '@tabler/icons-react';
import './AddCreditCardModal.css';

const { Title } = Typography;

const AddCreditCardModal = ({ open, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields(); // Reset fields when modal opens
    }
  }, [open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
          name: values.name.trim(),
          balance: values.balance ?? 0,
          includeInDueBalance: values.includeInDueBalance
      };

      const result = await onSubmit(payload);
      setLoading(false);

      if (result) {
        onClose();
      } else {
        // Error message should be handled by the context function
        console.log("[AddCreditCardModal] onSubmit reported failure.");
      }
    } catch (errorInfo) {
      setLoading(false);
      if (errorInfo && errorInfo.errorFields && Array.isArray(errorInfo.errorFields)) {
          console.error('[AddCreditCardModal] Form Validation Failed:', errorInfo);
      } else {
          console.error('[AddCreditCardModal] Error during form submission/onSubmit call:', errorInfo);
      }
    }
  };

  const modalStyles = {
    header: { borderBottom: '1px solid #f0f0f0', padding: '16px 24px', backgroundColor: '#f9fafc' },
    body: { padding: '24px' },
    footer: { borderTop: '1px solid #f0f0f0', padding: '12px 24px' }
  };

  const inputHeight = '45px';

  return (
    <Modal
      title={null}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Add Card"
      destroyOnClose
      maskClosable={!loading}
      width={450}
      styles={{
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
        <Form.Item
          name="name"
          label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Card Name</span>}
          rules={[
            { required: true, message: 'Please input the card name!' },
            { whitespace: true, message: 'Card name cannot be empty spaces!' },
            { max: 50, message: 'Card name too long (max 50 chars)!' }
          ]}
        >
          <Input
            prefix={<IconCreditCard size={16} style={{ color: '#1677ff' }} />}
            placeholder="e.g., Visa Gold"
            style={{ height: inputHeight, borderRadius: '8px' }}
          />
        </Form.Item>

        {/* Initial Balance Input Field */}
        <Form.Item
          name="balance"
          label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Current Balance</span>}
          rules={[{ required: true, message: 'Please input the current balance!' }]}
          initialValue={0}
        >
          <InputNumber
            prefix={<IconCoin size={16} style={{ color: '#1677ff' }} />}
            precision={2}
            step={10}
            formatter={(value) => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? ''}
            style={{ width: '100%', height: inputHeight, borderRadius: '8px' }}
            placeholder="0.00"
          />
        </Form.Item>

        {/* Include in Due Balance Checkbox */}
        <Form.Item
          name="includeInDueBalance"
          valuePropName="checked"
          initialValue={true} // Default to checked
        >
          <Checkbox>
            <span style={{ fontSize: '14px', fontWeight: 400 }}>Include balance in "Due Balance"</span>
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCreditCardModal;
