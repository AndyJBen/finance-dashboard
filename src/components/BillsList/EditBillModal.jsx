import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Checkbox, Typography, Button, Avatar } from 'antd';
import {
    IconTag,
    IconCalendar,
    IconCheck,
    IconX,
    IconRepeat,
    IconCreditCard,
    IconHome,
    IconBolt,
    IconShoppingCart,
    IconDeviceLaptop,
    IconFileText,
    IconHelp,
    IconStethoscope,
    IconCar
} from '@tabler/icons-react';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

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

const FormSectionHeader = ({ icon, title, subtitle }) => (
  <div className="form-section-header">
    <div className="form-section-icon-wrapper">
      {React.createElement(icon, { size: 16 })}
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
        closable={false}
        width="100%"
        style={{ 
          maxWidth: '380px',
          margin: '0 auto',
          padding: 0
        }}
        bodyStyle={{ padding: 0 }}
        maskStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)'
        }}
        className="premium-edit-bill-modal"
      >
        <div className="premium-modal-container">
          <div className="premium-modal-header" style={{
            background: selectedCategory 
              ? `linear-gradient(135deg, ${categoryInfo.color}10, ${categoryInfo.color}05)`
              : 'linear-gradient(135deg, #007AFF10, #007AFF05)'
          }}>
            <div className="header-backdrop">
              {/* Cancel button is now in the footer */}
              <div className="header-title-section">
                {selectedCategory && (
                  <Avatar 
                    size={24}
                    className="category-avatar"
                    style={{ 
                      backgroundColor: categoryInfo.bgColor,
                      color: categoryInfo.color,
                      marginBottom: 2
                    }}
                    icon={React.createElement(categoryInfo.icon, { size: 14 })}
                  />
                )}
                <Text className="premium-modal-title">{modalTitle}</Text>
                {selectedCategory && (
                  <Text className="premium-modal-subtitle">{selectedCategory}</Text>
                )}
              </div>
              <div style={{width: '32px'}}></div> {/* Spacer to balance the header since cancel button moved */}
            </div>
          </div>

          <div className="premium-modal-content">
            <Form
              form={form}
              layout="vertical"
              name="billForm"
              className="premium-bill-form"
            >
              <div className="form-section">
                <FormSectionHeader 
                  icon={IconFileText} 
                  title="Bill Information" 
                />
                <Form.Item 
                  name="name" 
                  rules={[{ required: true, message: 'Bill name is required' }]}
                  className="premium-form-item"
                >
                  <div className="premium-input-wrapper">
                    <Text className="input-label">Name</Text>
                    <Input 
                      placeholder="e.g. Netflix, Rent"
                      className="premium-input"
                      variant="borderless"
                    />
                  </div>
                </Form.Item>

                <Form.Item 
                  name="amount" 
                  rules={[
                    { required: true, message: 'Amount is required' },
                    { type: 'number', min: 0, message: 'Must be positive' }
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

              <div className="form-section">
                <FormSectionHeader 
                  icon={IconTag} 
                  title="Category" 
                />
                <Form.Item 
                  name="category" 
                  rules={[{ required: true, message: 'Category is required' }]}
                  className="premium-form-item"
                >
                  <Select
                    placeholder="Choose category"
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
                            size={20}
                            style={{ 
                              backgroundColor: catInfo.bgColor,
                              color: catInfo.color,
                              marginRight: 8
                            }}
                            icon={React.createElement(catInfo.icon, { size: 12 })}
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

              <div className="form-section">
                <FormSectionHeader 
                  icon={IconCalendar} 
                  title="Due Date" 
                />
                <Form.Item 
                  name="dueDate" 
                  rules={[{ required: true, message: 'Due date is required' }]}
                  className="premium-form-item"
                >
                  <DatePicker
                    format="MMM DD, YYYY"
                    placeholder="Select date"
                    className="premium-date-picker"
                    variant="borderless"
                    suffixIcon={<IconCalendar size={14} style={{ color: '#007AFF' }} />}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>

              <div className="form-section options-section">
                <FormSectionHeader 
                  icon={IconCheck} 
                  title="Options" 
                />
                <Form.Item 
                  name="isPaid" 
                  valuePropName="checked"
                  className="premium-form-item compact-option" 
                >
                  <div className="premium-option-row">
                    <div className="option-icon-wrapper paid">
                      <IconCheck size={14} /> 
                    </div>
                    <div className="option-content">
                      <Text className="option-title">Paid</Text>
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
                      <IconRepeat size={14} />
                    </div>
                    <div className="option-content">
                      <Text className="option-title">Recurring</Text>
                    </div>
                    <Checkbox className="premium-checkbox" />
                  </div>
                </Form.Item>
              </div>
            </Form>
          </div>
          <div className="premium-modal-footer">
            <Button 
              type="text" 
              className="premium-cancel-button footer-button"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="primary"
              className="premium-save-button footer-button"
              onClick={handleSubmit}
              loading={isSubmitting}
              icon={<IconCheck size={16} />}
            >
              {isSubmitting ? 'Saving' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .premium-edit-bill-modal .ant-modal {
          padding: 0; /* Modal itself has no padding, content will handle it */
        }

        .premium-edit-bill-modal .ant-modal-content {
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2), 0 10px 20px rgba(0, 0, 0, 0.15);
          background: #FDFDFD;
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        .premium-modal-container {
          background: #FDFDFD;
          max-height: 85vh; /* Increased slightly to accommodate footer */
          display: flex;
          flex-direction: column;
        }

        .premium-modal-header {
          padding: 12px 16px; /* Vertical padding, horizontal padding to align content */
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          /* Removed specific width/max-width, it will take full width of its parent .premium-modal-container */
        }

        .header-backdrop {
          display: flex;
          justify-content: space-between; /* This will push title to center if spacer is used */
          align-items: center;
          width: 100%; /* Ensure backdrop takes full width of header */
        }
        
        .header-title-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0px;
          flex-grow: 1; /* Allow title to take available space for centering */
          text-align: center;
        }

        .premium-modal-title {
          font-size: 16px;
          font-weight: 600;
          color: #1D1D1F;
          letter-spacing: -0.4px;
        }

        .premium-modal-subtitle {
          font-size: 11px;
          font-weight: 400;
          color: #86868B;
          letter-spacing: -0.1px;
        }

        .category-avatar {
          border: 1.5px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }
        
        /* Button styles are now primarily for footer buttons */
        .footer-button {
          height: 36px !important; /* Slightly taller footer buttons */
          border-radius: 10px !important;
          font-weight: 500 !important;
          font-size: 14px !important; /* Slightly larger font for footer buttons */
          display: flex;
          align-items: center;
          justify-content: center;
          flex-grow: 1; /* Allow buttons to share space */
          margin: 0 4px; /* Small margin between buttons */
        }
        
        .premium-cancel-button.footer-button {
          color: #007AFF !important;
          background: rgba(0, 122, 255, 0.08) !important;
          border: none !important;
        }
        
        .premium-save-button.footer-button {
          background: linear-gradient(135deg, #007AFF, #0056CC) !important;
          border: none !important;
          color: white !important;
          box-shadow: 0 3px 8px rgba(0, 122, 255, 0.3) !important;
          gap: 5px;
        }

        .premium-save-button.footer-button:hover {
          background: linear-gradient(135deg, #0056CC, #003D99) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0, 122, 255, 0.4) !important;
        }
        
        .premium-modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 8px 16px 16px 16px;
        }

        .premium-modal-footer {
          padding: 12px 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between; /* Or 'flex-end' or 'center' based on desired alignment */
          align-items: center;
          background: #FDFDFD; /* Match container background */
        }


        .premium-bill-form {
          width: 100%;
        }

        .form-section {
          margin-bottom: 12px;
        }
        .form-section:last-child {
          margin-bottom: 0;
        }
        .options-section .form-section-header {
            margin-bottom: 4px;
        }


        .form-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .form-section-icon-wrapper {
          width: 28px;
          height: 28px;
          background: rgba(0, 122, 255, 0.07);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #007AFF;
        }

        .form-section-text {
          flex: 1;
        }

        .form-section-title {
          font-size: 13px;
          font-weight: 500;
          color: #1D1D1F;
          letter-spacing: -0.2px;
          display: block;
        }

        .form-section-subtitle {
          font-size: 10px;
          color: #86868B;
        }
        
        .premium-form-item {
          margin-bottom: 10px !important;
        }
        .premium-form-item.compact-option {
           margin-bottom: 6px !important;
        }

        .premium-form-item:last-child {
          margin-bottom: 0 !important;
        }

        .premium-input-wrapper {
          background: #F0F0F0;
          border-radius: 10px;
          padding: 8px 12px;
          border: 1px solid transparent;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-input-wrapper:focus-within {
          background: #FFFFFF;
          border-color: #007AFF;
          box-shadow: 0 0 0 2.5px rgba(0, 122, 255, 0.1);
        }

        .input-label {
          font-size: 11px;
          font-weight: 400;
          color: #555;
          letter-spacing: -0.1px;
          display: block;
          margin-bottom: 3px;
        }

        .premium-input {
          font-size: 14px;
          color: #1D1D1F;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          font-weight: 400;
        }

        .premium-input::placeholder {
          color: #A0A0A5;
          font-weight: 400;
        }

        .amount-wrapper {
          position: relative;
        }

        .amount-input-container {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .currency-symbol {
          font-size: 15px;
          font-weight: 500;
          color: #007AFF;
        }

        .premium-amount-input.ant-input-number {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-size: 16px !important;
          font-weight: 500 !important;
          color: #1D1D1F !important;
          flex: 1;
        }

        .premium-amount-input .ant-input-number-input {
          font-size: 16px !important;
          font-weight: 500 !important;
          color: #1D1D1F !important;
          background: transparent;
          border: none;
          box-shadow: none;
          padding: 0;
        }

        .premium-category-select.ant-select {
          width: 100%;
        }

        .premium-category-select .ant-select-selector {
          background: #F0F0F0 !important;
          border: 1px solid transparent !important;
          border-radius: 10px !important;
          padding: 0 12px !important;
          min-height: 38px !important;
          height: 38px !important;
          display: flex;
          align-items: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .premium-category-select.ant-select-focused .ant-select-selector,
        .premium-category-select:hover .ant-select-selector {
          background: #FFFFFF !important;
          border-color: #007AFF !important;
          box-shadow: 0 0 0 2.5px rgba(0, 122, 255, 0.1) !important;
        }

        .premium-category-select .ant-select-selection-item,
        .premium-category-select .ant-select-selection-placeholder {
          font-size: 14px;
          font-weight: 400;
          color: #1D1D1F;
          padding: 0;
          line-height: normal;
        }
         .premium-category-select .ant-select-selection-placeholder {
            color: #A0A0A5;
         }


        .category-dropdown {
          background: #FFFFFF;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0,0,0,0.04);
          padding: 4px 0;
        }

        .category-option {
          display: flex;
          align-items: center;
          padding: 7px 12px;
          transition: all 0.15s ease;
        }

        .category-option:hover {
          background: #F0F0F0;
        }

        .category-name {
          font-size: 13px;
          font-weight: 400;
          color: #1D1D1F;
        }

        .premium-date-picker.ant-picker {
          background: #F0F0F0 !important;
          border: 1px solid transparent !important;
          border-radius: 10px !important;
          padding: 0 12px !important;
          min-height: 38px !important;
          height: 38px !important;
          width: 100%;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-date-picker.ant-picker-focused,
        .premium-date-picker:hover {
          background: #FFFFFF !important;
          border-color: #007AFF !important;
          box-shadow: 0 0 0 2.5px rgba(0, 122, 255, 0.1) !important;
        }

        .premium-date-picker .ant-picker-input input {
          font-size: 14px;
          font-weight: 400;
          color: #1D1D1F;
        }
         .premium-date-picker .ant-picker-input input::placeholder {
            color: #A0A0A5;
         }


        .premium-option-row {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          gap: 10px;
          border-radius: 10px;
          background: #F0F0F0;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        
        .premium-option-row:hover {
          background: #E8E8E8;
        }

        .option-icon-wrapper {
          width: 26px;
          height: 26px;
          border-radius: 7px;
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
          font-size: 13px;
          font-weight: 500;
          color: #1D1D1F;
        }
        
        .premium-checkbox.ant-checkbox-wrapper {
          font-size: 0;
        }

        .premium-checkbox .ant-checkbox {
          transform: scale(1.0);
        }

        .premium-checkbox .ant-checkbox-inner {
          border-radius: 6px;
          border-color: #C0C0C0;
          background: #FFFFFF;
          border-width: 1.5px;
        }

        .premium-checkbox .ant-checkbox-checked .ant-checkbox-inner {
          background: linear-gradient(135deg, #007AFF, #0056CC);
          border-color: #007AFF;
        }

        .premium-checkbox .ant-checkbox-checked .ant-checkbox-inner::after {
          border-color: #FFFFFF;
          border-width: 1.5px;
        }

        @media (max-width: 430px) {
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
            padding: 0 12px 16px 12px;
          }

          .premium-modal-header {
            padding: 12px;
          }
           .premium-modal-footer {
            padding: 12px;
          }
        }

        .premium-cancel-button.footer-button:active,
        .premium-save-button.footer-button:active {
          transform: scale(0.96);
        }

        .premium-option-row:active {
          transform: scale(0.98);
        }

        .premium-checkbox:active {
          transform: scale(0.95);
        }

        .premium-save-button.footer-button.ant-btn-loading {
          background: linear-gradient(135deg, #86868B, #6D6D70) !important;
          box-shadow: 0 3px 8px rgba(134, 134, 139, 0.3) !important;
        }

        .ant-select-dropdown {
          animation: dropdownSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .ant-picker-dropdown {
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05) !important;
          border: 1px solid rgba(0,0,0,0.04) !important;
          backdrop-filter: blur(10px);
          overflow: hidden;
        }

        .ant-picker-panel {
          border-radius: 12px;
          background: #FFFFFF;
        }

        .ant-picker-header {
          background: rgba(0, 122, 255, 0.02);
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          padding: 8px 12px;
        }

        .ant-picker-header-view {
          font-weight: 500;
          color: #1D1D1F;
          font-size: 13px;
        }

        .ant-picker-content {
          padding: 4px 8px 8px 8px;
        }

        .ant-picker-content th {
          font-size: 11px;
          font-weight: 400;
          color: #86868B;
          padding: 4px 0;
        }

        .ant-picker-content td {
          padding: 1px;
        }

        .ant-picker-cell {
          border-radius: 7px;
        }

        .ant-picker-cell-inner {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 400;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .ant-picker-cell-today .ant-picker-cell-inner {
          background: rgba(0, 122, 255, 0.08);
          color: #007AFF;
          font-weight: 500;
        }

        .ant-picker-cell-selected .ant-picker-cell-inner {
          background: linear-gradient(135deg, #007AFF, #0056CC) !important;
          color: #FFFFFF !important;
          box-shadow: 0 2px 6px rgba(0, 122, 255, 0.3);
        }

        .ant-picker-cell:hover .ant-picker-cell-inner {
          background: rgba(0, 122, 255, 0.04);
        }

        .ant-select-item {
          border-radius: 8px !important;
          margin: 2px 4px !important;
          padding: 0 !important;
          border: none !important;
        }

        .ant-select-item-option {
          padding: 7px 10px !important;
        }

        .ant-select-item-option-selected {
          background: rgba(0, 122, 255, 0.08) !important;
          color: #007AFF !important;
          font-weight: 500 !important;
        }

        .ant-select-item-option-active {
          background: rgba(0, 122, 255, 0.04) !important;
        }

        .ant-form-item-has-error .premium-input-wrapper,
        .ant-form-item-has-error .premium-category-select .ant-select-selector,
        .ant-form-item-has-error .premium-date-picker {
          border-color: #FF3B30 !important;
          background: rgba(255, 59, 48, 0.04) !important;
        }

        .ant-form-item-explain-error {
          font-size: 10px;
          color: #FF3B30;
          font-weight: 400;
          margin-top: 3px;
          padding-left: 2px;
        }
        
        .form-section-icon-wrapper {
          transition: all 0.2s ease;
        }
        .form-section:hover .form-section-icon-wrapper {
           transform: scale(1.03);
        }

        .premium-save-button.footer-button.success { /* Ensure specificity for success state on footer button */
          background: linear-gradient(135deg, #34C759, #28A745) !important;
          box-shadow: 0 3px 8px rgba(52, 199, 89, 0.3) !important;
        }

        @media (prefers-color-scheme: dark) {
          .premium-modal-container,
          .premium-edit-bill-modal .ant-modal-content {
            background: #1A1A1C; 
            border-color: rgba(255,255,255,0.08);
          }
          .premium-modal-footer {
            background: #1A1A1C;
            border-top-color: rgba(255,255,255,0.08);
          }
          
          .form-section-title,
          .premium-modal-title,
          .input-label,
          .option-title,
          .premium-input,
          .category-name {
            color: #E1E1E3 !important;
          }

          .form-section-subtitle,
          .premium-modal-subtitle {
            color: #8A8A8E !important;
          }

          .premium-input-wrapper,
          .premium-category-select .ant-select-selector,
          .premium-date-picker.ant-picker,
          .premium-option-row {
            background: #2C2C2E !important;
            border-color: #3A3A3C !important;
          }
          
          .premium-input-wrapper:focus-within,
          .premium-category-select.ant-select-focused .ant-select-selector,
          .premium-date-picker.ant-picker-focused {
            background: #3A3A3C !important;
            border-color: #0A84FF !important;
          }
          .premium-input::placeholder,
          .premium-category-select .ant-select-selection-placeholder,
          .premium-date-picker .ant-picker-input input::placeholder {
            color: #757578;
          }


          .form-section-icon-wrapper {
            background: rgba(10, 132, 255, 0.12);
            color: #0A84FF;
          }

          .category-dropdown {
            background: #2C2C2E;
            border-color: rgba(84, 84, 88, 0.5);
          }
           .category-option:hover {
             background: #3A3A3C;
           }

          .ant-picker-panel {
            background: #1C1C1E;
          }
           .ant-picker-header {
             background: rgba(10, 132, 255, 0.04);
             border-bottom: 1px solid #3A3A3C;
           }
           .ant-picker-header-view,
           .ant-picker-content th {
             color: #8A8A8E;
           }
           .ant-picker-cell-today .ant-picker-cell-inner {
             background: rgba(10, 132, 255, 0.12);
             color: #0A84FF;
           }
           .ant-picker-cell-selected .ant-picker-cell-inner {
             background: linear-gradient(135deg, #0A84FF, #0059B2) !important;
           }
           .ant-picker-cell:hover .ant-picker-cell-inner {
             background: rgba(10, 132, 255, 0.08);
           }
           .premium-checkbox .ant-checkbox-inner {
             border-color: #555;
             background: #333;
           }
           .premium-checkbox .ant-checkbox-checked .ant-checkbox-inner {
             background: linear-gradient(135deg, #0A84FF, #0059B2);
             border-color: #0A84FF;
           }
            .premium-cancel-button.footer-button {
                background: rgba(10, 132, 255, 0.15) !important;
                color: #0A84FF !important;
            }
            .premium-save-button.footer-button {
                background: linear-gradient(135deg, #0A84FF, #0059B2) !important;
            }
        }
        
        .premium-save-button, .premium-cancel-button, .premium-option-row, .form-section-icon-wrapper {
            will-change: transform, background-color, box-shadow;
        }

        .premium-modal-content {
          contain: layout style paint;
        }

        .premium-input:focus,
        .premium-amount-input input:focus,
        .premium-category-select .ant-select-selector:focus-within,
        .premium-date-picker .ant-picker-input input:focus {
          outline: none;
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
      `}</style>
    </div>
  );
};

export default PremiumEditBillModal;
