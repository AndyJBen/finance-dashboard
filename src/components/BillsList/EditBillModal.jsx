// Premium Apple-Inspired Edit Bill Modal
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

const PremiumEditBillModal = ({ open, onCancel, onSubmit, initialData }) => {
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
    <div>
      <Modal
        open={open}
        onCancel={onCancel}
        footer={null}
        centered
        width="100%"
        style={{ 
          maxWidth: '420px',
          margin: '0 auto',
          padding: 0
        }}
        bodyStyle={{ padding: 0 }}
        maskStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(40px)'
        }}
        className="premium-edit-bill-modal"
      >
        <div className="premium-modal-container">
          {/* Dynamic Header with Category Context */}
          <div className="premium-modal-header" style={{
            background: selectedCategory 
              ? `linear-gradient(135deg, ${categoryInfo.color}15, ${categoryInfo.color}08)`
              : 'linear-gradient(135deg, #007AFF15, #007AFF08)'
          }}>
            <div className="header-backdrop">
              <Button 
                type="text" 
                className="premium-cancel-button"
                onClick={onCancel}
                icon={<IconX size={20} />}
              />
              
              <div className="header-title-section">
                {selectedCategory && (
                  <Avatar 
                    size={32}
                    className="category-avatar"
                    style={{ 
                      backgroundColor: categoryInfo.bgColor,
                      color: categoryInfo.color,
                      marginBottom: 4
                    }}
                    icon={React.createElement(categoryInfo.icon, { size: 18 })}
                  />
                )}
                <Text className="premium-modal-title">{modalTitle}</Text>
                {selectedCategory && (
                  <Text className="premium-modal-subtitle">{selectedCategory} Bill</Text>
                )}
              </div>
              
              <Button 
                type="primary"
                className="premium-save-button"
                onClick={handleSubmit}
                loading={isSubmitting}
                icon={<IconCheck size={18} />}
              >
                {isSubmitting ? 'Saving' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Form Content with Enhanced Cards */}
          <div className="premium-modal-content">
            <Form
              form={form}
              layout="vertical"
              name="billForm"
              className="premium-bill-form"
            >
              {/* Primary Information Card */}
              <div className="premium-form-card">
                <div className="card-header">
                  <div className="card-header-icon">
                    <IconFileText size={20} />
                  </div>
                  <div className="card-header-text">
                    <Text className="card-title">Bill Information</Text>
                    <Text className="card-subtitle">Essential details for your bill</Text>
                  </div>
                </div>
                
                <div className="card-content">
                  <Form.Item 
                    name="name" 
                    rules={[{ required: true, message: 'Bill name is required' }]}
                    className="premium-form-item"
                  >
                    <div className="premium-input-wrapper">
                      <Text className="input-label">Bill Name</Text>
                      <Input 
                        placeholder="Enter descriptive name"
                        className="premium-input"
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
                    className="premium-form-item"
                  >
                    <div className="premium-input-wrapper amount-wrapper">
                      <Text className="input-label">Amount</Text>
                      <div className="amount-input-container">
                        <Text className="currency-symbol">$</Text>
                        <InputNumber
                          placeholder="0.00"
                          className="premium-amount-input"
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

              {/* Category Selection Card */}
              <div className="premium-form-card">
                <div className="card-header">
                  <div className="card-header-icon">
                    <IconTag size={20} />
                  </div>
                  <div className="card-header-text">
                    <Text className="card-title">Category</Text>
                    <Text className="card-subtitle">Organize and track your expenses</Text>
                  </div>
                </div>
                
                <div className="card-content">
                  <Form.Item 
                    name="category" 
                    rules={[{ required: true, message: 'Category is required' }]}
                    className="premium-form-item"
                  >
                    <Select
                      placeholder="Choose a category"
                      className="premium-category-select"
                      variant="borderless"
                      onChange={setSelectedCategory}
                      dropdownRender={(menu) => (
                        <div className="category-dropdown">
                          {menu}
                        </div>
                      )}
                      optionRender={(option) => {
                        const categoryInfo = getCategoryInfo(option.value);
                        return (
                          <div className="category-option">
                            <Avatar 
                              size={28}
                              style={{ 
                                backgroundColor: categoryInfo.bgColor,
                                color: categoryInfo.color,
                                marginRight: 12
                              }}
                              icon={React.createElement(categoryInfo.icon, { size: 16 })}
                            />
                            <Text className="category-name">{option.value}</Text>
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
                  </Form.Item>
                </div>
              </div>

              {/* Due Date Card */}
              <div className="premium-form-card">
                <div className="card-header">
                  <div className="card-header-icon">
                    <IconCalendar size={20} />
                  </div>
                  <div className="card-header-text">
                    <Text className="card-title">Due Date</Text>
                    <Text className="card-subtitle">When this payment is due</Text>
                  </div>
                </div>
                
                <div className="card-content">
                  <Form.Item 
                    name="dueDate" 
                    rules={[{ required: true, message: 'Due date is required' }]}
                    className="premium-form-item"
                  >
                    <DatePicker
                      format="MMMM DD, YYYY"
                      placeholder="Select due date"
                      className="premium-date-picker"
                      variant="borderless"
                      suffixIcon={<IconCalendar size={18} style={{ color: '#007AFF' }} />}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Options Card */}
              <div className="premium-form-card">
                <div className="card-header">
                  <div className="card-header-icon">
                    <IconCheck size={20} />
                  </div>
                  <div className="card-header-text">
                    <Text className="card-title">Bill Options</Text>
                    <Text className="card-subtitle">Payment status and recurrence</Text>
                  </div>
                </div>
                
                <div className="card-content options-content">
                  <Form.Item 
                    name="isPaid" 
                    valuePropName="checked"
                    className="premium-form-item"
                  >
                    <div className="premium-option-row">
                      <div className="option-icon-wrapper paid">
                        <IconCheck size={18} />
                      </div>
                      <div className="option-content">
                        <Text className="option-title">Mark as Paid</Text>
                        <Text className="option-description">This bill has been paid</Text>
                      </div>
                      <Checkbox className="premium-checkbox" />
                    </div>
                  </Form.Item>

                  <Form.Item 
                    name="isRecurring" 
                    valuePropName="checked"
                    className="premium-form-item"
                  >
                    <div className="premium-option-row">
                      <div className="option-icon-wrapper recurring">
                        <IconRepeat size={18} />
                      </div>
                      <div className="option-content">
                        <Text className="option-title">Recurring Bill</Text>
                        <Text className="option-description">Automatically repeats monthly</Text>
                      </div>
                      <Checkbox className="premium-checkbox" />
                    </div>
                  </Form.Item>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        /* Premium Modal Styling */
        .premium-edit-bill-modal .ant-modal {
          padding: 16px;
        }

        .premium-edit-bill-modal .ant-modal-content {
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 64px rgba(0, 0, 0, 0.24), 0 16px 32px rgba(0, 0, 0, 0.16);
          background: linear-gradient(145deg, #FFFFFF, #FAFBFC);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .premium-modal-container {
          background: linear-gradient(145deg, #F8F9FA, #FFFFFF);
          min-height: 75vh;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        /* Enhanced Header */
        .premium-modal-header {
          padding: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          backdrop-filter: blur(20px);
        }

        .header-backdrop {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-title-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .premium-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #1D1D1F;
          letter-spacing: -0.6px;
          line-height: 1.2;
        }

        .premium-modal-subtitle {
          font-size: 14px;
          font-weight: 500;
          color: #86868B;
          letter-spacing: -0.2px;
        }

        .category-avatar {
          border: 2px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .premium-cancel-button {
          color: #007AFF !important;
          font-size: 16px;
          font-weight: 500;
          padding: 8px !important;
          height: 40px !important;
          width: 40px !important;
          border-radius: 12px !important;
          background: rgba(0, 122, 255, 0.1) !important;
          border: none !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .premium-save-button {
          background: linear-gradient(135deg, #007AFF, #0056CC) !important;
          border: none !important;
          border-radius: 12px !important;
          height: 40px !important;
          padding: 0 16px !important;
          font-weight: 600 !important;
          font-size: 15px !important;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4) !important;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .premium-save-button:hover {
          background: linear-gradient(135deg, #0056CC, #003D99) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0, 122, 255, 0.5) !important;
        }

        /* Content Area */
        .premium-modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 0 20px 24px 20px;
        }

        .premium-bill-form {
          width: 100%;
        }

        /* Enhanced Form Cards */
        .premium-form-card {
          background: linear-gradient(145deg, #FFFFFF, #FDFDFD);
          border-radius: 20px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.8);
          overflow: hidden;
        }

        .card-header {
          display: flex;
          align-items: center;
          padding: 20px 20px 16px 20px;
          gap: 12px;
          background: linear-gradient(135deg, rgba(0, 122, 255, 0.02), rgba(0, 122, 255, 0.01));
        }

        .card-header-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #007AFF, #0056CC);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
        }

        .card-header-text {
          flex: 1;
        }

        .card-title {
          font-size: 17px;
          font-weight: 600;
          color: #1D1D1F;
          letter-spacing: -0.4px;
          display: block;
          margin-bottom: 2px;
        }

        .card-subtitle {
          font-size: 14px;
          color: #86868B;
          letter-spacing: -0.2px;
        }

        .card-content {
          padding: 0 20px 20px 20px;
        }

        .options-content {
          padding: 0 0 20px 0;
        }

        /* Enhanced Input Styling */
        .premium-form-item {
          margin-bottom: 16px !important;
        }

        .premium-form-item:last-child {
          margin-bottom: 0 !important;
        }

        .premium-input-wrapper {
          background: #F8F9FA;
          border-radius: 16px;
          padding: 16px 20px;
          border: 2px solid transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-input-wrapper:focus-within {
          background: #FFFFFF;
          border-color: #007AFF;
          box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
          transform: translateY(-1px);
        }

        .input-label {
          font-size: 14px;
          font-weight: 600;
          color: #1D1D1F;
          letter-spacing: -0.2px;
          display: block;
          margin-bottom: 8px;
        }

        .premium-input {
          font-size: 17px;
          color: #1D1D1F;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          font-weight: 500;
        }

        .premium-input::placeholder {
          color: #86868B;
          font-weight: 400;
        }

        /* Amount Input Styling */
        .amount-wrapper {
          position: relative;
        }

        .amount-input-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .currency-symbol {
          font-size: 20px;
          font-weight: 700;
          color: #007AFF;
          letter-spacing: -0.4px;
        }

        .premium-amount-input.ant-input-number {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-size: 24px !important;
          font-weight: 700 !important;
          color: #1D1D1F !important;
          flex: 1;
        }

        .premium-amount-input .ant-input-number-input {
          font-size: 24px !important;
          font-weight: 700 !important;
          color: #1D1D1F !important;
          background: transparent;
          border: none;
          box-shadow: none;
          padding: 0;
        }

        /* Category Select Styling */
        .premium-category-select.ant-select {
          width: 100%;
        }

        .premium-category-select .ant-select-selector {
          background: #F8F9FA !important;
          border: 2px solid transparent !important;
          border-radius: 16px !important;
          padding: 16px 20px !important;
          min-height: 64px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-category-select.ant-select-focused .ant-select-selector,
        .premium-category-select:hover .ant-select-selector {
          background: #FFFFFF !important;
          border-color: #007AFF !important;
          box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1) !important;
          transform: translateY(-1px);
        }

        .premium-category-select .ant-select-selection-item {
          font-size: 17px;
          font-weight: 500;
          color: #1D1D1F;
          padding: 0;
          line-height: 1;
        }

        .premium-category-select .ant-select-selection-placeholder {
          color: #86868B;
          font-size: 17px;
          font-weight: 400;
          line-height: 1;
        }

        /* Category Dropdown */
        .category-dropdown {
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.16), 0 8px 24px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.8);
          padding: 8px 0;
          backdrop-filter: blur(20px);
        }

        .category-option {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          transition: all 0.2s ease;
        }

        .category-option:hover {
          background: #F8F9FA;
        }

        .category-name {
          font-size: 16px;
          font-weight: 500;
          color: #1D1D1F;
        }

        /* Date Picker */
        .premium-date-picker.ant-picker {
          background: #F8F9FA !important;
          border: 2px solid transparent !important;
          border-radius: 16px !important;
          padding: 16px 20px !important;
          min-height: 64px !important;
          width: 100%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-date-picker.ant-picker-focused,
        .premium-date-picker:hover {
          background: #FFFFFF !important;
          border-color: #007AFF !important;
          box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1) !important;
          transform: translateY(-1px);
        }

        .premium-date-picker .ant-picker-input input {
          font-size: 17px;
          font-weight: 500;
          color: #1D1D1F;
        }

        .premium-date-picker .ant-picker-input input::placeholder {
          color: #86868B;
          font-weight: 400;
        }

        /* Option Rows */
        .premium-option-row {
          display: flex;
          align-items: center;
          padding: 20px;
          gap: 16px;
          border-radius: 16px;
          margin: 0 20px 12px 20px;
          background: #F8F9FA;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .premium-option-row:hover {
          background: #F0F0F0;
          transform: translateY(-1px);
        }

        .premium-option-row:last-child {
          margin-bottom: 0;
        }

        .option-icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .option-icon-wrapper.paid {
          background: linear-gradient(135deg, #34C759, #28A745);
        }

        .option-icon-wrapper.recurring {
          background: linear-gradient(135deg, #AF52DE, #8E44AD);
        }

        .option-content {
          flex: 1;
        }

        .option-title {
          font-size: 16px;
          font-weight: 600;
          color: #1D1D1F;
          letter-spacing: -0.3px;
          display: block;
          margin-bottom: 2px;
        }

        .option-description {
          font-size: 14px;
          color: #86868B;
          letter-spacing: -0.2px;
        }

        /* Enhanced Checkboxes */
        .premium-checkbox.ant-checkbox-wrapper {
          font-size: 0;
        }

        .premium-checkbox .ant-checkbox {
          transform: scale(1.3);
        }

        .premium-checkbox .ant-checkbox-inner {
          border-radius: 8px;
          border-color: #D1D1D6;
          background: #FFFFFF;
          border-width: 2px;
        }

        .premium-checkbox .ant-checkbox-checked .ant-checkbox-inner {
          background: linear-gradient(135deg, #007AFF, #0056CC);
          border-color: #007AFF;
        }

        .premium-checkbox .ant-checkbox-checked .ant-checkbox-inner::after {
          border-color: #FFFFFF;
          border-width: 2px;
        }

        /* Mobile Responsiveness */
        @media (max-width: 430px) {
          .premium-edit-bill-modal .ant-modal {
            padding: 0;
            margin: 0;
            max-width: 100%;
            width: 100%;
            height: 100%;
          }

          .premium-edit-bill-modal .ant-modal-content {
            border-radius: 0;
            height: 100vh;
            max-height: 100vh;
          }

          .premium-modal-container {
            min-height: 100vh;
            max-height: 100vh;
          }

          .premium-modal-content {
            padding: 0 16px 24px 16px;
          }

          .premium-modal-header {
            padding: 16px;
          }

          .card-header,
          .card-content {
            padding-left: 16px;
            padding-right: 16px;
          }

          .premium-option-row {
            margin-left: 16px;
            margin-right: 16px;
          }
        }

        /* Interactive States */
        .premium-cancel-button:active,
        .premium-save-button:active {
          transform: scale(0.95);
        }

        .premium-option-row:active {
          transform: scale(0.98);
        }

        .premium-checkbox:active {
          transform: scale(1.2);
        }

        /* Loading State */
        .premium-save-button.ant-btn-loading {
          background: linear-gradient(135deg, #86868B, #6D6D70) !important;
          box-shadow: 0 4px 12px rgba(134, 134, 139, 0.4) !important;
        }

        /* Dropdown Animations */
        .ant-select-dropdown {
          animation: dropdownSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Date Picker Dropdown */
        .ant-picker-dropdown {
          border-radius: 20px !important;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.16), 0 8px 24px rgba(0, 0, 0, 0.08) !important;
          border: 1px solid rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(20px);
          overflow: hidden;
        }

        .ant-picker-panel {
          border-radius: 20px;
          background: linear-gradient(145deg, #FFFFFF, #FDFDFD);
        }

        .ant-picker-header {
          background: linear-gradient(135deg, rgba(0, 122, 255, 0.02), rgba(0, 122, 255, 0.01));
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding: 16px;
        }

        .ant-picker-header-view {
          font-weight: 600;
          color: #1D1D1F;
        }

        .ant-picker-content {
          padding: 8px 16px 16px 16px;
        }

        .ant-picker-content th {
          font-size: 13px;
          font-weight: 600;
          color: #86868B;
          padding: 8px 0;
        }

        .ant-picker-content td {
          padding: 2px;
        }

        .ant-picker-cell {
          border-radius: 10px;
        }

        .ant-picker-cell-inner {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ant-picker-cell-today .ant-picker-cell-inner {
          background: rgba(0, 122, 255, 0.1);
          color: #007AFF;
          font-weight: 600;
        }

        .ant-picker-cell-selected .ant-picker-cell-inner {
          background: linear-gradient(135deg, #007AFF, #0056CC) !important;
          color: #FFFFFF !important;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
        }

        .ant-picker-cell:hover .ant-picker-cell-inner {
          background: rgba(0, 122, 255, 0.05);
        }

        /* Enhanced Select Dropdown Items */
        .ant-select-item {
          border-radius: 12px !important;
          margin: 2px 8px !important;
          padding: 0 !important;
          border: none !important;
        }

        .ant-select-item-option {
          padding: 12px 16px !important;
        }

        .ant-select-item-option-selected {
          background: linear-gradient(135deg, rgba(0, 122, 255, 0.1), rgba(0, 122, 255, 0.05)) !important;
          color: #007AFF !important;
          font-weight: 600 !important;
        }

        .ant-select-item-option-active {
          background: rgba(0, 122, 255, 0.05) !important;
        }

        /* Form Validation Styling */
        .ant-form-item-has-error .premium-input-wrapper {
          border-color: #FF3B30 !important;
          background: rgba(255, 59, 48, 0.05) !important;
        }

        .ant-form-item-has-error .premium-category-select .ant-select-selector {
          border-color: #FF3B30 !important;
          background: rgba(255, 59, 48, 0.05) !important;
        }

        .ant-form-item-has-error .premium-date-picker {
          border-color: #FF3B30 !important;
          background: rgba(255, 59, 48, 0.05) !important;
        }

        .ant-form-item-explain-error {
          font-size: 13px;
          color: #FF3B30;
          font-weight: 500;
          margin-top: 8px;
          padding-left: 4px;
        }

        /* Glassmorphism Effects */
        .premium-modal-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          backdrop-filter: blur(20px);
          z-index: -1;
        }

        /* Micro-interactions */
        .premium-form-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-form-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .card-header-icon {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-form-card:hover .card-header-icon {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
        }

        /* Success States */
        .premium-save-button.success {
          background: linear-gradient(135deg, #34C759, #28A745) !important;
          box-shadow: 0 4px 12px rgba(52, 199, 89, 0.4) !important;
        }

        /* Dark Mode Support (if needed) */
        @media (prefers-color-scheme: dark) {
          .premium-modal-container {
            background: linear-gradient(145deg, #1C1C1E, #2C2C2E);
          }

          .premium-form-card {
            background: linear-gradient(145deg, #2C2C2E, #3A3A3C);
            border-color: rgba(84, 84, 88, 0.6);
          }

          .card-title,
          .premium-modal-title,
          .input-label,
          .option-title,
          .premium-input,
          .category-name {
            color: #FFFFFF !important;
          }

          .card-subtitle,
          .premium-modal-subtitle,
          .option-description {
            color: #98989D !important;
          }

          .premium-input-wrapper,
          .premium-category-select .ant-select-selector,
          .premium-date-picker,
          .premium-option-row {
            background: #1C1C1E !important;
          }

          .premium-input-wrapper:focus-within,
          .premium-category-select.ant-select-focused .ant-select-selector,
          .premium-date-picker.ant-picker-focused {
            background: #2C2C2E !important;
          }
        }

        /* Performance Optimizations */
        .premium-edit-bill-modal * {
          will-change: transform;
        }

        .premium-modal-content {
          contain: layout style paint;
        }

        /* Accessibility Enhancements */
        .premium-input:focus,
        .premium-amount-input:focus-within,
        .premium-category-select:focus-within,
        .premium-date-picker:focus-within {
          outline: 2px solid #007AFF;
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .premium-form-card,
          .premium-input-wrapper,
          .premium-save-button,
          .card-header-icon {
            transition: none !important;
          }
          
          .premium-form-card:hover {
            transform: none !important;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .premium-form-card {
            border: 2px solid #000000;
          }
          
          .premium-save-button {
            background: #000000 !important;
            color: #FFFFFF !important;
          }
          
          .card-header-icon {
            background: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PremiumEditBillModal;