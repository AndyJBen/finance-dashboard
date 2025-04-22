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
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(82, 196, 26, 0.2)'
            }}>
              <PlusOutlined style={{ fontSize: 18 }} />
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
                    borderRadius: 12,
                    border: '1px solid #f0f0f0',
                    boxShadow: 'rgba(0, 0, 0, 0.04) 0px 3px 8px',
                    overflow: 'hidden'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Row gutter={[12, 0]} align="middle">
                        {/* Bill Name */}
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'name']}
                            rules={[{ required: true, message: 'Required' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input
                              placeholder="Bill Name"
                              prefix={<TagOutlined style={{ color: '#8c8c8c' }} />}
                              style={{ borderRadius: 8, height: 38 }}
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
                              placeholder="Amount"
                              style={{ width: '100%', borderRadius: 8, height: 38 }}
                              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? ''}
                              min={0}
                              precision={2}
                            />
                          </Form.Item>
                        </Col>
                        
                        {/* Category */}
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'category']}
                            rules={[{ required: true, message: 'Required' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              placeholder="Category"
                              style={{ width: '100%', height: 38 }}
                              dropdownStyle={{ borderRadius: 8 }}
                              optionFilterProp="children"
                              showSearch
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
                              style={{ width: '100%', borderRadius: 8, height: 38 }}
                              format="YYYY-MM-DD"
                              placeholder="Due Date"
                              suffixIcon={<CalendarOutlined style={{ color: '#8c8c8c' }} />}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    
                    {/* Actions Row */}
                    <Col span={24}>
                      <Row gutter={16} align="middle" justify="space-between">
                        <Col>
                          <Space size="large">
                            <Tooltip title="Mark as paid">
                              <Form.Item
                                {...restField}
                                name={[name, 'isPaid']}
                                valuePropName="checked"
                                style={{ marginBottom: 0 }}
                              >
                                <Checkbox>
                                  <Space align="center" size={4}>
                                    <CheckOutlined style={{ color: '#52c41a' }} />
                                    <span>Paid</span>
                                  </Space>
                                </Checkbox>
                              </Form.Item>
                            </Tooltip>
                            
                            <Tooltip title="Set as recurring">
                              <Form.Item
                                {...restField}
                                name={[name, 'isRecurring']}
                                valuePropName="checked"
                                style={{ marginBottom: 0 }}
                              >
                                <Checkbox>
                                  <Space align="center" size={4}>
                                    <SyncOutlined style={{ color: '#1890ff' }} />
                                    <span>Recurring</span>
                                  </Space>
                                </Checkbox>
                              </Form.Item>
                            </Tooltip>
                          </Space>
                        </Col>
                        
                        {/* Remove button */}
                        <Col>
                          {fields.length > 1 && (
                            <Tooltip title="Remove bill">
                              <Button
                                type="text"
                                danger
                                onClick={() => remove(name)}
                                icon={<DeleteOutlined />}
                                style={{ 
                                  borderRadius: 8,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: 32,
                                  width: 32
                                }}
                              />
                            </Tooltip>
                          )}
                        </Col>
                      </Row>
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
                style={{ 
                  borderRadius: 10, 
                  height: 42,
                  marginTop: 4
                }}
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