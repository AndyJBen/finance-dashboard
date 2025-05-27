// iOS-Inspired Edit Bill Modal Component
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Checkbox, Typography, Button } from 'antd';
import {
    IconEdit,
    IconPlus,
    IconTag,
    IconCalendar,
    IconCurrencyDollar,
    IconCheck,
    IconX,
    IconRepeat
} from '@tabler/icons-react';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

// Bill categories
const billCategories = [
    "Utilities", "Rent", "Mortgage", "Groceries", "Subscription",
    "Credit Card", "Loan", "Insurance", "Medical", "Personal Care",
    "Bill Prep", "Auto", "Other"
];

const IOSEditBillModal = ({ open, onCancel, onSubmit, initialData }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
          dueDate: initialData.dueDate && dayjs(initialData.dueDate).isValid() ? dayjs(initialData.dueDate) : null,
          isRecurring: Boolean(initialData.isRecurring),
          isPaid: Object.prototype.hasOwnProperty.call(initialData, 'isPaid') ? Boolean(initialData.isPaid) : false,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isPaid: false, isRecurring: false });
      }
    }
  }, [open, initialData, form]);

  // Reset submitting state when modal closes
  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        dueDate: values.dueDate && dayjs(values.dueDate).isValid()
          ? values.dueDate.format('YYYY-MM-DD')
          : null,
        amount: Number(values.amount) || 0,
        isPaid: Boolean(values.isPaid),
        isRecurring: Boolean(values.isRecurring)
      };
      
      if (initialData && initialData.id) {
        formattedValues.id = initialData.id;
      }

      setIsSubmitting(true);
      await onSubmit(formattedValues);
      setIsSubmitting(false);
    } catch (err) {
      console.error('Form validation failed:', err);
      setIsSubmitting(false);
    }
  };

  const modalTitle = initialData ? 'Edit Bill' : 'Add Bill';

  return (
    <div>
      <Modal
        open={open}
        onCancel={onCancel}
        footer={null}
        centered
        width="100%"
        style={{ 
          maxWidth: '390px',
          margin: '0 auto',
          padding: 0
        }}
        bodyStyle={{ padding: 0 }}
        maskStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)'
        }}
        className="ios-edit-bill-modal"
      >
        {/* Modal Content */}
        <div className="ios-modal-container">
          {/* Header */}
          <div className="ios-modal-header">
            <Button 
              type="text" 
              className="ios-cancel-button"
              onClick={onCancel}
              icon={<IconX size={18} />}
            />
            <Text className="ios-modal-title">{modalTitle}</Text>
            <Button 
              type="text" 
              className="ios-done-button"
              onClick={handleSubmit}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Done'}
            </Button>
          </div>

          {/* Form Content */}
          <div className="ios-modal-content">
            <Form
              form={form}
              layout="vertical"
              name="billForm"
              className="ios-bill-form"
            >
              {/* Bill Name Section */}
              <div className="ios-form-section">
                <div className="ios-section-header">
                  <IconTag size={20} className="ios-section-icon" />
                  <Text className="ios-section-title">Bill Details</Text>
                </div>
                
                <div className="ios-input-group">
                  <Form.Item 
                    name="name" 
                    rules={[{ required: true, message: 'Bill name is required' }]}
                    className="ios-form-item"
                  >
                    <div className="ios-input-container">
                      <Text className="ios-input-label">Name</Text>
                      <Input 
                        placeholder="Enter bill name"
                        className="ios-input"
                        variant="borderless"
                      />
                    </div>
                  </Form.Item>

                  <div className="ios-input-divider" />

                  <Form.Item 
                    name="amount" 
                    rules={[
                      { required: true, message: 'Amount is required' },
                      { type: 'number', min: 0, message: 'Amount must be positive' }
                    ]}
                    className="ios-form-item"
                  >
                    <div className="ios-input-container">
                      <Text className="ios-input-label">Amount</Text>
                      <InputNumber
                        placeholder="0.00"
                        className="ios-input ios-number-input"
                        variant="borderless"
                        min={0}
                        step={0.01}
                        formatter={(value) => value ? `$${value}` : ''}
                        parser={(value) => value?.replace(/\$\s?/g, '') || ''}
                        controls={false}
                      />
                    </div>
                  </Form.Item>

                  <div className="ios-input-divider" />

                  <Form.Item 
                    name="category" 
                    rules={[{ required: true, message: 'Category is required' }]}
                    className="ios-form-item"
                  >
                    <div className="ios-input-container">
                      <Text className="ios-input-label">Category</Text>
                      <Select
                        placeholder="Select category"
                        className="ios-select"
                        variant="borderless"
                        suffixIcon={null}
                        dropdownStyle={{
                          borderRadius: '16px',
                          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                          border: 'none'
                        }}
                      >
                        {billCategories.map(category => (
                          <Option key={category} value={category}>
                            {category}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Form.Item>
                </div>
              </div>

              {/* Due Date Section */}
              <div className="ios-form-section">
                <div className="ios-section-header">
                  <IconCalendar size={20} className="ios-section-icon" />
                  <Text className="ios-section-title">Due Date</Text>
                </div>
                
                <div className="ios-input-group">
                  <Form.Item 
                    name="dueDate" 
                    rules={[{ required: true, message: 'Due date is required' }]}
                    className="ios-form-item"
                  >
                    <div className="ios-input-container">
                      <Text className="ios-input-label">Date</Text>
                      <DatePicker
                        format="MMM DD, YYYY"
                        placeholder="Select date"
                        className="ios-date-picker"
                        variant="borderless"
                        suffixIcon={null}
                        popupStyle={{
                          borderRadius: '16px',
                          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
                        }}
                      />
                    </div>
                  </Form.Item>
                </div>
              </div>

              {/* Options Section */}
              <div className="ios-form-section">
                <div className="ios-section-header">
                  <IconCheck size={20} className="ios-section-icon" />
                  <Text className="ios-section-title">Options</Text>
                </div>
                
                <div className="ios-toggle-group">
                  <Form.Item 
                    name="isPaid" 
                    valuePropName="checked"
                    className="ios-form-item"
                  >
                    <div className="ios-toggle-container">
                      <div className="ios-toggle-content">
                        <Text className="ios-toggle-label">Mark as Paid</Text>
                        <Text className="ios-toggle-description">Bill has been paid</Text>
                      </div>
                      <Checkbox className="ios-checkbox" />
                    </div>
                  </Form.Item>

                  <div className="ios-input-divider" />

                  <Form.Item 
                    name="isRecurring" 
                    valuePropName="checked"
                    className="ios-form-item"
                  >
                    <div className="ios-toggle-container">
                      <div className="ios-toggle-content">
                        <div className="ios-toggle-title-row">
                          <IconRepeat size={16} className="ios-toggle-icon" />
                          <Text className="ios-toggle-label">Recurring Bill</Text>
                        </div>
                        <Text className="ios-toggle-description">Repeats monthly</Text>
                      </div>
                      <Checkbox className="ios-checkbox" />
                    </div>
                  </Form.Item>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        /* iOS Modal Styling */
        .ios-edit-bill-modal .ant-modal {
          padding: 20px;
        }

        .ios-edit-bill-modal .ant-modal-content {
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 0.5px solid rgba(255, 255, 255, 0.2);
        }

        .ios-modal-container {
          background: #F2F2F7;
          min-height: 70vh;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .ios-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .ios-modal-title {
          font-size: 17px;
          font-weight: 600;
          color: #000;
          letter-spacing: -0.4px;
        }

        .ios-cancel-button {
          color: #007AFF !important;
          font-size: 17px;
          font-weight: 400;
          padding: 0 !important;
          height: auto !important;
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .ios-done-button {
          color: #007AFF !important;
          font-size: 17px;
          font-weight: 600;
          padding: 0 !important;
          height: auto !important;
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .ios-done-button:disabled {
          color: #C7C7CC !important;
        }

        /* Content */
        .ios-modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 0 0 20px 0;
        }

        .ios-bill-form {
          width: 100%;
        }

        /* Form Sections */
        .ios-form-section {
          margin-bottom: 32px;
        }

        .ios-section-header {
          display: flex;
          align-items: center;
          padding: 0 20px 12px 20px;
          gap: 8px;
        }

        .ios-section-icon {
          color: #007AFF;
        }

        .ios-section-title {
          font-size: 15px;
          font-weight: 600;
          color: #000;
          letter-spacing: -0.2px;
        }

        /* Input Groups */
        .ios-input-group {
          background: #fff;
          border-radius: 16px;
          margin: 0 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .ios-toggle-group {
          background: #fff;
          border-radius: 16px;
          margin: 0 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .ios-form-item {
          margin-bottom: 0 !important;
        }

        .ios-input-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          min-height: 56px;
        }

        .ios-input-label {
          font-size: 17px;
          font-weight: 400;
          color: #000;
          letter-spacing: -0.4px;
          min-width: 80px;
          text-align: left;
        }

        .ios-input {
          flex: 1;
          text-align: right;
          font-size: 17px;
          color: #000;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }

        .ios-input::placeholder {
          color: #C7C7CC;
          font-size: 17px;
        }

        .ios-number-input.ant-input-number {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          width: 120px;
        }

        .ios-number-input .ant-input-number-input {
          text-align: right;
          font-size: 17px;
          color: #000;
          background: transparent;
          border: none;
          box-shadow: none;
          padding: 0;
        }

        .ios-select.ant-select {
          width: 140px;
        }

        .ios-select .ant-select-selector {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          text-align: right;
        }

        .ios-select .ant-select-selection-item {
          font-size: 17px;
          color: #000;
          padding: 0;
        }

        .ios-select .ant-select-selection-placeholder {
          color: #C7C7CC;
          font-size: 17px;
        }

        .ios-date-picker.ant-picker {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          width: 140px;
        }

        .ios-date-picker .ant-picker-input {
          text-align: right;
        }

        .ios-date-picker .ant-picker-input input {
          font-size: 17px;
          color: #000;
          text-align: right;
        }

        .ios-date-picker .ant-picker-input input::placeholder {
          color: #C7C7CC;
        }

        /* Dividers */
        .ios-input-divider {
          height: 0.5px;
          background: rgba(0, 0, 0, 0.1);
          margin-left: 100px;
        }

        /* Toggle Containers */
        .ios-toggle-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          min-height: 56px;
        }

        .ios-toggle-content {
          flex: 1;
        }

        .ios-toggle-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
        }

        .ios-toggle-icon {
          color: #007AFF;
        }

        .ios-toggle-label {
          font-size: 17px;
          font-weight: 400;
          color: #000;
          letter-spacing: -0.4px;
          margin-bottom: 2px;
          display: block;
        }

        .ios-toggle-description {
          font-size: 15px;
          color: #8E8E93;
          letter-spacing: -0.2px;
        }

        /* Checkboxes */
        .ios-checkbox.ant-checkbox-wrapper {
          font-size: 0;
        }

        .ios-checkbox .ant-checkbox {
          transform: scale(1.2);
        }

        .ios-checkbox .ant-checkbox-inner {
          border-radius: 6px;
          border-color: #C7C7CC;
          background: #fff;
        }

        .ios-checkbox .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #007AFF;
          border-color: #007AFF;
        }

        .ios-checkbox .ant-checkbox-checked .ant-checkbox-inner::after {
          border-color: #fff;
        }

        /* Dropdown Styling */
        .ant-select-dropdown {
          border-radius: 16px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
          border: none !important;
          padding: 8px 0;
        }

        .ant-select-item {
          padding: 12px 20px;
          font-size: 17px;
          color: #000;
          border-radius: 0;
        }

        .ant-select-item-option-selected {
          background-color: #F2F2F7;
        }

        .ant-select-item-option-active {
          background-color: #F2F2F7;
        }

        /* Date Picker Dropdown */
        .ant-picker-dropdown {
          border-radius: 16px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
          border: none !important;
        }

        .ant-picker-panel {
          border-radius: 16px;
          background: #fff;
        }

        .ant-picker-header {
          border-bottom: 1px solid #F2F2F7;
        }

        .ant-picker-content th,
        .ant-picker-content td {
          font-size: 15px;
        }

        .ant-picker-cell-today .ant-picker-cell-inner {
          color: #007AFF;
          font-weight: 600;
        }

        .ant-picker-cell-selected .ant-picker-cell-inner {
          background: #007AFF;
          color: #fff;
        }

        /* Mobile Responsiveness */
        @media (max-width: 430px) {
          .ios-edit-bill-modal .ant-modal {
            padding: 0;
            margin: 0;
            max-width: 100%;
            width: 100%;
            height: 100%;
          }

          .ios-edit-bill-modal .ant-modal-content {
            border-radius: 0;
            height: 100vh;
            max-height: 100vh;
          }

          .ios-modal-container {
            min-height: 100vh;
            max-height: 100vh;
          }

          .ios-input-group,
          .ios-toggle-group {
            margin: 0 16px;
          }

          .ios-section-header {
            padding: 0 16px 12px 16px;
          }
        }

        /* Focus States */
        .ios-input:focus,
        .ios-number-input:focus-within,
        .ios-select:focus-within,
        .ios-date-picker:focus-within {
          outline: none;
        }

        .ios-input-container:focus-within {
          background-color: rgba(0, 122, 255, 0.05);
        }

        .ios-toggle-container:active {
          background-color: rgba(0, 0, 0, 0.05);
        }

        /* Haptic Feedback Simulation */
        .ios-done-button:active,
        .ios-cancel-button:active {
          transform: scale(0.95);
          transition: transform 0.1s ease;
        }

        .ios-toggle-container:active {
          transform: scale(0.98);
          transition: transform 0.1s ease;
        }

        .ios-checkbox:active {
          transform: scale(0.95);
          transition: transform 0.1s ease;
        }
      `}</style>
    </div>
  );
};

export default IOSEditBillModal;