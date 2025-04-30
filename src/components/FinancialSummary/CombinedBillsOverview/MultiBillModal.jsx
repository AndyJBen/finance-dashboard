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
      width={isMobile ? '100%' : 580}
      style={{ top: isMobile ? 0 : 20 }}
      bodyStyle={{ 
        padding: isMobile ? '0' : '24px',
        maxHeight: isMobile ? '100vh' : '80vh',
        overflowY: 'auto'
      }}
      footer={
        <div style={{ padding: isMobile ? '12px 16px' : '12px 24px', display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button 
            type="primary" 
            onClick={handleOk} 
            loading={isSubmitting}
            icon={<IconCheck size={16} />}
          >
            {isSubmitting ? 'Adding...' : 'Add Bills'}
          </Button>
        </div>
      }
      className="multi-bill-modal"
      fullScreen={isMobile}
    >
      {/* Custom Header */}
      <div style={{ 
        borderBottom: '1px solid #f0f0f0', 
        padding: isMobile ? '16px' : '16px 24px', 
        backgroundColor: '#f9fafc',
        borderTopLeftRadius: isMobile ? 0 : 8,
        borderTopRightRadius: isMobile ? 0 : 8
      }}>
        <Row align="middle" gutter={16}>
          <Col>
            <div style={{ 
              backgroundColor: '#52c41a', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              boxShadow: '0 2px 8px rgba(82, 196, 26, 0.2)'
            }}>
              <IconPlus size={20} />
            </div>
          </Col>
          <Col>
            <Title level={4} style={{ margin: 0 }}>Add Bills</Title>
          </Col>
        </Row>
      </div>

      {/* Form */}
      <Form 
        form={form} 
        layout="vertical" 
        name="multiBillForm" 
        autoComplete="off"
        style={{ 
          padding: isMobile ? '16px' : '24px', 
          maxHeight: isMobile ? 'calc(100vh - 180px)' : 'unset',
          overflow: isMobile ? 'auto' : 'visible'
        }}
      >
        <Form.List name="bills">
          {(fields, { add, remove }) => (
            <div style={{ paddingBottom: 12 }}>
              {fields.map(({ key, name, ...restField }, index) => (
                <Card 
                  key={key} 
                  size="small"
                  style={{ 
                    marginBottom: 16, 
                    borderRadius: 12,
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden'
                  }}
                  bodyStyle={{ padding: isMobile ? '12px' : '16px' }}
                >
                  {/* Show Bill # and remove button */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    alignItems: 'center'
                  }}>
                    <Text strong style={{ fontSize: '14px', color: '#52c41a' }}>
                      Bill #{index + 1}
                    </Text>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<IconTrash size={16} />}
                        onClick={() => remove(name)}
                        style={{ 
                          width: 32, 
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Mobile optimized layout */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Bill Name */}
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: 'Name required' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        placeholder="Bill Name"
                        prefix={<IconTag size={16} style={{ color: '#8c8c8c' }} />}
                        style={{ 
                          height: isMobile ? '48px' : '38px', 
                          borderRadius: 8,
                        }}
                      />
                    </Form.Item>
                    
                    {/* Amount and Category */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {/* Amount */}
                      <Form.Item
                        {...restField}
                        name={[name, 'amount']}
                        rules={[{ required: true, message: 'Amount required' }]}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <InputNumber
                          placeholder="Amount"
                          style={{ 
                            width: '100%', 
                            height: isMobile ? '48px' : '38px',
                            borderRadius: 8,
                          }}
                          prefix="$"
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? ''}
                          min={0}
                          precision={2}
                        />
                      </Form.Item>
                      
                      {/* Category */}
                      <Form.Item
                        {...restField}
                        name={[name, 'category']}
                        rules={[{ required: true, message: 'Category required' }]}
                        style={{ marginBottom: 0, flex: 1.5 }}
                      >
                        <Select
                          placeholder="Category"
                          style={{ 
                            width: '100%', 
                            height: isMobile ? '48px' : '38px',
                          }}
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
                    </div>
                    
                    {/* Due Date */}
                    <Form.Item
                      {...restField}
                      name={[name, 'dueDate']}
                      rules={[{ required: true, message: 'Due date required' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <DatePicker
                        style={{ 
                          width: '100%', 
                          height: isMobile ? '48px' : '38px',
                          borderRadius: 8,
                        }}
                        format="YYYY-MM-DD"
                        placeholder="Due Date"
                        suffixIcon={<IconCalendar size={16} style={{ color: '#8c8c8c' }} />}
                      />
                    </Form.Item>
                    
                    {/* Checkboxes */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginTop: 4
                    }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'isPaid']}
                        valuePropName="checked"
                        style={{ marginBottom: 0 }}
                      >
                        <Checkbox>
                          <Space align="center" size={4}>
                            <IconCheck size={14} style={{ color: '#52c41a' }} />
                            <span>Paid</span>
                          </Space>
                        </Checkbox>
                      </Form.Item>
                      
                      <Form.Item
                        {...restField}
                        name={[name, 'isRecurring']}
                        valuePropName="checked"
                        style={{ marginBottom: 0 }}
                      >
                        <Checkbox>
                          <Space align="center" size={4}>
                            <IconArrowsShuffle size={14} style={{ color: '#1890ff' }} />
                            <span>Recurring</span>
                          </Space>
                        </Checkbox>
                      </Form.Item>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Add Bill Button - optimized for touch */}
              <Button
                type="dashed"
                onClick={() => add({ dueDate: null })}
                icon={<IconPlus size={16} />}
                style={{ 
                  width: '100%',
                  height: isMobile ? '54px' : '42px',
                  borderRadius: 10,
                  marginTop: 8,
                  borderColor: '#52c41a',
                  color: '#52c41a'
                }}
              >
                Add Another Bill
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
      
      {/* Add custom styles to improve mobile experience */}
      <style jsx global>{`
        .multi-bill-modal .ant-modal-content {
          border-radius: ${isMobile ? '0' : '12px'};
          overflow: hidden;
        }
        
        .multi-bill-modal .ant-input-number-input {
          height: ${isMobile ? '48px' : '38px'};
          line-height: ${isMobile ? '48px' : '38px'};
        }
        
        @media (max-width: 768px) {
          .multi-bill-modal {
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            top: 0 !important;
            padding: 0 !important;
          }
          
          .multi-bill-modal .ant-modal-content {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          .multi-bill-modal .ant-modal-body {
            flex: 1;
            overflow-y: auto;
          }
          
          /* Enhanced touch targets */
          .multi-bill-modal .ant-select-selector {
            height: 48px !important;
            padding-top: 8px !important;
          }
          
          .multi-bill-modal .ant-picker {
            padding: 8px 11px 8px;
          }
          
          .multi-bill-modal .ant-checkbox-wrapper {
            font-size: 14px;
            padding: 4px 0;
          }
          
          .multi-bill-modal .ant-form-item-explain {
            font-size: 12px;
          }
        }
      `}</style>
    </Modal>
  );
}