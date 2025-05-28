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
        maxWidth: '400px',
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
        {/* Dynamic Header Section */}
        <div className="unified-header" style={{
          background: selectedCategory 
            ? `linear-gradient(135deg, ${categoryInfo.color}10, ${categoryInfo.color}05)`
            : 'linear-gradient(135deg, var(--primary-100), var(--primary-50))'
        }}>
          <Button 
            type="text" 
            className="header-close-btn"
            onClick={onCancel}
            icon={<IconX size={18} />}
          />
          
          <div className="header-content">
            {selectedCategory && (
              <Avatar 
                size={28}
                style={{ 
                  backgroundColor: categoryInfo.bgColor,
                  color: categoryInfo.color,
                  marginBottom: 4
                }}
                icon={React.createElement(categoryInfo.icon, { size: 16 })}
              />
            )}
            <Text className="modal-title">{modalTitle}</Text>
            {selectedCategory && (
              <Text className="modal-subtitle">{selectedCategory}</Text>
            )}
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
            {/* Basic Information Section */}
            <div className="form-section">
              <div className="section-header">
                <IconFileText size={18} className="section-icon" />
                <div>
                  <Text className="section-title">Basic Information</Text>
                  <Text className="section-desc">Name and amount details</Text>
                </div>
              </div>
              
              <div className="input-group">
                <Form.Item 
                  name="name" 
                  rules={[{ required: true, message: 'Bill name is required' }]}
                >
                  <div className="input-wrapper">
                    <Text className="input-label">Bill Name</Text>
                    <Input 
                      placeholder="Enter bill name"
                      className="unified-input"
                      variant="borderless"
                    />
                  </div>
                </Form.Item>

                <Form.Item 
                  name="amount" 
                  rules={[
                    { required: true, message: 'Amount is required' },
                    { type: 'number', min: 0, message: 'Amount must be positive' }
                  ]}
                >
                  <div className="input-wrapper amount-input">
                    <Text className="input-label">Amount</Text>
                    <div className="amount-container">
                      <Text className="currency">$</Text>
                      <InputNumber
                        placeholder="0.00"
                        className="unified-amount"
                        variant="borderless"
                        min={0}
                        step={0.01}
                        formatter={(value) => value ? `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
                        parser={(value) => value?.replace(/,/g, '') || ''}
                        controls={false}
                      />
                    </div>
                  </div>
                </Form.Item>
              </div>
            </div>

            {/* Category & Date Section */}
            <div className="form-section">
              <div className="section-header">
                <IconTag size={18} className="section-icon" />
                <div>
                  <Text className="section-title">Classification</Text>
                  <Text className="section-desc">Category and due date</Text>
                </div>
              </div>
              
              <div className="input-group">
                <Form.Item 
                  name="category" 
                  rules={[{ required: true, message: 'Category is required' }]}
                >
                  <div className="input-wrapper">
                    <Text className="input-label">Category</Text>
                    <Select
                      placeholder="Choose category"
                      className="unified-select"
                      variant="borderless"
                      onChange={setSelectedCategory}
                      optionRender={(option) => {
                        const categoryInfo = getCategoryInfo(option.value);
                        return (
                          <div className="category-option">
                            <Avatar 
                              size={24}
                              style={{ 
                                backgroundColor: categoryInfo.bgColor,
                                color: categoryInfo.color,
                                marginRight: 8
                              }}
                              icon={React.createElement(categoryInfo.icon, { size: 14 })}
                            />
                            <Text>{option.value}</Text>
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
                  rules={[{ required: true, message: 'Due date is required' }]}
                >
                  <div className="input-wrapper">
                    <Text className="input-label">Due Date</Text>
                    <DatePicker
                      format="MMM DD, YYYY"
                      placeholder="Select date"
                      className="unified-date"
                      variant="borderless"
                      suffixIcon={<IconCalendar size={16} />}
                      style={{ width: '100%' }}
                    />
                  </div>
                </Form.Item>
              </div>
            </div>

            {/* Options Section */}
            <div className="form-section">
              <div className="section-header">
                <IconCheck size={18} className="section-icon" />
                <div>
                  <Text className="section-title">Options</Text>
                  <Text className="section-desc">Status and recurrence</Text>
                </div>
              </div>
              
              <div className="options-grid">
                <Form.Item name="isPaid" valuePropName="checked">
                  <div className="option-item">
                    <div className="option-icon paid">
                      <IconCheck size={16} />
                    </div>
                    <div className="option-text">
                      <Text className="option-title">Mark as Paid</Text>
                      <Text className="option-desc">This bill is paid</Text>
                    </div>
                    <Checkbox className="option-check" />
                  </div>
                </Form.Item>

                <Form.Item name="isRecurring" valuePropName="checked">
                  <div className="option-item">
                    <div className="option-icon recurring">
                      <IconRepeat size={16} />
                    </div>
                    <div className="option-text">
                      <Text className="option-title">Recurring Bill</Text>
                      <Text className="option-desc">Repeats monthly</Text>
                    </div>
                    <Checkbox className="option-check" />
                  </div>
                </Form.Item>
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
        /* Modal Base */
        .unified-edit-bill-modal .ant-modal-content {
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          background: white;
          padding: 0;
        }

        /* Unified Card Container */
        .unified-modal-card {
          background: white;
          display: flex;
          flex-direction: column;
          min-height: 500px;
          max-height: 85vh;
        }

        /* Dynamic Header */
        .unified-header {
          padding: var(--space-16);
          border-bottom: 1px solid var(--neutral-200);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .header-close-btn {
          color: var(--neutral-600) !important;
          width: 32px !important;
          height: 32px !important;
          border-radius: var(--radius-md) !important;
          background: var(--neutral-100) !important;
        }

        .header-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .modal-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--neutral-800);
          line-height: 1.2;
        }

        .modal-subtitle {
          font-size: 12px;
          color: var(--neutral-500);
          font-weight: 500;
        }

        /* Content Area */
        .unified-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-20);
        }

        .unified-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-24);
        }

        /* Form Sections */
        .form-section {
          background: var(--neutral-50);
          border-radius: var(--radius-lg);
          padding: var(--space-16);
          border: 1px solid var(--neutral-200);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: var(--space-12);
          margin-bottom: var(--space-16);
        }

        .section-icon {
          color: var(--primary-600);
          background: var(--primary-100);
          padding: 6px;
          border-radius: var(--radius-md);
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--neutral-800);
          display: block;
        }

        .section-desc {
          font-size: 12px;
          color: var(--neutral-500);
        }

        /* Input Groups */
        .input-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
        }

        .input-wrapper {
          background: white;
          border-radius: var(--radius-md);
          padding: var(--space-12);
          border: 2px solid transparent;
          transition: all 0.2s ease;
        }

        .input-wrapper:focus-within {
          border-color: var(--primary-600);
          box-shadow: 0 0 0 3px rgba(var(--primary-600), 0.1);
        }

        .input-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--neutral-700);
          display: block;
          margin-bottom: var(--space-8);
        }

        /* Inputs */
        .unified-input {
          font-size: 14px;
          color: var(--neutral-800);
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          font-weight: 500;
        }

        .unified-input::placeholder {
          color: var(--neutral-400);
        }

        /* Amount Input */
        .amount-input .amount-container {
          display: flex;
          align-items: center;
          gap: var(--space-8);
        }

        .currency {
          font-size: 16px;
          font-weight: 700;
          color: var(--primary-600);
        }

        .unified-amount.ant-input-number {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-size: 16px !important;
          font-weight: 700 !important;
          color: var(--neutral-800) !important;
          flex: 1;
        }

        .unified-amount .ant-input-number-input {
          font-size: 16px !important;
          font-weight: 700 !important;
          background: transparent;
          border: none;
          padding: 0;
        }

        /* Select */
        .unified-select.ant-select .ant-select-selector {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          font-size: 14px;
          font-weight: 500;
        }

        .category-option {
          display: flex;
          align-items: center;
          padding: var(--space-8);
        }

        /* Date Picker */
        .unified-date.ant-picker {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          font-size: 14px;
          font-weight: 500;
        }

        /* Options Grid */
        .options-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: var(--space-12);
          background: white;
          padding: var(--space-12);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .option-item:hover {
          background: var(--neutral-50);
        }

        .option-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .option-icon.paid {
          background: var(--success-500);
        }

        .option-icon.recurring {
          background: var(--primary-600);
        }

        .option-text {
          flex: 1;
        }

        .option-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--neutral-800);
          display: block;
        }

        .option-desc {
          font-size: 12px;
          color: var(--neutral-500);
        }

        .option-check.ant-checkbox-wrapper {
          font-size: 0;
        }

        .option-check .ant-checkbox-inner {
          border-radius: 4px;
          border-color: var(--neutral-300);
        }

        .option-check .ant-checkbox-checked .ant-checkbox-inner {
          background: var(--primary-600);
          border-color: var(--primary-600);
        }

        /* Footer Actions */
        .unified-footer {
          padding: var(--space-16);
          border-top: 1px solid var(--neutral-200);
          display: flex;
          gap: var(--space-12);
          background: var(--neutral-50);
        }

        .footer-cancel {
          flex: 1;
          height: 44px;
          border-radius: var(--radius-md);
          font-weight: 500;
          border-color: var(--neutral-300);
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
        }

        .footer-save:hover {
          background: var(--primary-700) !important;
          border-color: var(--primary-700) !important;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .unified-edit-bill-modal .ant-modal {
            padding: var(--space-12);
            margin: 0;
            max-width: 100%;
            width: 100%;
            height: 100%;
            top: 0 !important;
          }

          .unified-edit-bill-modal .ant-modal-content {
            border-radius: var(--radius-lg);
            height: 100vh;
            max-height: 100vh;
          }

          .unified-modal-card {
            min-height: 100vh;
            max-height: 100vh;
          }

          .unified-content {
            padding: var(--space-16);
          }

          .input-group {
            gap: var(--space-12);
          }

          .unified-form {
            gap: var(--space-16);
          }

          /* iOS Safe Area */
          .unified-footer {
            padding-bottom: calc(var(--space-16) + env(safe-area-inset-bottom, 0px));
          }
        }

        /* Form Validation */
        .ant-form-item-has-error .input-wrapper {
          border-color: var(--danger-500) !important;
          background: var(--danger-50) !important;
        }

        .ant-form-item-explain-error {
          font-size: 12px;
          color: var(--danger-500);
          margin-top: var(--space-4);
          padding-left: var(--space-4);
        }

        /* Loading State */
        .footer-save.ant-btn-loading {
          background: var(--neutral-400) !important;
          border-color: var(--neutral-400) !important;
        }

        /* Accessibility */
        .unified-input:focus,
        .unified-amount:focus-within,
        .unified-select:focus-within,
        .unified-date:focus-within {
          outline: 2px solid var(--primary-600);
          outline-offset: 2px;
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .input-wrapper,
          .option-item,
          .footer-save {
            transition: none !important;
          }
        }

        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
          .unified-modal-card,
          .form-section,
          .input-wrapper,
          .option-item {
            background: var(--neutral-800) !important;
            border-color: var(--neutral-600) !important;
          }

          .modal-title,
          .section-title,
          .input-label,
          .option-title,
          .unified-input {
            color: var(--neutral-100) !important;
          }

          .modal-subtitle,
          .section-desc,
          .option-desc {
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