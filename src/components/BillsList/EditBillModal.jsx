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

// Helper component for section headers
const FormSectionHeader = ({ icon, title, subtitle }) => (
  <div className="form-section-header">
    <div className="form-section-icon-wrapper">
      {React.createElement(icon, { size: 18 })}
    </div>
    <div className="form-section-text">
      <Text className="form-section-title">{title}</Text>
      {subtitle && <Text className="form-section-subtitle">{subtitle}</Text>}
    </div>
  </div>
);

const PremiumEditBillModal = ({ open, onCancel, onSubmit, initialData }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const getCategoryInfo = (categoryName) => {
    return billCategories.find(cat => cat.name === categoryName) || billCategories[billCategories.length - 1];
  };

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

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

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

          <div className="premium-modal-content">
            <Form
              form={form}
              layout="vertical"
              name="billForm"
              className="premium-bill-form"
            >
              {/* Bill Information Section */}
              <div className="form-section">
                <FormSectionHeader 
                  icon={IconFileText} 
                  title="Bill Information" 
                  subtitle="Essential details for your bill" 
                />
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

              {/* Category Selection Section */}
              <div className="form-section">
                <FormSectionHeader 
                  icon={IconTag} 
                  title="Category" 
                  subtitle="Organize and track your expenses" 
                />
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
                      const catInfo = getCategoryInfo(option.value);
                      return (
                        <div className="category-option">
                          <Avatar 
                            size={24} // Slightly smaller
                            style={{ 
                              backgroundColor: catInfo.bgColor,
                              color: catInfo.color,
                              marginRight: 10 // Slightly less margin
                            }}
                            icon={React.createElement(catInfo.icon, { size: 14 })} // Slightly smaller
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

              {/* Due Date Section */}
              <div className="form-section">
                <FormSectionHeader 
                  icon={IconCalendar} 
                  title="Due Date" 
                  subtitle="When this payment is due" 
                />
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
                    suffixIcon={<IconCalendar size={16} style={{ color: '#007AFF' }} />} // Slightly smaller
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>

              {/* Options Section */}
              <div className="form-section">
                <FormSectionHeader 
                  icon={IconCheck} 
                  title="Bill Options" 
                  subtitle="Payment status and recurrence" 
                />
                <Form.Item 
                  name="isPaid" 
                  valuePropName="checked"
                  className="premium-form-item compact-option" 
                >
                  <div className="premium-option-row">
                    <div className="option-icon-wrapper paid">
                      <IconCheck size={16} /> 
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
                  className="premium-form-item compact-option"
                >
                  <div className="premium-option-row">
                    <div className="option-icon-wrapper recurring">
                      <IconRepeat size={16} />
                    </div>
                    <div className="option-content">
                      <Text className="option-title">Recurring Bill</Text>
                      <Text className="option-description">Automatically repeats monthly</Text>
                    </div>
                    <Checkbox className="premium-checkbox" />
                  </div>
                </Form.Item>
              </div>
            </Form>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        /* Premium Modal Styling */
        .premium-edit-bill-modal .ant-modal {
          padding: 16px; /* Keep this for overall modal padding on desktop */
        }

        .premium-edit-bill-modal .ant-modal-content {
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 64px rgba(0, 0, 0, 0.24), 0 16px 32px rgba(0, 0, 0, 0.16);
          background: linear-gradient(145deg, #FFFFFF, #FAFBFC); // Main card background
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .premium-modal-container {
          background: linear-gradient(145deg, #F8F9FA, #FFFFFF); // Inner background, could be same as content
          min-height: 70vh; /* Slightly reduced */
          max-height: 85vh; /* Slightly reduced */
          display: flex;
          flex-direction: column;
        }

        /* Enhanced Header (Keep as is) */
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
          padding: 16px 20px 24px 20px; /* Consistent padding */
        }

        .premium-bill-form {
          width: 100%;
        }

        /* NEW: Form Section Styling */
        .form-section {
          margin-bottom: 24px; /* Space between sections */
        }
        .form-section:last-child {
          margin-bottom: 0;
        }

        .form-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px; /* Reduced space before first item */
        }

        .form-section-icon-wrapper {
          width: 36px;
          height: 36px;
          background: rgba(0, 122, 255, 0.08); /* Softer background */
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #007AFF; /* Icon color */
        }

        .form-section-text {
          flex: 1;
        }

        .form-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #1D1D1F;
          letter-spacing: -0.3px;
          display: block;
          margin-bottom: 1px;
        }

        .form-section-subtitle {
          font-size: 13px;
          color: #86868B;
          letter-spacing: -0.1px;
        }
        
        /* REMOVED: .premium-form-card and its specific styles (background, border, shadow, etc.) */
        /* REMOVED: .card-header, .card-header-icon, .card-header-text, .card-title, .card-subtitle (replaced by form-section-header) */
        /* REMOVED: .card-content (form items are now direct children of .form-section or .premium-modal-content) */
        /* REMOVED: .options-content (padding handled by .premium-option-row itself or parent) */


        /* Enhanced Input Styling (adjustments for compactness) */
        .premium-form-item {
          margin-bottom: 12px !important; /* Reduced */
        }
        .premium-form-item.compact-option { /* Specific for checkbox rows if needed */
           margin-bottom: 8px !important;
        }

        .premium-form-item:last-child {
          margin-bottom: 0 !important;
        }

        .premium-input-wrapper {
          background: #F8F9FA;
          border-radius: 12px; /* Slightly smaller radius */
          padding: 12px 16px; /* Reduced padding */
          border: 1px solid transparent; /* Thinner border for focused state */
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-input-wrapper:focus-within {
          background: #FFFFFF;
          border-color: #007AFF;
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1); /* Adjusted shadow */
          transform: translateY(0); /* Removed transform for less jumpiness */
        }

        .input-label {
          font-size: 13px; /* Slightly smaller */
          font-weight: 500; /* Adjusted weight */
          color: #3C3C43; /* Darker gray for better readability */
          letter-spacing: -0.1px;
          display: block;
          margin-bottom: 6px; /* Reduced */
        }

        .premium-input {
          font-size: 16px; /* Slightly smaller */
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
          gap: 6px; /* Reduced gap */
        }

        .currency-symbol {
          font-size: 18px; /* Slightly smaller */
          font-weight: 600; /* Adjusted weight */
          color: #007AFF;
          letter-spacing: -0.3px;
        }

        .premium-amount-input.ant-input-number {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-size: 20px !important; /* Reduced */
          font-weight: 600 !important; /* Adjusted */
          color: #1D1D1F !important;
          flex: 1;
        }

        .premium-amount-input .ant-input-number-input {
          font-size: 20px !important; /* Reduced */
          font-weight: 600 !important; /* Adjusted */
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
          border: 1px solid transparent !important; /* Thinner border */
          border-radius: 12px !important; /* Smaller radius */
          padding: 0 16px !important; /* Adjusted padding for height */
          min-height: 50px !important; /* Reduced height */
          height: 50px !important; /* Fixed height */
          display: flex;
          align-items: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .premium-category-select.ant-select-focused .ant-select-selector,
        .premium-category-select:hover .ant-select-selector {
          background: #FFFFFF !important;
          border-color: #007AFF !important;
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1) !important;
          transform: translateY(0);
        }

        .premium-category-select .ant-select-selection-item {
          font-size: 16px; /* Slightly smaller */
          font-weight: 500;
          color: #1D1D1F;
          padding: 0;
          line-height: normal; /* Adjust line height */
        }

        .premium-category-select .ant-select-selection-placeholder {
          color: #86868B;
          font-size: 16px; /* Slightly smaller */
          font-weight: 400;
          line-height: normal; /* Adjust line height */
        }

        /* Category Dropdown */
        .category-dropdown {
          background: #FFFFFF;
          border-radius: 16px; /* Slightly smaller */
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.06); /* Adjusted shadow */
          border: 1px solid rgba(0,0,0,0.05);
          padding: 6px 0; /* Adjusted padding */
          backdrop-filter: blur(20px);
        }

        .category-option {
          display: flex;
          align-items: center;
          padding: 10px 16px; /* Adjusted padding */
          transition: all 0.2s ease;
        }

        .category-option:hover {
          background: #F0F0F0; /* Lighter hover */
        }

        .category-name {
          font-size: 15px; /* Slightly smaller */
          font-weight: 500;
          color: #1D1D1F;
        }

        /* Date Picker */
        .premium-date-picker.ant-picker {
          background: #F8F9FA !important;
          border: 1px solid transparent !important; /* Thinner border */
          border-radius: 12px !important; /* Smaller radius */
          padding: 0 16px !important; /* Adjusted for height */
          min-height: 50px !important; /* Reduced height */
          height: 50px !important; /* Fixed height */
          width: 100%;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-date-picker.ant-picker-focused,
        .premium-date-picker:hover {
          background: #FFFFFF !important;
          border-color: #007AFF !important;
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1) !important;
          transform: translateY(0);
        }

        .premium-date-picker .ant-picker-input input {
          font-size: 16px; /* Slightly smaller */
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
          padding: 12px 16px; /* Reduced padding */
          gap: 12px; /* Reduced gap */
          border-radius: 12px; /* Smaller radius */
          /* margin: 0 20px 12px 20px; REMOVED - parent .premium-modal-content handles side padding */
          margin-bottom: 0px; /* Form item handles bottom margin */
          background: #F8F9FA;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .premium-option-row:hover {
          background: #F0F0F0; /* Lighter hover */
          transform: translateY(0);
        }

        .option-icon-wrapper {
          width: 32px; /* Smaller */
          height: 32px; /* Smaller */
          border-radius: 8px; /* Smaller */
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
          font-size: 15px; /* Slightly smaller */
          font-weight: 600;
          color: #1D1D1F;
          letter-spacing: -0.2px;
          display: block;
          margin-bottom: 1px; /* Tighter */
        }

        .option-description {
          font-size: 13px; /* Slightly smaller */
          color: #86868B;
          letter-spacing: -0.1px;
        }

        /* Enhanced Checkboxes */
        .premium-checkbox.ant-checkbox-wrapper {
          font-size: 0; /* Keep this to hide text if any */
        }

        .premium-checkbox .ant-checkbox {
          transform: scale(1.2); /* Slightly smaller scale if needed, or 1.1 */
        }

        .premium-checkbox .ant-checkbox-inner {
          border-radius: 7px; /* Adjusted */
          border-color: #D1D1D6;
          background: #FFFFFF;
          border-width: 1.5px; /* Slightly thinner */
        }

        .premium-checkbox .ant-checkbox-checked .ant-checkbox-inner {
          background: linear-gradient(135deg, #007AFF, #0056CC);
          border-color: #007AFF;
        }

        .premium-checkbox .ant-checkbox-checked .ant-checkbox-inner::after {
          border-color: #FFFFFF;
          border-width: 1.5px; /* Adjusted */
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
            padding: 0 16px 24px 16px; /* Adjusted mobile padding */
          }

          .premium-modal-header {
            padding: 16px;
          }
          
          /* No longer need .card-header, .card-content specific padding adjustments here */
          /* .premium-option-row margin already adjusted */
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
          transform: scale(1.1); /* Adjusted */
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

        /* Date Picker Dropdown (minor adjustments if needed) */
        .ant-picker-dropdown {
          border-radius: 16px !important; /* Adjusted */
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.06) !important; /* Adjusted */
          border: 1px solid rgba(0,0,0,0.05) !important;
          backdrop-filter: blur(20px);
          overflow: hidden;
        }

        .ant-picker-panel {
          border-radius: 16px; /* Adjusted */
          background: linear-gradient(145deg, #FFFFFF, #FDFDFD);
        }

        .ant-picker-header {
          background: linear-gradient(135deg, rgba(0, 122, 255, 0.02), rgba(0, 122, 255, 0.01));
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding: 12px 16px; /* Adjusted */
        }

        .ant-picker-header-view {
          font-weight: 600;
          color: #1D1D1F;
        }

        .ant-picker-content {
          padding: 6px 12px 12px 12px; /* Adjusted */
        }

        .ant-picker-content th {
          font-size: 12px; /* Adjusted */
          font-weight: 500; /* Adjusted */
          color: #86868B;
          padding: 6px 0; /* Adjusted */
        }

        .ant-picker-content td {
          padding: 1px; /* Adjusted */
        }

        .ant-picker-cell {
          border-radius: 8px; /* Adjusted */
        }

        .ant-picker-cell-inner {
          width: 30px; /* Adjusted */
          height: 30px; /* Adjusted */
          border-radius: 8px; /* Adjusted */
          font-size: 14px; /* Adjusted */
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
          box-shadow: 0 3px 8px rgba(0, 122, 255, 0.35); /* Adjusted */
        }

        .ant-picker-cell:hover .ant-picker-cell-inner {
          background: rgba(0, 122, 255, 0.05);
        }

        /* Enhanced Select Dropdown Items */
        .ant-select-item {
          border-radius: 10px !important; /* Adjusted */
          margin: 2px 6px !important; /* Adjusted */
          padding: 0 !important;
          border: none !important;
        }

        .ant-select-item-option {
          padding: 10px 14px !important; /* Adjusted */
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
          font-size: 12px; /* Adjusted */
          color: #FF3B30;
          font-weight: 500;
          margin-top: 6px; /* Adjusted */
          padding-left: 4px;
        }
        
        /* REMOVED: Glassmorphism ::before on premium-modal-header (it's already fine) */
        /* REMOVED: Micro-interactions for .premium-form-card (card itself is gone) */
        /* REMOVED: .premium-form-card:hover .card-header-icon (icon wrapper is now .form-section-icon-wrapper) */
        
        .form-section-icon-wrapper { /* Add transition if desired */
          transition: all 0.2s ease;
        }
        .form-section:hover .form-section-icon-wrapper { /* Example hover on new icon wrapper */
           transform: scale(1.05);
        }


        /* Success States */
        .premium-save-button.success {
          background: linear-gradient(135deg, #34C759, #28A745) !important;
          box-shadow: 0 4px 12px rgba(52, 199, 89, 0.4) !important;
        }

        /* Dark Mode Support (adjustments for new structure) */
        @media (prefers-color-scheme: dark) {
          .premium-modal-container,
          .premium-edit-bill-modal .ant-modal-content { /* Apply to both */
            background: linear-gradient(145deg, #1C1C1E, #2C2C2E);
          }
          
          /* No .premium-form-card to style here */

          .form-section-title, /* New section titles */
          .premium-modal-title,
          .input-label,
          .option-title,
          .premium-input,
          .category-name {
            color: #FFFFFF !important;
          }

          .form-section-subtitle, /* New section subtitles */
          .premium-modal-subtitle,
          .option-description {
            color: #98989D !important;
          }

          .premium-input-wrapper,
          .premium-category-select .ant-select-selector,
          .premium-date-picker,
          .premium-option-row {
            background: #2C2C2E !important; /* Darker input background */
            border-color: #3A3A3C !important; /* Subtle border for dark inputs */
          }
          
          .premium-input-wrapper:focus-within,
          .premium-category-select.ant-select-focused .ant-select-selector,
          .premium-date-picker.ant-picker-focused {
            background: #3A3A3C !important; /* Slightly lighter on focus */
            border-color: #0A84FF !important; /* Dark mode blue */
          }

          .form-section-icon-wrapper {
            background: rgba(10, 132, 255, 0.15); /* Dark mode accent for icon */
            color: #0A84FF;
          }

          .category-dropdown {
            background: #2C2C2E;
            border-color: rgba(84, 84, 88, 0.6);
          }
           .category-option:hover {
             background: #3A3A3C;
           }

          .ant-picker-panel {
            background: linear-gradient(145deg, #1C1C1E, #2C2C2E);
          }
           .ant-picker-header {
             background: linear-gradient(135deg, rgba(10, 132, 255, 0.05), rgba(10, 132, 255, 0.02));
             border-bottom: 1px solid #3A3A3C;
           }
           .ant-picker-header-view,
           .ant-picker-content th {
             color: #98989D;
           }
           .ant-picker-cell-today .ant-picker-cell-inner {
             background: rgba(10, 132, 255, 0.15);
             color: #0A84FF;
           }
           .ant-picker-cell-selected .ant-picker-cell-inner {
             background: linear-gradient(135deg, #0A84FF, #0059B2) !important;
           }
           .ant-picker-cell:hover .ant-picker-cell-inner {
             background: rgba(10, 132, 255, 0.1);
           }
        }

        /* Performance Optimizations */
        .premium-edit-bill-modal * {
           /* Use will-change more sparingly, e.g., only on actively animated elements like dropdowns or buttons on hover/active */
           /* will-change: transform; */
        }
        .premium-save-button, .premium-cancel-button, .premium-option-row, .form-section-icon-wrapper {
            will-change: transform, background, box-shadow;
        }


        .premium-modal-content {
          contain: layout style paint;
        }

        /* Accessibility Enhancements */
        .premium-input:focus,
        .premium-amount-input input:focus, /* Target the actual input */
        .premium-category-select .ant-select-selector:focus-within, /* For select */
        .premium-date-picker .ant-picker-input input:focus { /* For date picker */
          outline: 2px solid #007AFF;
          outline-offset: 2px;
        }
        @media (prefers-color-scheme: dark) {
            .premium-input:focus,
            .premium-amount-input input:focus,
            .premium-category-select .ant-select-selector:focus-within,
            .premium-date-picker .ant-picker-input input:focus {
                outline-color: #0A84FF; /* Dark mode focus outline */
            }
        }


        @media (prefers-reduced-motion: reduce) {
          .premium-save-button, 
          .premium-cancel-button, 
          .premium-option-row, 
          .form-section-icon-wrapper,
          .premium-input-wrapper,
          .premium-category-select .ant-select-selector,
          .premium-date-picker.ant-picker {
            transition: none !important;
          }
          
          .form-section:hover .form-section-icon-wrapper,
          .premium-save-button:hover,
          .premium-input-wrapper:focus-within {
            transform: none !important;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
           /* Adjustments for high contrast - this is a basic example */
          .premium-modal-content, .premium-modal-container {
            background: Window !important;
            color: WindowText !important;
          }
          .premium-input-wrapper,
          .premium-category-select .ant-select-selector,
          .premium-date-picker.ant-picker,
          .premium-option-row {
            background: Window !important;
            border: 1px solid WindowText !important;
            color: WindowText !important;
          }
           .premium-input, .input-label, .form-section-title, .form-section-subtitle, .option-title, .option-description, .category-name {
             color: WindowText !important;
           }

          .premium-save-button {
            background: Highlight !important;
            color: HighlightText !important;
            border: 1px solid WindowText !important;
          }
          .premium-cancel-button {
            background: ButtonFace !important;
            color: ButtonText !important;
            border: 1px solid ButtonText !important;
          }
          
          .form-section-icon-wrapper {
            background: transparent !important;
            border: 1px solid WindowText !important;
            color: WindowText !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PremiumEditBillModal;