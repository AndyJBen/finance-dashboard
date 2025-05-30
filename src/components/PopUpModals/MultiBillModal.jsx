// src/components/FinancialSummary/CombinedBillsOverview/MultiBillModal.jsx
import React, { useEffect, useContext, useState } from 'react';
import {
  Modal, Form, Input, InputNumber, DatePicker,
  Select, Checkbox, Row, Col, Typography, Space, Button, 
  message, Card, Tooltip
} from 'antd';
import {
  IconPlus, IconTrash, IconTag,
  IconCalendar, IconCurrencyDollar,
  IconCheck, IconArrowsShuffle
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { FinanceContext } from '../../contexts/FinanceContext';
import './styles/MultiBillModal.css';

const { Title, Text } = Typography;
const { Option } = Select;

// Define categories here or get them from context if available globally
const billCategories = [
  "Utilities", "Rent", "Mortgage", "Groceries", "Subscription",
  "Credit Card", "Loan", "Insurance", "Medical", "Personal Care",
  "Bill Prep", "Auto", "Other"
];

export default function MultiBillModal({ open, onClose }) {
  const [form] = Form.useForm();
  const { addBill, displayedMonth, loadBillsForMonth } = useContext(FinanceContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize one empty row when the modal opens
  useEffect(() => {
    if (open) {
      form.setFieldsValue({ bills: [{ dueDate: null }] });
    }
  }, [open, form]);

  const handleOk = async () => {
    setIsSubmitting(true);
    try {
      await form.validateFields();
      const { bills } = form.getFieldsValue();

      if (!bills || bills.length === 0) {
        message.warning('Please add at least one bill.');
        setIsSubmitting(false);
        return;
      }

      const validBills = bills.filter(bill => 
        bill && bill.name && bill.amount != null && bill.category && bill.dueDate
      );

      if (validBills.length === 0) {
        message.warning('No valid bill information entered.');
        setIsSubmitting(false);
        return;
      }

      const addPromises = validBills.map(entry => addBill({
        name: entry.name.trim(),
        amount: Number(entry.amount),
        dueDate: entry.dueDate ? entry.dueDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        category: entry.category,
        isPaid: !!entry.isPaid,
        isRecurring: !!entry.isRecurring
      }));

      await Promise.all(addPromises);

      message.success(`${validBills.length} bill(s) added successfully!`);
      
      if (loadBillsForMonth) {
        await loadBillsForMonth(displayedMonth);
      }
      
      form.resetFields();
      onClose();
    } catch (errInfo) {
      console.error('Validation Failed or API Error:', errInfo);
      message.error('Failed to add bills. Please check the form for errors.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={null}
      onOk={handleOk}
      onCancel={handleCancel}
      width={isMobile ? '92%' : 520}
      style={{ 
        top: 20, // Positioned at the top of the screen as requested
        margin: '0 auto',
        padding: 0
      }}
      bodyStyle={{ 
        padding: 0,
        borderRadius: '20px',
        overflow: 'hidden' 
      }}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
      className="multi-bill-modal modern-overlay"
      footer={
        <div className="modal-footer">
          <Button onClick={handleCancel} className="cancel-button">Cancel</Button>
          <Button 
            type="primary" 
            onClick={handleOk} 
            loading={isSubmitting}
            icon={<IconCheck size={16} />}
            className="complete-button"
          >
            {isSubmitting ? 'Adding...' : 'Complete'}
          </Button>
        </div>
      }
    >
      {/* Custom Header */}
      <div className="modal-header">
        <Row align="middle" gutter={12}>
          <Col>
            <div className="modal-icon-container">
              <IconPlus size={22} />
            </div>
          </Col>
          <Col>
            <Title level={4} className="modal-title">Add Bills</Title>
          </Col>
        </Row>
      </div>

      {/* Form */}
      <Form 
        form={form} 
        layout="vertical" 
        name="multiBillForm" 
        autoComplete="off"
        className="bill-form"
      >
        <Form.List name="bills">
          {(fields, { add, remove }) => (
            <div className="bill-cards-container">
              {fields.map(({ key, name, ...restField }, index) => (
                <Card 
                  key={key} 
                  className="bill-card"
                >
                  {/* Show Bill # and remove button */}
                  <div className="bill-card-header">
                    <Text strong className="bill-number">
                      Bill #{index + 1}
                    </Text>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        className="remove-button"
                        icon={<IconTrash size={16} />}
                        onClick={() => remove(name)}
                      />
                    )}
                  </div>
                  
                  <div className="bill-form-fields">
                    {/* Bill Name */}
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: 'Name required' }]}
                    >
                      <Input
                        placeholder="Bill Name"
                        prefix={<IconTag size={16} className="field-icon" />}
                        className="bill-input"
                      />
                    </Form.Item>
                    
                    {/* Amount and Category */}
                    <div className="field-row">
                      {/* Amount */}
                      <Form.Item
                        {...restField}
                        name={[name, 'amount']}
                        rules={[{ required: true, message: 'Amount required' }]}
                        className="amount-field"
                      >
                        <InputNumber
                          placeholder="Amount"
                          prefix="$"
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? ''}
                          min={0}
                          precision={2}
                          className="bill-input"
                          inputMode="decimal"
                          pattern="[0-9]*"
                        />
                      </Form.Item>
                      
                      {/* Category */}
                      <Form.Item
                        {...restField}
                        name={[name, 'category']}
                        rules={[{ required: true, message: 'Category required' }]}
                        className="category-field"
                      >
                        <Select
                          placeholder="Category"
                          className="bill-select"
                          dropdownClassName="bill-dropdown"
                          optionFilterProp="children"
                          showSearch
                        >
                          {billCategories.map(category => (
                            <Option key={category} value={category}>{category}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                    
                    {/* Due Date */}
                    <Form.Item
                      {...restField}
                      name={[name, 'dueDate']}
                      rules={[{ required: true, message: 'Due date required' }]}
                    >
                      <DatePicker
                        format="YYYY-MM-DD"
                        placeholder="Due Date"
                        suffixIcon={<IconCalendar size={16} className="field-icon" />}
                        className="bill-input date-picker"
                      />
                    </Form.Item>
                    
                    {/* Checkboxes */}
                    <div className="options-row">
                      <Form.Item
                        {...restField}
                        name={[name, 'isPaid']}
                        valuePropName="checked"
                        className="checkbox-item"
                      >
                        <Checkbox className="styled-checkbox">
                          <Space align="center" size={4}>
                            <IconCheck size={14} className="checkbox-icon" />
                            <span>Paid</span>
                          </Space>
                        </Checkbox>
                      </Form.Item>
                      
                      <Form.Item
                        {...restField}
                        name={[name, 'isRecurring']}
                        valuePropName="checked"
                        className="checkbox-item"
                      >
                        <Checkbox className="styled-checkbox">
                          <Space align="center" size={4}>
                            <IconArrowsShuffle size={14} className="checkbox-icon" />
                            <span>Recurring</span>
                          </Space>
                        </Checkbox>
                      </Form.Item>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Add Bill Button */}
              <Button
                type="dashed"
                onClick={() => add({ dueDate: null })}
                icon={<IconPlus size={16} />}
                className="add-bill-button"
              >
                Add Another Bill
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}