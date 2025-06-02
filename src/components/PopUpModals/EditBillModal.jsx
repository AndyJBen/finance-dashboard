// Unified Apple-Inspired Edit Bill Modal
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Checkbox, Typography, Button, Avatar } from 'antd';
import ConfirmApplyModal from './ConfirmApplyModal';
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
    IconHelp,
    IconPlane,
    IconSchool,
    IconUsersGroup
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import './styles/EditBillModal.css';
import { billCategories as categoryNames } from '../../utils/categoryIcons';

const { Option } = Select;
const { Text } = Typography;

// Category metadata with icons and colors
const categoryDetails = {
    Utilities: { icon: IconBolt, color: "#FF9500", bgColor: "#FFF2E5" },
    Rent: { icon: IconHome, color: "#007AFF", bgColor: "#E5F2FF" },
    Mortgage: { icon: IconHome, color: "#5856D6", bgColor: "#EEEEFD" },
    Groceries: { icon: IconShoppingCart, color: "#34C759", bgColor: "#E8F8EA" },
    Subscription: { icon: IconDeviceLaptop, color: "#AF52DE", bgColor: "#F4ECFB" },
    "Credit Card": { icon: IconCreditCard, color: "#FF3B30", bgColor: "#FFE9E8" },
    Loan: { icon: IconFileText, color: "#FF9500", bgColor: "#FFF2E5" },
    Insurance: { icon: IconCar, color: "#32D74B", bgColor: "#E8F8EA" },
    Medical: { icon: IconStethoscope, color: "#FF3B30", bgColor: "#FFE9E8" },
    "Personal Care": { icon: IconHelp, color: "#5856D6", bgColor: "#EEEEFD" },
    "Bill Prep": { icon: IconCalendar, color: "#007AFF", bgColor: "#E5F2FF" },
    Auto: { icon: IconCar, color: "#FF9500", bgColor: "#FFF2E5" },
    Travel: { icon: IconPlane, color: "#FF9500", bgColor: "#FFF2E5" },
    Education: { icon: IconSchool, color: "#AF52DE", bgColor: "#F4ECFB" },
    "Family Support": { icon: IconUsersGroup, color: "#5856D6", bgColor: "#EEEEFD" },
    Home: { icon: IconHome, color: "#007AFF", bgColor: "#E5F2FF" },
    Other: { icon: IconHelp, color: "#8E8E93", bgColor: "#F2F2F7" }
};

// Build final list of bill categories using global names
const billCategories = categoryNames.map(name => ({
    name,
    ...(categoryDetails[name] || { icon: IconHelp, color: '#8E8E93', bgColor: '#F2F2F7' })
}));

