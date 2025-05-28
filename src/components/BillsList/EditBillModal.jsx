// Unified Apple-Inspired Edit Bill Modal
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Checkbox, Typography, Button, Avatar } from 'antd';
import {
    IconEdit,
    IconPlus,
    IconTag,
    IconCalendar,
    IconCurrencyDollar,
    IconCheck,
    IconX,
    IconRepeat,
    IconCreditCard,
    IconHome,
    IconBolt,
    IconShoppingCart,
    IconStethoscope,
    IconCar,
    IconWifi,
    IconDeviceLaptop,
    IconFileText,
    IconHelp
} from '@tabler/icons-react';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

// Enhanced bill categories with icons and colors
const billCategories = [
    { name: "Utilities", icon: IconBolt, color: "#FF9500", bgColor: "#FFF2E5" },
    { name: "Rent", icon: IconHome, color: "#007AFF", bgColor: "#E5F2FF" },
    { name: "Mortgage", icon: IconHome, color: "#5856D6", bgColor: "#EEEEFD" },
    { name: "Groceries", icon: IconShoppingCart, color: "#34C759", bgColor: "#E8F8EA" },
    { name: "Subscription", icon: IconDeviceLaptop, color: "#AF52DE", bgColor: "#F4ECFB" },
    { name: "Credit Card", icon: IconCreditCard, color: "#FF3B30", bgColor: "#FFE9E8" },
    { name: "Loan", icon: IconFileText, color: "#FF9500", bgColor: "#FFF2E5" },
    { name: "Insurance", icon: IconCar, color: "#32D74B", bgColor: "#E8F8EA" },
    { name: "Medical", icon: IconStethoscope, color: "#FF3B30", bgColor: "#FFE9E8" },
    { name: "Personal Care", icon: IconHelp, color: "#5856D6", bgColor: "#EEEEFD" },
    { name: "Bill Prep", icon: IconCalendar, color: "#007AFF", bgColor: "#E5F2FF" },
    { name: "Auto", icon: IconCar, color: "#FF9500", bgColor: "#FFF2E5" },
    { name: "Other", icon: IconHelp, color: "#8E8E93", bgColor: "#F2F2F7" }
];

