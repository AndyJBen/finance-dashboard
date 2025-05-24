// src/components/BillsList/EditBillModal.jsx
// COMPLETE FILE CODE
// Highlight: Added console logging to check props and form interaction.

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Checkbox, Row, Col, Typography, Button } from 'antd';
import {
    IconEdit,
    IconPlus,
    IconCoin,
    IconCalendar,
    IconTag,
    IconCheck
} from '@tabler/icons-react';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title } = Typography;

// Define common categories
const billCategories = [
    "Utilities", "Rent", "Mortgage", "Groceries", "Subscription",
    "Credit Card", "Loan", "Insurance", "Medical", "Personal Care",
    "Bill Prep", "Auto", "Other"
];

// Highlight: Use 'open' prop for AntD v5
const EditBillModal = ({ open, onCancel, onSubmit, initialData }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [applyToFuture, setApplyToFuture] = useState({ amount: false, dueDate: false, category: false });
  const [lastValues, setLastValues] = useState({ amount: null, dueDate: null, category: null });

  // Update mobile state on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Highlight: Log props when component renders/updates
  console.log(`[EditBillModal] Rendering. open=${open}, initialData:`, initialData);

  // Effect to set form values when modal opens or initialData changes
  useEffect(() => {
    // Only run if the modal is open
    if (open) {
        console.log("[EditBillModal] useEffect - Modal is open. Setting form values.");
        if (initialData) {
          // Editing existing bill
          console.log("[EditBillModal] useEffect - Editing mode. Initial data:", initialData);
          form.setFieldsValue({
            ...initialData,
            // Ensure dueDate is a valid dayjs object or null
            dueDate: initialData.dueDate && dayjs(initialData.dueDate).isValid() ? dayjs(initialData.dueDate) : null,
            // Ensure boolean values are correctly set
            isRecurring: Boolean(initialData.isRecurring),
            // Default isPaid to false if not present, otherwise convert to boolean
            isPaid: Object.prototype.hasOwnProperty.call(initialData, 'isPaid') ? Boolean(initialData.isPaid) : false,
          });
          setLastValues({
            amount: initialData.amount,
            dueDate: initialData.dueDate ? dayjs(initialData.dueDate) : null,
            category: initialData.category
          });
        } else {
          // Adding new bill
          console.log("[EditBillModal] useEffect - Adding mode. Resetting fields.");
          form.resetFields();
          // Set default values for checkboxes if needed
          form.setFieldsValue({ isPaid: false, isRecurring: false });
          setLastValues({ amount: null, dueDate: null, category: null });
        }
    } else {
        // Optional: Log when modal is closed if needed for debugging lifecycle
        // console.log("[EditBillModal] useEffect - Modal is closed.");
    }
  }, [open, initialData, form]); // Dependencies for the effect

  // Reset submitting state when modal is closed
  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      setApplyToFuture({ amount: false, dueDate: false, category: false });
      setLastValues({ amount: null, dueDate: null, category: null });
    }
  }, [open]);

  const promptApplyFuture = (field, value) => {
    Modal.confirm({
      title: 'Apply change to future bills?',
      content: 'Do you want to apply this change only to this bill or also to all future bills?',
      okText: 'All Future Bills',
      cancelText: 'Only This Bill',
      onOk: () => {
        setApplyToFuture(prev => ({ ...prev, [field]: true }));
        setLastValues(prev => ({ ...prev, [field]: value }));
      },
      onCancel: () => {
        setApplyToFuture(prev => ({ ...prev, [field]: false }));
        setLastValues(prev => ({ ...prev, [field]: value }));
      }
    });
  };

  const handleBlur = (field) => {
    const value = form.getFieldValue(field);
    const previous = lastValues[field];
    let changed = false;
    if (field === 'dueDate') {
      const formatted = value && dayjs(value).isValid() ? dayjs(value) : null;
      changed = !formatted?.isSame(previous, 'day');
      if (changed) {
        promptApplyFuture(field, formatted);
      }
    } else {
      changed = value !== previous && value !== undefined;
      if (changed) {
        promptApplyFuture(field, value);
      }
    }
  };

  // Handler for the OK button click
  const handleOk = () => {
    console.log("[EditBillModal] handleOk called.");
    setIsSubmitting(true);
    form
      .validateFields()
      .then((values) => {
        console.log("[EditBillModal] Form validation successful. Values:", values);
        const formattedValues = {
          ...values,
          dueDate: values.dueDate && dayjs(values.dueDate).isValid() ? values.dueDate.format('YYYY-MM-DD') : null,
          amount: Number(values.amount) || 0,
          isPaid: Boolean(values.isPaid),
          isRecurring: Boolean(values.isRecurring)
        };
        if (initialData && initialData.id) {
          formattedValues.id = initialData.id;
        }
        formattedValues.applyToFuture = applyToFuture;
        console.log("[EditBillModal] Calling onSubmit with formatted values:", formattedValues);
        onSubmit(formattedValues);
      })
      .catch((info) => {
        console.error('[EditBillModal] Form Validation Failed:', info);
      })
      .finally(() => setIsSubmitting(false));
  };

  // Determine modal title and icon based on whether initialData is present
  const modalTitle = initialData ? 'Edit Bill' : 'Add New Bill';
  const modalIcon = initialData ? <IconEdit size={20} /> : <IconPlus size={20} />;
  const modalIconBg = initialData ? '#1677ff' : '#52c41a'; // Blue for edit, Green for add

  // --- Component Render ---
  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={
        <div className="modal-footer">
          <Button onClick={onCancel} className="cancel-button">Cancel</Button>
          <Button
            type="primary"
            onClick={handleOk}
            loading={isSubmitting}
            icon={<IconCheck size={16} />}
            className="complete-button"
          >
            {initialData ? 'Save Changes' : 'Add Bill'}
          </Button>
        </div>
      }
      width={isMobile ? '92%' : 480}
      style={{ top: 20, margin: '0 auto', padding: 0 }}
      bodyStyle={{ padding: 0, borderRadius: '20px', overflow: 'hidden' }}
      maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      className="edit-bill-modal modern-overlay"
    >
      {/* Custom Header */}
      <div className="modal-header">
        <Row align="middle" gutter={12}>
          <Col>
            <div className="modal-icon-container" style={{ backgroundColor: modalIconBg }}>
              {modalIcon}
            </div>
          </Col>
          <Col>
            <Title level={4} className="modal-title">{modalTitle}</Title>
          </Col>
        </Row>
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        name="billForm"
        id="billFormInstance"
        className="bill-form"
      >
        {/* Bill Name */}
        <Form.Item name="name" label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Bill Name</span>} rules={[{ required: true, message: 'Please input the bill name!' }]} >
          <Input prefix={<IconTag size={16} style={{ color: '#1677ff' }} />} placeholder="e.g., Electricity Bill" className="bill-input" />
        </Form.Item>

        {/* Amount */}
        <Form.Item name="amount" label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Amount</span>} rules={[{ required: true, message: 'Please input the amount!' }, { type: 'number', min: 0, message: 'Amount cannot be negative!' }]} >
          <InputNumber prefix={<IconCoin size={16} style={{ color: '#1677ff' }} />} min={0} step={0.01} formatter={(value) => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\$\s?|(,*)/g, '')} className="bill-input" style={{ width: '100%' }} placeholder="e.g., 75.50" onBlur={() => handleBlur('amount')} />
        </Form.Item>

        {/* Due Date */}
        <Form.Item name="dueDate" label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Due Date</span>} rules={[{ required: true, message: 'Please select the due date!' }]} >
          <DatePicker format="YYYY-MM-DD" placeholder="Select date" suffixIcon={<IconCalendar size={16} style={{ color: '#1677ff' }} />} className="bill-input date-picker" onBlur={() => handleBlur('dueDate')} />
        </Form.Item>

        {/* Category */}
        <Form.Item name="category" label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Category</span>} rules={[{ required: true, message: 'Please select a category!' }]} >
          <Select placeholder="Select or type a category" className="bill-select" dropdownStyle={{ borderRadius: '8px' }} suffixIcon={<IconTag size={16} style={{ color: '#1677ff' }} />} onBlur={() => handleBlur('category')} >
            {billCategories.map(category => ( <Option key={category} value={category}>{category}</Option> ))}
          </Select>
        </Form.Item>

        {/* Paid Status & Recurring Options */}
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name="isPaid" label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Status</span>} valuePropName="checked" >
              <Checkbox> Paid </Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isRecurring" valuePropName="checked" label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Options</span>} >
              <Checkbox> Recurring </Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <style jsx global>{`
        .edit-bill-modal .ant-modal-content {
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          padding: 0;
        }

        .modal-header {
          padding: 16px 24px;
          background: linear-gradient(135deg, #1D4ED8, #3B82F6);
          color: white;
          border-radius: 20px 20px 0 0;
        }

        .modal-icon-container {
          width: 38px;
          height: 38px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .modal-title {
          color: white !important;
          margin: 0 !important;
          font-size: 18px !important;
          font-weight: 600 !important;
        }

        .bill-form {
          padding: 24px;
        }

        .bill-input,
        .bill-select .ant-select-selector,
        .bill-form .ant-picker {
          height: 48px !important;
          border-radius: 12px !important;
          font-size: 15px !important;
        }

        .bill-select .ant-select-selector {
          padding-top: 6px !important;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 14px 24px;
          border-top: 1px solid #F0F0F0;
          gap: 12px;
        }

        .modal-footer .ant-btn {
          padding: 0 20px;
          height: 44px;
          font-size: 15px;
          border-radius: 12px;
          min-width: 100px;
          font-weight: 500;
        }

        .cancel-button {
          color: #64748B;
          border-color: #E2E8F0;
        }

        .complete-button {
          background-color: #1D4ED8;
        }

        @media (max-width: 768px) {
          .modal-header {
            padding: 14px 16px;
          }
          .bill-form {
            padding: 20px 16px;
          }
          .modal-footer {
            padding: 12px 16px;
            gap: 8px;
          }
          .modal-footer .ant-btn {
            height: 40px;
            min-width: 90px;
            font-size: 14px;
          }
        }
      `}</style>
    </Modal>
  );
  // --- End Component Render ---
};

export default EditBillModal;
