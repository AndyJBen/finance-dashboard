// src/components/FinancialSummary/CombinedBillsOverview/MultiBillModal.jsx
import React, { useEffect, useContext, useState } from 'react';
import {
  Modal, Form, Input, InputNumber, DatePicker,
  Select, Checkbox, Row, Col, Typography, Space, Button, 
  message, Card, Tooltip
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, TagOutlined,
  CalendarOutlined, DollarOutlined,
  CheckOutlined, SyncOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
// Corrected the relative path for FinanceContext
import { FinanceContext } from '../../../contexts/FinanceContext';

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

  // Initialize two empty rows when the modal opens
  useEffect(() => {
    if (open) {
      form.setFieldsValue({ bills: [{ dueDate: null }, { dueDate: null }] });
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
      } else {
        console.warn("loadBillsForMonth function not found in context");
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
      title={(
        <Row align="middle" gutter={12}>
          <Col>
            <div style={{
              background: '#52c41a',
              color: 'white',
              width: 32,
              height: 32,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PlusOutlined style={{ fontSize: 16 }} />
            </div>
          </Col>
          <Col>
            <Title level={4} style={{ margin: 0, fontWeight: 500 }}>
              Add Multiple Bills
            </Title>
          </Col>
        </Row>
      )}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      destroyOnClose
      confirmLoading={isSubmitting}
      okText="Add Bills"
      okButtonProps={{ 
        style: { background: '#52c41a', borderColor: '#52c41a' }
      }}
      style={{ top: 20 }}
    >
      <Form 
        form={form} 
        layout="vertical" 
        name="multiBillForm" 
        autoComplete="off"
        style={{ maxHeight: 'unset', overflow: 'visible' }}
      >
        <Form.List name="bills">
          {(fields, { add, remove }) => (
            <div style={{ paddingBottom: 12 }}>
              {fields.map(({ key, name, ...restField }, index) => (
                <Card 
                  key={key} 
                  size="small"
                  style={{ 
                    marginBottom: 12, 
                    borderRadius: 6,
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  bodyStyle={{ padding: '12px 16px' }}
                >
                  <Row gutter={[12, 8]} align="middle">
                    {/* Bill Name */}
                    <Col span={7}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: 'Required' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input
                          placeholder="Bill Name"
                          prefix={<TagOutlined style={{ color: '#8c8c8c' }} />}
                          style={{ borderRadius: 4 }}
                        />
                      </Form.Item>
                    </Col>
                    
                    {/* Amount */}
                    <Col span={5}>
                      <Form.Item
                        {...restField}
                        name={[name, 'amount']}
                        rules={[{ required: true, message: 'Required' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber
                          placeholder="0.00"
                          style={{ width: '100%', borderRadius: 4 }}
                          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? ''}
                          min={0}
                          precision={2}
                        />
                      </Form.Item>
                    </Col>
                    
                    {/* Category */}
                    <Col span={5}>
                      <Form.Item
                        {...restField}
                        name={[name, 'category']}
                        rules={[{ required: true, message: 'Required' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Select
                          placeholder="Category"
                          style={{ width: '100%' }}
                          optionFilterProp="children"
                          showSearch
                          size="middle"
                        >
                          {billCategories.map(category => (
                            <Option key={category} value={category}>
                              {category}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    {/* Due Date */}
                    <Col span={5}>
                      <Form.Item
                        {...restField}
                        name={[name, 'dueDate']}
                        rules={[{ required: true, message: 'Required' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <DatePicker
                          style={{ width: '100%' }}
                          format="YYYY-MM-DD"
                          placeholder="Due Date"
                          suffixIcon={<CalendarOutlined style={{ color: '#8c8c8c' }} />}
                        />
                      </Form.Item>
                    </Col>
                    
                    {/* Status Checkboxes */}
                    <Col span={2} style={{ textAlign: 'center' }}>
                      <Tooltip title="Paid">
                        <Form.Item
                          {...restField}
                          name={[name, 'isPaid']}
                          valuePropName="checked"
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox>
                            <CheckOutlined style={{ color: '#52c41a' }} />
                          </Checkbox>
                        </Form.Item>
                      </Tooltip>
                    </Col>
                    
                    <Col span={2} style={{ textAlign: 'center' }}>
                      <Tooltip title="Recurring">
                        <Form.Item
                          {...restField}
                          name={[name, 'isRecurring']}
                          valuePropName="checked"
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox>
                            <SyncOutlined style={{ color: '#1890ff' }} />
                          </Checkbox>
                        </Form.Item>
                      </Tooltip>
                    </Col>
                  
                    {/* Remove button */}
                    <Col span={2} style={{ textAlign: 'right' }}>
                      {fields.length > 1 && (
                        <Tooltip title="Remove bill">
                          <Button
                            type="text"
                            danger
                            onClick={() => remove(name)}
                            icon={<DeleteOutlined />}
                            size="small"
                            style={{ marginRight: -8 }}
                          />
                        </Tooltip>
                      )}
                    </Col>
                  </Row>
                </Card>
              ))}
              
              {/* Add button */}
              <Button
                type="dashed"
                onClick={() => add({ dueDate: null })}
                block
                icon={<PlusOutlined />}
                style={{ borderRadius: 4 }}
              >
                Add Bill
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}