const UnifiedEditBillModal = ({ open, onCancel, onSubmit, initialData }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Find category info
  const getCategoryInfo = (categoryName) => {
    return billCategories.find(cat => cat.name === categoryName) || billCategories[billCategories.length - 1];
  };

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
        setSelectedCategory(initialData.category);
      } else {
        form.resetFields();
        form.setFieldsValue({ isPaid: false, isRecurring: false });
        setSelectedCategory(null);
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

  const modalTitle = initialData ? 'Edit Bill' : 'Create New Bill';
  const categoryInfo = getCategoryInfo(selectedCategory);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width="100%"
      style={{ 
        maxWidth: '95vw',
        margin: '0 auto',
        padding: 0
      }}
      bodyStyle={{ padding: 0 }}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(12px)'
      }}
      className="unified-edit-bill-modal"
    >
      {/* Single Unified Card */}
      <div className="unified-modal-card">
        {/* Compact Header with Current Bill Info */}
        <div className="unified-header" style={{
          background: selectedCategory 
            ? `linear-gradient(135deg, ${categoryInfo.color}08, ${categoryInfo.color}03)`
            : 'linear-gradient(135deg, var(--primary-50), var(--primary-25))'
        }}>
          <div className="header-content">
            <div className="header-main">
              {selectedCategory && (
                <Avatar 
                  size={20}
                  style={{ 
                    backgroundColor: categoryInfo.bgColor,
                    color: categoryInfo.color
                  }}
                  icon={React.createElement(categoryInfo.icon, { size: 12 })}
                />
              )}
              <div className="header-text">
                <Text className="modal-title">{modalTitle}</Text>
                {initialData && (
                  <Text className="current-bill-info">
                    {initialData.name} • ${Number(initialData.amount || 0).toFixed(2)}
                  </Text>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="unified-content">
          <Form
            form={form}
            layout="vertical"
            name="billForm"
            className="unified-form"
          >
            {/* Horizontal Layout Form */}
            <div className="form-section">
              <div className="section-header">
                <IconFileText size={16} className="section-icon" />
                <Text className="section-title">Bill Details</Text>
              </div>
              
              <div className="horizontal-inputs">
                <div className="input-row">
                  <Form.Item 
                    name="name" 
                    rules={[{ required: true, message: 'Required' }]}
                    className="name-input"
                  >
                    <div className="compact-input-wrapper">
                      <Text className="compact-label">Name</Text>
                      <Input 
                        placeholder="Bill name"
                        className="compact-input"
                        variant="borderless"
                      />
                    </div>
                  </Form.Item>

                  <Form.Item 
                    name="amount" 
                    rules={[
                      { required: true, message: 'Required' },
                      { type: 'number', min: 0, message: 'Must be positive' }
                    ]}
                    className="amount-input"
                  >
                    <div className="compact-input-wrapper amount-wrapper">
                      <Text className="compact-label">Amount</Text>
                      <div className="compact-amount-container">
                        <Text className="currency-compact">$</Text>
                        <InputNumber
                          placeholder="0.00"
                          className="compact-amount"
                          variant="borderless"
                          min={0}
                          step={0.01}
                          formatter={(value) => value ? Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                          parser={(value) => value?.replace(/,/g, '') || ''}
                          controls={false}
                        />
                      </div>
                    </div>
                  </Form.Item>
                </div>

                <div className="input-row">
                  <Form.Item 
                    name="category" 
                    rules={[{ required: true, message: 'Required' }]}
                    className="category-input"
                  >
                    <div className="compact-input-wrapper">
                      <Text className="compact-label">Category</Text>
                      <Select
                        placeholder="Select category"
                        className="compact-select"
                        variant="borderless"
                        onChange={setSelectedCategory}
                        optionRender={(option) => {
                          const categoryInfo = getCategoryInfo(option.value);
                          return (
                            <div className="compact-category-option">
                              <Avatar 
                                size={18}
                                style={{ 
                                  backgroundColor: categoryInfo.bgColor,
                                  color: categoryInfo.color
                                }}
                                icon={React.createElement(categoryInfo.icon, { size: 11 })}
                              />
                              <Text className="compact-option-text">{option.value}</Text>
                            </div>
                          );
                        }}
                      >
                        {billCategories.map(category => (
                          <Option key={category.name} value={category.name}>
                            {category.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Form.Item>

                  <Form.Item 
                    name="dueDate" 
                    rules={[{ required: true, message: 'Required' }]}
                    className="date-input"
                  >
                    <div className="compact-input-wrapper">
                      <Text className="compact-label">Due Date</Text>
                      <DatePicker
                        format="MMM DD, YYYY"
                        placeholder="Select date"
                        className="compact-date"
                        variant="borderless"
                        suffixIcon={<IconCalendar size={14} />}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </Form.Item>
                </div>

                <div className="input-row options-row">
                  <Form.Item name="isPaid" valuePropName="checked" className="option-item">
                    <div className="compact-option">
                      <div className="compact-option-icon paid">
                        <IconCheck size={12} />
                      </div>
                      <Text className="compact-option-text">Mark as Paid</Text>
                      <Checkbox className="compact-checkbox" />
                    </div>
                  </Form.Item>

                  <Form.Item name="isRecurring" valuePropName="checked" className="option-item">
                    <div className="compact-option">
                      <div className="compact-option-icon recurring">
                        <IconRepeat size={12} />
                      </div>
                      <Text className="compact-option-text">Recurring Bill</Text>
                      <Checkbox className="compact-checkbox" />
                    </div>
                  </Form.Item>
                </div>
              </div>
            </div>
          </Form>
        </div>

        {/* Bottom Actions */}
        <div className="unified-footer">
          <Button 
            className="footer-cancel"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="primary"
            className="footer-save"
            onClick={handleSubmit}
            loading={isSubmitting}
            icon={<IconCheck size={16} />}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <style jsx global>{`
        /* Mobile-First Design */
        .unified-edit-bill-modal .ant-modal {
          padding: var(--space-8);
          margin: 0;
          max-width: 100%;
          width: 100%;
        }

        .unified-edit-bill-modal .ant-modal-content {
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          background: white;
          padding: 0;
          width: 100%;
          max-width: 95vw;
          margin: 0 auto;
        }

        /* Unified Card Container */
        .unified-modal-card {
          background: white;
          display: flex;
          flex-direction: column;
          height: auto;
          max-height: none;
        }

        /* Mobile Header */
        .unified-header {
          padding: var(--space-16);
          border-bottom: 1px solid var(--neutral-200);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-content {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .header-main {
          display: flex;
          align-items: center;
          gap: var(--space-8);
        }

        .header-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .modal-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--neutral-800);
          line-height: 1.2;
          margin: 0;
        }

        .current-bill-info {
          font-size: 13px;
          color: var(--neutral-500);
          font-weight: 500;
          line-height: 1.1;
          margin: 0;
        }

        /* Mobile Content */
        .unified-content {
          padding: var(--space-16);
        }

        .unified-form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Mobile Form Section */
        .form-section {
          background: var(--neutral-50);
          border-radius: var(--radius-md);
          padding: var(--space-16);
          border: 1px solid var(--neutral-200);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          margin-bottom: var(--space-16);
        }

        .section-icon {
          color: var(--primary-600);
          background: var(--primary-100);
          padding: 6px;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--neutral-800);
          margin: 0;
        }

        /* Mobile Input Layout */
        .horizontal-inputs {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
        }

        .input-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--space-12);
          align-items: start;
        }

        .input-row.options-row {
          grid-template-columns: 1fr 1fr;
          gap: var(--space-8);
        }

        .name-input {
          grid-column: 1 / -1;
        }

        .amount-input,
        .category-input,
        .date-input,
        .option-item {
          margin-bottom: 0 !important;
        }

        .compact-input-wrapper {
          background: white;
          border-radius: var(--radius-md);
          padding: var(--space-12);
          border: 1px solid var(--neutral-200);
          transition: border-color 0.2s ease;
        }

        .compact-input-wrapper:focus-within {
          border-color: var(--primary-600);
        }

        .compact-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--neutral-600);
          display: block;
          margin-bottom: var(--space-8);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        /* Mobile Inputs */
        .compact-input {
          font-size: 15px;
          color: var(--neutral-800);
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          font-weight: 500;
          height: 24px !important;
          line-height: 24px !important;
        }

        .compact-input::placeholder {
          color: var(--neutral-400);
          font-size: 14px;
        }

        /* Mobile Amount */
        .compact-amount-container {
          display: flex;
          align-items: center;
          gap: var(--space-8);
        }

        .currency-compact {
          font-size: 15px;
          font-weight: 600;
          color: var(--primary-600);
        }

        .compact-amount.ant-input-number {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-size: 15px !important;
          font-weight: 600 !important;
          color: var(--neutral-800) !important;
          flex: 1;
          height: 24px !important;
        }

        .compact-amount .ant-input-number-input {
          font-size: 15px !important;
          font-weight: 600 !important;
          background: transparent;
          border: none;
          padding: 0;
          height: 24px !important;
          line-height: 24px !important;
        }

        /* Mobile Select */
        .compact-select.ant-select {
          width: 100%;
          height: 24px;
        }

        .compact-select .ant-select-selector {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          font-size: 14px !important;
          font-weight: 500;
          height: 24px !important;
          min-height: 24px !important;
        }

        .compact-select .ant-select-selection-item,
        .compact-select .ant-select-selection-placeholder {
          line-height: 24px !important;
          padding: 0 !important;
          font-size: 14px !important;
        }

        .compact-category-option {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          padding: var(--space-8);
        }

        .compact-option-text {
          font-size: 14px;
          font-weight: 500;
        }

        /* Mobile Date */
        .compact-date.ant-picker {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          font-size: 14px;
          font-weight: 500;
          height: 24px !important;
        }

        .compact-date .ant-picker-input input {
          font-size: 14px !important;
          font-weight: 500;
          height: 24px !important;
          line-height: 24px !important;
        }

        .compact-date .ant-picker-suffix {
          color: var(--primary-600);
        }

        /* Mobile Options */
        .compact-option {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          background: white;
          padding: var(--space-12);
          border-radius: var(--radius-md);
          border: 1px solid var(--neutral-200);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .compact-option:hover {
          background: var(--neutral-50);
        }

        .compact-option-icon {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .compact-option-icon.paid {
          background: var(--success-500);
        }

        .compact-option-icon.recurring {
          background: var(--primary-600);
        }

        .compact-option .compact-option-text {
          font-size: 14px;
          font-weight: 500;
          color: var(--neutral-800);
          flex: 1;
        }

        .compact-checkbox.ant-checkbox-wrapper {
          font-size: 0;
        }

        .compact-checkbox .ant-checkbox {
          transform: scale(1.1);
        }

        .compact-checkbox .ant-checkbox-inner {
          border-radius: 4px;
          border-color: var(--neutral-300);
          width: 16px;
          height: 16px;
        }

        .compact-checkbox .ant-checkbox-checked .ant-checkbox-inner {
          background: var(--primary-600);
          border-color: var(--primary-600);
        }

        .compact-checkbox .ant-checkbox-checked .ant-checkbox-inner::after {
          width: 5px;
          height: 9px;
          border-width: 2px;
        }

        /* Mobile Footer */
        .unified-footer {
          padding: var(--space-16);
          border-top: 1px solid var(--neutral-200);
          display: flex;
          gap: var(--space-12);
          background: var(--neutral-50);
          margin-top: var(--space-8);
        }

        .footer-cancel {
          flex: 1;
          height: 44px;
          border-radius: var(--radius-md);
          font-weight: 500;
          border-color: var(--neutral-300);
          font-size: 15px;
        }

        .footer-save {
          flex: 2;
          height: 44px;
          border-radius: var(--radius-md);
          font-weight: 600;
          background: var(--primary-600) !important;
          border-color: var(--primary-600) !important;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-8);
          font-size: 15px;
        } var(--space-12) var(--space-16);
          border-top: 1px solid var(--neutral-200);
          display: flex;
          gap: var(--space-8);
          background: var(--neutral-50);
        }

        .footer-cancel {
          flex: 1;
          height: 36px;
          border-radius: 6px;
          font-weight: 500;
          border-color: var(--neutral-300);
          font-size: 13px;
        }

        .footer-save {
          flex: 2;
          height: 36px;
          border-radius: 6px;
          font-weight: 600;
          background: var(--primary-600) !important;
          border-color: var(--primary-600) !important;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 13px;
        }         .footer-save:hover {
          background: var(--primary-700) !important;
          border-color: var(--primary-700) !important;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .unified-edit-bill-modal .ant-modal {
            padding: var(--space-8);
            margin: 0;
            max-width: 100%;
            width: 100%;
            height: 100%;
            top: 0 !important;
          }

          .unified-edit-bill-modal .ant-modal-content {
            border-radius: var(--radius-md);
            height: 100vh;
            max-height: 100vh;
          }

          .unified-modal-card {
            min-height: 100vh;
            max-height: 100vh;
          }

          .unified-content {
            padding: var(--space-8) var(--space-12);
          }

          .compact-inputs {
            grid-template-columns: 1fr;
            gap: var(--space-8);
          }

          .compact-inputs > :nth-child(2) { grid-column: 1; }
          .compact-inputs > :nth-child(3) { grid-column: 1; }

          .compact-options {
            flex-direction: column;
            gap: var(--space-8);
          }

          /* iOS Safe Area */
          .unified-footer {
            padding-bottom: calc(var(--space-12) + env(safe-area-inset-bottom, 0px));
          }
        }

        /* Form Validation */
        .ant-form-item-has-error .compact-input-wrapper {
          border-color: var(--danger-500) !important;
          background: var(--danger-50) !important;
        }

        .ant-form-item-explain-error {
          font-size: 11px;
          color: var(--danger-500);
          margin-top: 2px;
          padding-left: 2px;
        }

        /* Loading State */
        .footer-save.ant-btn-loading {
          background: var(--neutral-400) !important;
          border-color: var(--neutral-400) !important;
        }

        /* Accessibility */
        .compact-input:focus,
        .compact-amount:focus-within,
        .compact-select:focus-within,
        .compact-date:focus-within {
          outline: 1px solid var(--primary-600);
          outline-offset: 1px;
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .compact-input-wrapper,
          .compact-option,
          .footer-save {
            transition: none !important;
          }
        }

        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
          .unified-modal-card,
          .form-section,
          .compact-input-wrapper,
          .compact-option {
            background: var(--neutral-800) !important;
            border-color: var(--neutral-600) !important;
          }

          .modal-title,
          .section-title,
          .compact-label,
          .compact-option-text,
          .compact-input {
            color: var(--neutral-100) !important;
          }

          .current-bill-info {
            color: var(--neutral-400) !important;
          }

          .unified-footer {
            background: var(--neutral-900) !important;
          }
        }
      `}</style>
    </Modal>
  );
};

export default UnifiedEditBillModal;