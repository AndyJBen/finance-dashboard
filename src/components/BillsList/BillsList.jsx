// src/components/BillsList/BillsList.jsx
// COMPLETE FILE CODE
// Highlight: Removed Modal.confirm for direct delete on click.

import React, { useState, useContext } from 'react';
import { Table, Button, Modal, message, Tag, Dropdown, Menu } from 'antd'; // Keep Modal import for Edit
import {
  IconEdit,
  IconTrash,
  IconDotsVertical,
} from '@tabler/icons-react';
import PropTypes from 'prop-types';
import { FinanceContext } from '../../contexts/FinanceContext';
import EditBillModal from './EditBillModal';

const BillsList = ({ loading: propLoading }) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  // Use context for data and actions
  const { bills, loading: contextLoading, deleteBill, updateBill, addBill } = useContext(FinanceContext);

  // Use context loading state primarily, but allow prop override if needed
  const isLoading = propLoading !== undefined ? propLoading : contextLoading;

  // Function to handle opening the edit modal
  const handleEdit = (bill) => {
    setEditingBill(bill);
    setIsEditModalVisible(true);
  };

  // Function to handle closing the edit modal
  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setEditingBill(null);
  };

  // Function to handle submission from the modal (calls context updateBill/addBill)
  const handleModalSubmit = async (values) => {
      let result;
      if (editingBill) {
          result = await updateBill(editingBill, values); // Use context updateBill
      } else {
          result = await addBill(values); // Use context addBill
      }
      if (result) { // Context functions should return truthy on success
          setIsEditModalVisible(false);
          setEditingBill(null);
          // Context handles refresh and success messages
      }
      // Error messages handled within context functions
  };

  // --- START: handleDelete (No Modal.confirm) ---
  // Function to handle deleting a bill directly using context
  const handleDelete = async (bill) => {
    console.log(`[BillsList] Delete button clicked directly for bill ID: ${bill.id}, Name: ${bill.name}`);
    // Directly call the context delete function without confirmation
    try {
       const success = await deleteBill(bill.id); // Await the context function
       if (success) {
           console.log(`[BillsList] Context reported success deleting bill ${bill.id}`);
           // Success message handled by context
       } else {
           console.error(`[BillsList] Context reported failure deleting bill ${bill.id}`);
           // Error message handled by context
       }
    } catch (error) {
      // Catch unexpected errors from the await deleteBill call itself
      console.error('[BillsList] Unexpected error calling context deleteBill:', error);
      message.error(`An unexpected error occurred: ${error.message || 'Unknown error'}`);
    }
  };
  // --- END: handleDelete ---

  // Define table columns (ensure dataIndex matches context: 'dueDate', 'isPaid', 'isRecurring')
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate', // Use camelCase from context/API
      key: 'dueDate',
      sorter: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A', // Format date
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => (a.category || '').localeCompare(b.category || ''),
      // Recalculate filters based on context bills
      filters: [...new Set(bills.map(bill => bill.category).filter(Boolean))].map(category => ({ text: category, value: category })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Status',
      dataIndex: 'isPaid', // Use camelCase from context/API
      key: 'isPaid',
      render: (isPaid) => (
        <Tag color={isPaid ? 'green' : 'volcano'}>
          {isPaid ? 'Paid' : 'Unpaid'}
        </Tag>
      ),
      filters: [
        { text: 'Paid', value: true },
        { text: 'Unpaid', value: false },
      ],
      onFilter: (value, record) => record.isPaid === value,
    },
    {
      title: 'Recurring',
      dataIndex: 'isRecurring', // Use camelCase from context/API
      key: 'isRecurring',
      render: (isRecurring) => (isRecurring ? 'Yes' : 'No'),
      filters: [
        { text: 'Yes', value: true },
        { text: 'No', value: false },
      ],
      onFilter: (value, record) => record.isRecurring === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => {
        // Define menu items using Ant Design v5 'items' structure
        const menuItems = [
            {
                key: 'edit',
                icon: <IconEdit size={16} />,
                label: 'Edit',
                onClick: () => handleEdit(record) // Call handleEdit on click
            },
            {
                key: 'delete',
                icon: <IconTrash size={16} />,
                label: 'Delete', // Label indicates no confirmation
                danger: true,
                onClick: () => handleDelete(record) // Directly call handleDelete
            }
        ];

        return (
          // Use Dropdown v5 'menu' prop with items
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<IconDotsVertical size={18} />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={bills} // Use bills directly from context
        rowKey="id"
        loading={isLoading} // Use combined loading state
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
        style={{ marginTop: '20px' }}
      />

      {/* Edit Bill Modal */}
      {editingBill && (
        <EditBillModal
          // Use 'open' prop for AntD v5 Modals
          open={isEditModalVisible}
          onCancel={handleCancelEdit}
          onSubmit={handleModalSubmit} // Use the consolidated submit handler
          initialData={editingBill}
        />
      )}
    </>
  );
};

// PropTypes for type checking
BillsList.propTypes = {
  loading: PropTypes.bool,
};

export default BillsList;
