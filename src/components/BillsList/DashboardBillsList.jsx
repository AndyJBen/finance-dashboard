// src/components/BillsList/DashboardBillsList.jsx
// COMPLETE FILE CODE
// Highlight: Added e.domEvent.stopPropagation() inside Menu Item onClick.

import React, { useState, useContext } from 'react';
import { Table, Button, Modal, message, Tag, Dropdown, Menu, Space } from 'antd';
import {
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconPlus
} from '@tabler/icons-react';
import PropTypes from 'prop-types';
import { FinanceContext } from '../../contexts/FinanceContext';
import EditBillModal from './EditBillModal';

const DashboardBillsList = ({
  bills: propBills,
  loading: propLoading,
  onAddBill,
  title = "Bills Overview"
}) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const { bills: contextBills, loading: contextLoading, deleteBill, updateBill, addBill } = useContext(FinanceContext);

  const billsToDisplay = propBills || contextBills;
  const isLoading = propLoading !== undefined ? propLoading : contextLoading;

  // --- Modal Handlers ---
  const handleEdit = (bill) => {
    setEditingBill(bill);
    setIsEditModalVisible(true);
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setEditingBill(null);
  };

  const handleModalSubmit = async (values) => {
      let result;
      if (editingBill) {
          result = await updateBill(editingBill, values);
      } else {
           result = await addBill(values);
      }
      if (result) {
          setIsEditModalVisible(false);
          setEditingBill(null);
      }
  };

  // --- Delete Handler (No Modal.confirm) ---
  const handleDelete = async (bill) => {
    if (!bill || typeof bill.id === 'undefined') {
        console.error('[DashboardBillsList] Invalid bill object passed to handleDelete:', bill);
        message.error('Cannot delete bill: Invalid data.');
        return;
    }
    console.log(`[DashboardBillsList] handleDelete function called for bill ID: ${bill.id}, Name: ${bill.name}`);
    try {
       const success = await deleteBill(bill.id);
       if (success) {
           console.log(`[DashboardBillsList] Context reported success deleting bill ${bill.id}`);
       } else {
           console.error(`[DashboardBillsList] Context reported failure deleting bill ${bill.id}`);
       }
    } catch (error) {
      console.error('[DashboardBillsList] Unexpected error calling context deleteBill:', error);
      message.error(`An unexpected error occurred during deletion: ${error.message || 'Unknown error'}`);
    }
  };
  // --- End Delete Handler ---

  // --- Table Column Definitions ---
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (amount) => `$${parseFloat(amount).toFixed(2)}`, },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A', },
    { title: 'Status', dataIndex: 'isPaid', key: 'isPaid', render: (isPaid) => (<Tag color={isPaid ? 'green' : 'volcano'}>{isPaid ? 'Paid' : 'Unpaid'}</Tag>), },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      // --- START: Actions Column Render with Dropdown ---
      render: (text, record) => {
        // console.log(`[DashboardBillsList] Rendering actions for record ID: ${record?.id}`);

        // Define menu items using Ant Design v5 'items' structure
        const menuItems = [
            {
                key: 'edit',
                icon: <IconEdit size={16} />,
                label: 'Edit',
                onClick: (e) => {
                    // Highlight: Explicitly stop propagation on the DOM event
                    if (e && e.domEvent) {
                        e.domEvent.stopPropagation();
                    }
                    console.log(`[DashboardBillsList] Edit Menu Item onClick triggered for ID: ${record?.id}`);
                    handleEdit(record);
                }
            },
            {
                key: 'delete',
                icon: <IconTrash size={16} />,
                label: 'Delete',
                danger: true,
                onClick: (e) => {
                    // Highlight: Explicitly stop propagation on the DOM event
                    if (e && e.domEvent) {
                        e.domEvent.stopPropagation();
                    }
                    console.log(`[DashboardBillsList] Delete Menu Item onClick triggered for ID: ${record?.id}`);
                    handleDelete(record);
                }
            }
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            {/* Stop propagation on the trigger button as well */}
            <Button type="text" icon={<IconDotsVertical size={18} />} style={{ visibility: 'visible' }} onClick={e => e.stopPropagation()} />
          </Dropdown>
        );
      },
      // --- END: Actions Column Render with Dropdown ---
    },
  ];
  // --- End Table Column Definitions ---

  // --- Component Render ---
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>{title}</h3>
        {onAddBill && ( <Button type="primary" icon={<IconPlus size={16} />} onClick={() => { setEditingBill(null); setIsEditModalVisible(true); } }> Add Bill </Button> )}
      </div>
      <Table
        columns={columns}
        dataSource={billsToDisplay}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        size="small"
        scroll={{ x: 'max-content' }}
      />
      <EditBillModal open={isEditModalVisible} onCancel={handleCancelEdit} onSubmit={handleModalSubmit} initialData={editingBill} />
    </>
  );
  // --- End Component Render ---
};

DashboardBillsList.propTypes = {
  bills: PropTypes.array,
  loading: PropTypes.bool,
  onAddBill: PropTypes.func,
  title: PropTypes.string,
};

export default DashboardBillsList;
