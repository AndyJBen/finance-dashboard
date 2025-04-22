import React, { useEffect, useContext, useState } from 'react';
import {
  Modal, Form, Input, InputNumber, DatePicker,
  Select, Checkbox, Row, Col, Typography, Space, Button, message // Added message
} from 'antd';
import {
  IconPlus, IconMinus, IconTag,
  IconCoin, IconCalendar, IconCategory // Added IconCategory
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { FinanceContext } from '../../contexts/FinanceContext';

const { Title } = Typography;
const { Option } = Select;

// Define categories here or get them from context if available globally
// Using the list from EditBillModal for consistency
const billCategories = [
  "Utilities", "Rent", "Mortgage", "Groceries", "Subscription",
  "Credit Card", "Loan", "Insurance", "Medical", "Personal Care",
  "Bill Prep", "Auto", "Other"
];

const inputHeight = '45px'; // Consistent height

export default function MultiBillModal({ open, onClose }) {
  const [form] = Form.useForm();
  const { addBill, displayedMonth, loadBillsForMonth } = useContext(FinanceContext);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state

  // Initialize two empty rows when the modal opens
  useEffect(() => {
    if (open) {
      // Reset form with two empty rows when modal opens
      form.setFieldsValue({ bills: [ {dueDate: null}, {dueDate: null} ] });
    }
  }, [open, form]);

  const handleOk = async () => {
    setIsSubmitting(true); // Set submitting state
    try {
      // Explicitly validate all fields
      await form.validateFields();
      const { bills } = form.getFieldsValue(); // Get values after validation

      if (!bills || bills.length === 0) {
        message.warning('Please add at least one bill.');
        setIsSubmitting(false);
        return;
      }

      // Filter out any potentially empty/invalid rows just in case
      const validBills = bills.filter(bill => bill && bill.name && bill.amount != null && bill.category && bill.dueDate);

      if (validBills.length === 0) {
          message.warning('No valid bill information entered.');
          setIsSubmitting(false);
          return;
      }

      console.log("Submitting Bills:", validBills); // Debug log

      // Call addBill for each entry, await all promises
      const addPromises = validBills.map(entry => addBill({
        name: entry.name.trim(),
        amount: Number(entry.amount),
        // Ensure dueDate is formatted correctly, default to today if somehow null after validation
        dueDate: entry.dueDate ? entry.dueDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        category: entry.category,
        isPaid: !!entry.isPaid, // Ensure boolean
        isRecurring: !!entry.isRecurring // Ensure boolean
      }));

      await Promise.all(addPromises);

      message.success(`${validBills.length} bill(s) added successfully!`);
      await loadBillsForMonth(displayedMonth); // Reload the list for the current month
      form.resetFields(); // Reset form after successful submission
      onClose(); // Close the modal
    } catch (errInfo) {
      console.error('Validation Failed or API Error:', errInfo);
      message.error('Failed to add bills. Please check the form for errors.');
      // If errInfo.errorFields exists, Ant Design automatically highlights errors
    } finally {
        setIsSubmitting(false); // Reset submitting state
    }
  };

  const handleCancel = () => {
      form.resetFields(); // Reset form fields on cancel
      onClose(); // Close the modal
  };

  return (
    <Modal
      open={open}
      title={(
        <Row align="middle" gutter={16}>
          <Col>
            {/* Consistent Title Icon Style */}
            <div style={{
              backgroundColor: '#52c41a', // Green background
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
      onCancel={handleCancel} // Use the updated cancel handler
      width={900} // Increased width to accommodate fields better
      bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
      destroyOnClose // Destroy component state when closed
      confirmLoading={isSubmitting} // Show loading state on OK button
      okText="Add Bills" // Change OK button text
    >
      <Form form={form} layout="vertical" name="multiBillForm" autoComplete="off">
        <Form.List name="bills">
          {(fields, { add, remove }) => (
            <>
              {/* Table Headers */}
              <Row gutter={16} style={{ marginBottom: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                <Col span={5}><Typography.Text strong>Bill Name</Typography.Text></Col>
                <Col span={3}><Typography.Text strong>Amount</Typography.Text></Col>
                <Col span={4}><Typography.Text strong>Category</Typography.Text></Col>
                <Col span={4}><Typography.Text strong>Due Date</Typography.Text></Col>
                <Col span={2}><Typography.Text strong>Paid</Typography.Text></Col>
                <Col span={3}><Typography.Text strong>Recurring</Typography.Text></Col>
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
                      style={{ marginBottom: 0 }} // Reduce item margin
                    >
                      <Input
                        placeholder="Bill Name"
                        style={{ height: inputHeight, borderRadius: 8 }}
                        prefix={<IconTag size={16} style={{ marginRight: 4 }} />} // Smaller icon
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
                        style={{ width: '100%', height: inputHeight, borderRadius: 8 }}
                        formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? ''}
                        prefix={<IconCoin size={16} style={{ marginRight: 4 }} />} // Smaller icon
                        min={0} // Ensure positive amount
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
                        // Add prefix icon directly to Select if possible or simulate it
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
                        suffixIcon={<IconCalendar size={16} />} // Smaller icon
                        format="YYYY-MM-DD" // Set format
                      />
                    </Form.Item>
                  </Col>
                  {/* Paid Checkbox */}
                  <Col span={2} style={{ display: 'flex', alignItems: 'center', height: inputHeight }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'isPaid']}
                      valuePropName="checked"
                      style={{ marginBottom: 0 }}
                    >
                      <Checkbox />
                    </Form.Item>
                  </Col>
                    {/* Recurring Checkbox */}
                  <Col span={3} style={{ display: 'flex', alignItems: 'center', height: inputHeight }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'isRecurring']}
                      valuePropName="checked"
                      style={{ marginBottom: 0 }}
                    >
                      <Checkbox />
                    </Form.Item>
                  </Col>
                   {/* Action Buttons */}
                  <Col span={3} style={{ display: 'flex', alignItems: 'center', height: inputHeight }}>
                    <Space>
                      {fields.length > 1 ? ( // Only show remove if more than 1 item
                        <Button
                          icon={<IconMinus size={16} />}
                          type="text" danger
                          onClick={() => remove(name)}
                          style={{ padding: '4px 8px'}} // Adjust padding
                        />
                      ) : null}
                       {/* Show Plus only on the last item */}
                       {index === fields.length - 1 && (
                         <Button
                           icon={<IconPlus size={16} />}
                           type="dashed"
                           onClick={() => add({dueDate: null})} // Add new row with default null date
                           style={{ padding: '4px 8px'}} // Adjust padding
                         />
                       )}
                    </Space>
                  </Col>
                </Row>
              ))}
              {/* Button to add a new row if needed separately */}
              {/* <Form.Item>
                 <Button type="dashed" onClick={() => add({dueDate: null})} block icon={<IconPlus />}>
                   Add Bill Row
                 </Button>
               </Form.Item> */}
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}