const UnifiedEditBillModal = ({ open, onCancel, onSubmit, bill }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: null,
    category: null,
    dueDate: null,
    isPaid: false,
    isRecurring: false,
  });

  const formatAmount = (value) =>
    value !== null && value !== undefined && value !== ''
      ? Number(value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';

  const parseAmount = (value) => {
    if (value === '' || value === null || value === undefined) {
      return '';
    }
    const numeric = parseFloat(value.toString().replace(/,/g, ''));
    return Number.isNaN(numeric) ? '' : numeric;
  };

  // Find category info
  const getCategoryInfo = (categoryName) => {
    return billCategories.find(cat => cat.name === categoryName) || billCategories[billCategories.length - 1];
  };

  // Initialize form when modal opens or bill changes
  useEffect(() => {
    if (open) {
      if (bill) {
        const normalized = {
          name: bill.name || '',
          amount: bill.amount,
          category: bill.category || null,
          dueDate: bill.dueDate && dayjs(bill.dueDate).isValid() ? dayjs(bill.dueDate) : null,
          isRecurring: !!bill.isRecurring,
          isPaid: Object.prototype.hasOwnProperty.call(bill, 'isPaid') ? !!bill.isPaid : false,
        };
        setFormData(normalized);
        form.setFieldsValue(normalized);
        setSelectedCategory(bill.category);
      } else {
        const defaults = { name: '', amount: null, category: null, dueDate: null, isPaid: false, isRecurring: false };
        setFormData(defaults);
        form.setFieldsValue(defaults);
        setSelectedCategory(null);
      }
    }
  }, [open, bill, form]);

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

      if (bill && bill.id) {
        formattedValues.id = bill.id;
        setPendingValues(formattedValues);
        setConfirmOpen(true);
      } else {
        setIsSubmitting(true);
        await onSubmit(formattedValues);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Form validation failed:', err);
      setIsSubmitting(false);
    }
  };

  const handleApplySingle = async () => {
    if (!pendingValues) return;
    setIsSubmitting(true);
    await onSubmit(pendingValues);
    setIsSubmitting(false);
    setConfirmOpen(false);
    setPendingValues(null);
  };

  const handleApplyAll = async () => {
    if (!pendingValues) return;
    setIsSubmitting(true);
    await onSubmit({
      ...pendingValues,
      applyToFuture: { amount: true, dueDate: true, category: true }
    });
    setIsSubmitting(false);
    setConfirmOpen(false);
    setPendingValues(null);
  };

  const modalTitle = bill ? 'Edit Bill' : 'Create New Bill';
  const categoryInfo = getCategoryInfo(selectedCategory);

  return (
    <>
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
                {bill && (
                  <Text className="current-bill-info">
                    {bill.name} • ${Number(bill.amount || 0).toFixed(2)}
                  </Text>
                )}
              </div>
            </div>
          </div>
        </div>

        <Form
          id="billForm"
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
                        value={formData.name}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, name: value }));
                          form.setFieldsValue({ name: value });
                        }}
                      />
                    </div>
                  </Form.Item>

                  <Form.Item
                    name="amount"
                    rules={[
                      { required: true, message: 'Required' },
                      { type: 'number', min: 0.01, message: 'Must be positive' }
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
                          min={0.01}
                          step={0.01}
                          value={formData.amount}
                          onChange={(value) => {
                            const parsed = parseAmount(value);
                            setFormData(prev => ({ ...prev, amount: parsed }));
                            form.setFieldsValue({ amount: parsed });
                          }}
                          formatter={formatAmount}
                          parser={parseAmount}
                          controls={false}
                          inputMode="decimal"
                          pattern="[0-9]*"
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
                        value={formData.category}
                        onChange={(value) => {
                          setSelectedCategory(value);
                          setFormData(prev => ({ ...prev, category: value }));
                          form.setFieldsValue({ category: value });
                        }}
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
                        value={formData.dueDate}
                        onChange={(date) => {
                          setFormData(prev => ({ ...prev, dueDate: date }));
                          form.setFieldsValue({ dueDate: date });
                        }}
                      />
                    </div>
                  </Form.Item>
                </div>

                <div className="input-row options-row">
                  <Form.Item name="isPaid" valuePropName="checked" className="option-item">
                    <div className="compact-option">
                      <Text className="compact-option-text">Mark as Paid</Text>
                      <Checkbox
                        className="compact-checkbox"
                        checked={formData.isPaid}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({ ...prev, isPaid: checked }));
                          form.setFieldsValue({ isPaid: checked });
                        }}
                      />
                    </div>
                  </Form.Item>

                  <Form.Item name="isRecurring" valuePropName="checked" className="option-item">
                    <div className="compact-option">
                      <Text className="compact-option-text">Recurring Bill</Text>
                      <Checkbox
                        className="compact-checkbox"
                        checked={formData.isRecurring}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({ ...prev, isRecurring: checked }));
                          form.setFieldsValue({ isRecurring: checked });
                        }}
                      />
                    </div>
                  </Form.Item>
                </div>
              </div>
            </div>
          </Form>

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
    </Modal>
    {bill && (
      <ConfirmApplyModal
        open={confirmOpen}
        onCancel={() => { setConfirmOpen(false); setPendingValues(null); }}
        onJustThis={handleApplySingle}
        onAllFuture={handleApplyAll}
      />
    )}
    </>
  );
};

export default UnifiedEditBillModal;
