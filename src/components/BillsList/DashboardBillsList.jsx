// src/components/BillsList/DashboardBillsList.jsx
import React, { useState, useContext } from 'react';
import { Table, Button, Modal, message, Tag, Dropdown, Space } from 'antd';
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
  title = 'Bills Overview'
}) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const {
    bills: contextBills,
    loading: contextLoading,
    deleteBill,
    updateBill,
    updateBillWithFuture,
    addBill
  } = useContext(FinanceContext);

  const billsToDisplay = propBills || contextBills;
  const isLoading = propLoading !== undefined ? propLoading : contextLoading;

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setIsEditModalVisible(true);
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setEditingBill(null);
  };

  const handleModalSubmit = async (values) => {
    const { applyToFuture = {}, ...billValues } = values;
    let result;
    if (editingBill) {
      const fields = Object.entries(applyToFuture).filter(([,v]) => v).map(([k]) => k);
      if (fields.length > 0) {
        result = await updateBillWithFuture(editingBill, billValues, fields);
      } else {
        result = await updateBill(editingBill, billValues);
      }
    } else {
      result = await addBill(billValues);
    }
    if (result) {
      setIsEditModalVisible(false);
      setEditingBill(null);
    }
  };

  const handleDelete = async (bill) => {
    if (!bill || typeof bill.id === 'undefined') {
      console.error('[DashboardBillsList] Invalid bill for deletion:', bill);
      message.error('Cannot delete bill: Invalid data.');
      return;
    }
    try {
      const success = await deleteBill(bill.id);
      if (!success) {
        console.error(`[DashboardBillsList] Failed to delete bill ${bill.id}`);
      }
    } catch (error) {
      console.error('[DashboardBillsList] Error deleting bill:', error);
      message.error(`Error deleting bill: ${error.message || 'Unknown'}`);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'isPaid',
      key: 'isPaid',
      render: (paid) => (
        <Tag color={paid ? 'green' : 'volcano'}>
          {paid ? 'Paid' : 'Unpaid'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => {
        const items = [
          {
            key: 'edit',
            icon: <IconEdit size={16} />,
            label: 'Edit',
            onClick: (e) => {
              if (e?.domEvent) e.domEvent.stopPropagation();
              handleEdit(record);
            }
          },
          {
            key: 'delete',
            icon: <IconTrash size={16} />,
            label: 'Delete',
            danger: true,
            onClick: (e) => {
              if (e?.domEvent) e.domEvent.stopPropagation();
              handleDelete(record);
            }
          }
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button
              type="text"
              icon={<IconDotsVertical size={18} />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        );
      }
    }
  ];

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}
      >
        <h3>{title}</h3>
        {onAddBill && (
          <Button
            className="hide-on-mobile"
            type="primary"
            icon={<IconPlus size={16} />}
            onClick={() => {
              setEditingBill(null);
              setIsEditModalVisible(true);
            }}
          >
            Add Bill
          </Button>
        )}
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
      <EditBillModal
        open={isEditModalVisible}
        onCancel={handleCancelEdit}
        onSubmit={handleModalSubmit}
        initialData={editingBill}
      />
    </>
  );
};

DashboardBillsList.propTypes = {
  bills: PropTypes.array,
  loading: PropTypes.bool,
  onAddBill: PropTypes.func,
  title: PropTypes.string
};

export default DashboardBillsList;
