// src/components/FinancialSummary/CombinedBillsOverview/MultiBillModal.jsx
// Centered Paid/Recurring checkboxes horizontally. Ensured Amount field alignment.

import React, { useEffect, useContext, useState } from 'react';
import {
  Modal, Form, Input, InputNumber, DatePicker,
  Select, Checkbox, Row, Col, Typography, Space, Button, message
} from 'antd';
import {
  IconPlus, IconMinus, IconTag,
  IconCalendar, IconCategory // IconCoin is removed
} from '@tabler/icons-react';
import dayjs from 'dayjs';
// Corrected the relative path for FinanceContext (up 3 levels)
import { FinanceContext } from '../../../contexts/FinanceContext';

const { Title } = Typography;
const { Option } = Select;

// Define categories here or get them from context if available globally
const billCategories = [
  "Utilities", "Rent", "Mortgage", "Groceries", "Subscription",
  "Credit Card", "Loan", "Insurance", "Medical", "Personal Care",
  "Bill Prep", "Auto", "Other"
];

const inputHeight = '45px'; // Consistent height for all input elements

export default function MultiBillModal({ open, onClose }) {
  const [form] = Form.useForm();
  // Ensure FinanceContext is correctly imported above
  const { addBill, displayedMonth, loadBillsForMonth } = useContext(FinanceContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize two empty rows when the modal opens
  useEffect(() => {
    if (open) {
      form.setFieldsValue({ bills: [ {dueDate: null}, {dueDate: null} ] });
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

      const validBills = bills.filter(bill => bill && bill.name && bill.amount != null && bill.category && bill.dueDate);

      if (validBills.length === 0) {
          message.warning('No valid bill information entered.');
          setIsSubmitting(false);
          return;
      }

      console.log("Submitting Bills:", validBills);

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
      // Ensure loadBillsForMonth is available from context
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
        <Row align="middle" gutter={16}>
          <Col>
            <div style={{
              backgroundColor: '#52c41a',
              color: 'white',
              width: 40,
              height: 40,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconPlus size={24} />
            </div>
          </Col>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Add Multiple Bills
            </Title>
          </Col>
        </Row>
      )}
      onOk={handleOk}
      onCancel={handleCancel}
      width={900}
      bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
      destroyOnClose
      confirmLoading={isSubmitting}
      okText="Add Bills"
    >
      <Form form={form} layout="vertical" name="multiBillForm" autoComplete="off">
        <Form.List name="bills">
          {(fields, { add, remove }) => (
            <>
              {/* Table Headers - Centering text for Paid/Recurring */}
              <Row gutter={16} style={{ marginBottom: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                <Col span={5}><Typography.Text strong>Bill Name</Typography.Text></Col>
                <Col span={3}><Typography.Text strong>Amount</Typography.Text></Col>
                <Col span={4}><Typography.Text strong>Category</Typography.Text></Col>
                <Col span={4}><Typography.Text strong>Due Date</Typography.Text></Col>
                <Col span={2} style={{ textAlign: 'center' }}><Typography.Text strong>Paid</Typography.Text></Col>
                <Col span={3} style={{ textAlign: 'center' }}><Typography.Text strong>Recurring</Typography.Text></Col>
                <Col span={3} /> {/* Spacer for buttons */}
              </Row>

              {/* Dynamic Rows */}
              {fields.map(({ key, name, ...restField }, index) => (
                <Row gutter={16} key={key} align="top" style={{ marginBottom: 8 }}>
                   {/* Bill Name */}
                  <Col span={5}>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: 'Name?' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        placeholder="Bill Name"
                        style={{ height: inputHeight, borderRadius: 8 }}
                        prefix={<IconTag size={16} style={{ marginRight: 4 }} />}
                      />
                    </Form.Item>
                  </Col>
                   {/* Amount */}
                  <Col span={3}>
                    <Form.Item
                      {...restField}
                      name={[name, 'amount']}
                      rules={[{ required: true, message: 'Amt?' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        placeholder="Amount"
                        // Ensure consistent height for vertical alignment
                        style={{ width: '100%', height: inputHeight, borderRadius: 8, lineHeight: inputHeight }}
                        formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? ''}
                        min={0}
                      />
                    </Form.Item>
                  </Col>
                   {/* Category */}
                  <Col span={4}>
                    <Form.Item
                      {...restField}
                      name={[name, 'category']}
                      rules={[{ required: true, message: 'Cat?' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        placeholder="Category"
                        style={{ height: inputHeight, borderRadius: 8 }}
                      >
                        {billCategories.map(c => <Option key={c} value={c}>{c}</Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                  {/* Due Date */}
                  <Col span={4}>
                    <Form.Item
                      {...restField}
                      name={[name, 'dueDate']}
                      rules={[{ required: true, message: 'Date?' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <DatePicker
                        style={{ width: '100%', height: inputHeight, borderRadius: 8 }}
                        suffixIcon={<IconCalendar size={16} />}
                        format="YYYY-MM-DD"
                      />
                    </Form.Item>
                  </Col>
                  {/* Paid Checkbox - Centered */}
                  <Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: inputHeight }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'isPaid']}
                      valuePropName="checked"
                      style={{ marginBottom: 0 }} // Keep margin 0 for Form.Item
                    >
                      <Checkbox />
                    </Form.Item>
                  </Col>
                    {/* Recurring Checkbox - Centered */}
                  <Col span={3} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: inputHeight }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'isRecurring']}
                      valuePropName="checked"
                      style={{ marginBottom: 0 }} // Keep margin 0 for Form.Item
                    >
                      <Checkbox />
                    </Form.Item>
                  </Col>
                   {/* Action Buttons */}
                  <Col span={3} style={{ display: 'flex', alignItems: 'center', height: inputHeight }}>
                    <Space>
                      {fields.length > 1 ? (
                        <Button
                          icon={<IconMinus size={16} />}
                          type="text" danger
                          onClick={() => remove(name)}
                          style={{ padding: '4px 8px'}}
                        />
                      ) : null}
                       {index === fields.length - 1 && (
                         <Button
                           icon={<IconPlus size={16} />}
                           type="dashed"
                           onClick={() => add({dueDate: null})}
                           style={{ padding: '4px 8px'}}
                         />
                       )}
                    </Space>
                  </Col>
                </Row>
              ))}
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
