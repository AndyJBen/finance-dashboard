// src/components/BillsList/EditBillModal.jsx
// COMPLETE FILE CODE
// Highlight: Added console logging to check props and form interaction.

import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Checkbox, Row, Col, Typography } from 'antd';
import {
    IconEdit,
    IconPlus,
    IconCoin,
    IconCalendar,
    IconTag
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
            isPaid: initialData.hasOwnProperty('isPaid') ? Boolean(initialData.isPaid) : false,
          });
        } else {
          // Adding new bill
          console.log("[EditBillModal] useEffect - Adding mode. Resetting fields.");
          form.resetFields();
          // Set default values for checkboxes if needed
          form.setFieldsValue({ isPaid: false, isRecurring: false });
        }
    } else {
        // Optional: Log when modal is closed if needed for debugging lifecycle
        // console.log("[EditBillModal] useEffect - Modal is closed.");
    }
  }, [open, initialData, form]); // Dependencies for the effect

  // Handler for the OK button click
  const handleOk = () => {
    console.log("[EditBillModal] handleOk called.");
    form
      .validateFields()
      .then((values) => {
        console.log("[EditBillModal] Form validation successful. Values:", values);
        // Format data before submitting
        const formattedValues = {
          ...values,
           // Format dueDate to YYYY-MM-DD string or null
           dueDate: values.dueDate && dayjs(values.dueDate).isValid() ? values.dueDate.format('YYYY-MM-DD') : null,
           // Ensure amount is a number, default to 0
           amount: Number(values.amount) || 0,
           // Ensure boolean values
           isPaid: Boolean(values.isPaid),
           isRecurring: Boolean(values.isRecurring)
        };
        // If editing, include the ID
        if (initialData && initialData.id) {
            formattedValues.id = initialData.id;
        }
        console.log("[EditBillModal] Calling onSubmit with formatted values:", formattedValues);
        onSubmit(formattedValues); // Call the onSubmit prop passed from parent
      })
      .catch((info) => {
        console.error('[EditBillModal] Form Validation Failed:', info);
      });
  };

  // Determine modal title and icon based on whether initialData is present
  const modalTitle = initialData ? 'Edit Bill' : 'Add New Bill';
  const modalIcon = initialData ? <IconEdit size={20} /> : <IconPlus size={20} />;
  const modalIconBg = initialData ? '#1677ff' : '#52c41a'; // Blue for edit, Green for add

  // Custom styles for modal parts (AntD v5)
  const modalStyles = {
    header: { borderBottom: '1px solid #f0f0f0', padding: '16px 24px', backgroundColor: '#f9fafc' },
    body: { padding: '24px' },
    footer: { borderTop: '1px solid #f0f0f0', padding: '12px 24px' }
  };

  const inputHeight = '45px'; // Consistent input height

  // --- Component Render ---
  return (
    <Modal
      title={null} // Use custom header below
      // Use 'open' prop for AntD v5
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText={initialData ? 'Save Changes' : 'Add Bill'}
      cancelText="Cancel"
      destroyOnClose // Unmount component when closed
      width={480}
      // Use 'styles' prop for AntD v5
      styles={{
        body: modalStyles.body,
        footer: modalStyles.footer,
        // Header style applied via custom div below
      }}
    >
      {/* Custom Header */}
      <div style={modalStyles.header}>
        <Row align="middle" gutter={16}>
          <Col>
            <div style={{ backgroundColor: modalIconBg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px', fontSize: '18px' }}>
              {modalIcon}
            </div>
          </Col>
          <Col>
            <Title level={4} style={{ margin: 0 }}>{modalTitle}</Title>
          </Col>
        </Row>
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        name="billForm"
        id="billFormInstance" // Added ID for potential targeting
        style={{ marginTop: '16px' }}
      >
        {/* Bill Name */}
        <Form.Item name="name" label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Bill Name</span>} rules={[{ required: true, message: 'Please input the bill name!' }]} >
          <Input prefix={<IconTag size={16} style={{ color: '#1677ff' }} />} placeholder="e.g., Electricity Bill" style={{ height: inputHeight, borderRadius: '8px' }} />
        </Form.Item>

        {/* Amount */}
        <Form.Item name="amount" label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Amount</span>} rules={[{ required: true, message: 'Please input the amount!' }, { type: 'number', min: 0, message: 'Amount cannot be negative!' }]} >
          <InputNumber prefix={<IconCoin size={16} style={{ color: '#1677ff' }} />} min={0} step={0.01} formatter={(value) => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\$\s?|(,*)/g, '')} style={{ width: '100%', height: inputHeight, borderRadius: '8px' }} placeholder="e.g., 75.50" />
        </Form.Item>

        {/* Due Date */}
        <Form.Item name="dueDate" label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Due Date</span>} rules={[{ required: true, message: 'Please select the due date!' }]} >
          <DatePicker format="YYYY-MM-DD" style={{ width: '100%', height: inputHeight, borderRadius: '8px' }} placeholder="Select date" suffixIcon={<IconCalendar size={16} style={{ color: '#1677ff' }} />} />
        </Form.Item>

        {/* Category */}
        <Form.Item name="category" label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Category</span>} rules={[{ required: true, message: 'Please select a category!' }]} >
          <Select placeholder="Select or type a category" style={{ width: '100%', height: inputHeight, borderRadius: '8px' }} dropdownStyle={{ borderRadius: '8px' }} suffixIcon={<IconTag size={16} style={{ color: '#1677ff' }} />} >
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
    </Modal>
  );
  // --- End Component Render ---
};

export default EditBillModal;
