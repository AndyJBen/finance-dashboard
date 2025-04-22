// src/components/FinancialSummary/CombinedBillsOverview/CombinedBillsOverview.jsx
// Fixed import path for FinanceContext after moving the file.

import React, { useState, useContext, useMemo, useEffect } from 'react';
import {
    Table, Button, Space, Spin, Alert, Tooltip, Checkbox, Tag, Card,
    Progress, Typography, Row, Col, Statistic, Divider, message, Modal,
    List,
    Dropdown,
    Menu
} from 'antd';
import {
    IconCalendarFilled, IconEdit, IconTrash, IconPlus, IconChevronLeft,
    IconChevronRight, IconHome, IconBolt, IconWifi,
    IconCreditCard, IconCar, IconShoppingCart, IconHelp, IconApps,
    IconCalendar, IconCurrencyDollar, IconCircleCheck, IconClock, IconPhone,
    IconCertificate, IconMedicineSyrup, IconCalendarTime,
    IconX, IconUser,
    IconDotsVertical,
    IconChevronDown,
    IconChevronUp,
    IconPlaylistAdd
} from '@tabler/icons-react';
// Corrected the relative path for FinanceContext (up 3 levels)
import { FinanceContext } from '../../../contexts/FinanceContext';
// Import EditBillModal from its original location
import EditBillModal from '../../BillsList/EditBillModal';
// Import components from the CURRENT directory
import MultiBillModal from './MultiBillModal';
import MonthlyProgressSummary from './MonthlyProgressSummary';
import BillsListSection from './BillsListSection';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBeforePlugin from 'dayjs/plugin/isSameOrBefore';

// Extend dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBeforePlugin);

// Use Typography components directly
const { Text } = Typography;

// --- Helper Functions (Kept here as they are used in column definitions) ---
const getCategoryIcon = (category) => {
    const lowerCategory = category?.toLowerCase() || '';
    if (lowerCategory.includes('rent') || lowerCategory.includes('mortgage')) return <IconHome size={16} />;
    if (lowerCategory.includes('electric') || lowerCategory.includes('utilit')) return <IconBolt size={16} />;
    if (lowerCategory.includes('card')) return <IconCreditCard size={16} />;
    if (lowerCategory.includes('auto') || lowerCategory.includes('car')) return <IconCar size={16} />;
    if (lowerCategory.includes('grocery')) return <IconShoppingCart size={16} />;
    if (lowerCategory.includes('subscription')) return <IconCalendar size={16} />;
    if (lowerCategory.includes('loan')) return <IconCurrencyDollar size={16} />;
    if (lowerCategory.includes('insurance')) return <IconCertificate size={16} />;
    if (lowerCategory.includes('medical')) return <IconMedicineSyrup size={16} />;
    if (lowerCategory.includes('personal care')) return <IconUser size={16} />;
    if (lowerCategory.includes('bill prep')) return <IconCalendarTime size={16} />;
    return <IconHelp size={16} />;
};
const formatDueDate = (dueDate, displayedMonth) => {
    if (!dueDate || !dayjs(dueDate).isValid()) { return <span style={{ color: 'var(--neutral-400)' }}>N/A</span>; }
    const due = dayjs(dueDate).startOf('day');
    const today = dayjs().startOf('day');
    if (due.isBefore(today)) { return <span style={{ color: 'var(--danger-500)' }}>Past Due</span>; }
    if (due.isSame(today, 'day')) { return <span style={{ color: 'var(--warning-700)' }}>Today</span>; }
    const diffDaysFromToday = due.diff(today, 'day');
    let resultText = '';
    if (diffDaysFromToday <= 10) { resultText = `${diffDaysFromToday}d`; }
    else {
        const diffWeeks = Math.ceil(diffDaysFromToday / 7);
        if (diffWeeks <= 6) { resultText = `${diffWeeks}w`; }
        else { const diffMonths = Math.ceil(diffDaysFromToday / 30.44); resultText = `${diffMonths}m`; }
    }
    return resultText;
};
const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
        case 'utilities': return 'blue'; case 'rent': return 'purple'; case 'mortgage': return 'volcano';
        case 'groceries': return 'green'; case 'subscription': return 'cyan'; case 'credit card': return 'red';
        case 'loan': return 'gold'; case 'insurance': return 'magenta';
        case 'medical': return 'red'; case 'personal care': return 'lime'; case 'bill prep': return 'geekblue';
        case 'auto': return 'orange';
        default: return 'default';
    }
};
// --- End Helper Functions ---


// --- Main Refactored Component ---
const CombinedBillsOverview = ({ style }) => {
    // Context and State (Remains the same)
    const {
        loading, error, deleteBill, updateBill, addBill,
        displayedMonth, goToPreviousMonth, goToNextMonth, bills,
    } = useContext(FinanceContext);
    const [isModalVisible, setIsModalVisible] = useState(false); // For EditBillModal
    const [isMultiModalVisible, setMultiModalVisible] = useState(false); // For MultiBillModal
    const [editingBill, setEditingBill] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isTableCollapsed, setIsTableCollapsed] = useState(false);
    const defaultPageSize = 10;

    // --- Derived State (Remains the same) ---
    const validBills = Array.isArray(bills) ? bills : [];
    const startOfDisplayedMonth = displayedMonth.startOf('month');
    const endOfDisplayedMonth = displayedMonth.endOf('month');

    const billsDueInDisplayedMonth = useMemo(() => {
        return validBills.filter(bill => {
            const dueDate = dayjs(bill.dueDate);
            return dueDate.isValid() && dueDate.isBetween(startOfDisplayedMonth, endOfDisplayedMonth, 'day', '[]');
        });
    }, [validBills, displayedMonth, startOfDisplayedMonth, endOfDisplayedMonth]);

    const mainTableDataSourceFiltered = useMemo(() => {
        return billsDueInDisplayedMonth.filter(bill =>
            selectedCategory === 'All' || bill.category === selectedCategory
        );
    }, [billsDueInDisplayedMonth, selectedCategory]);

    const categories = useMemo(() => {
        return [...new Set(billsDueInDisplayedMonth.map(bill => bill.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    }, [billsDueInDisplayedMonth]);

    const totalAmountPaidInDisplayedMonth = useMemo(() => {
        return billsDueInDisplayedMonth.reduce((sum, bill) => (bill.isPaid && typeof bill.amount === 'number' ? sum + bill.amount : sum), 0);
    }, [billsDueInDisplayedMonth]);

    const totalAmountForAllBillsInDisplayedMonth = useMemo(() => {
        return billsDueInDisplayedMonth.reduce((sum, bill) => (typeof bill.amount === 'number' ? sum + bill.amount : sum), 0);
    }, [billsDueInDisplayedMonth]);

    const percentAmountPaid = totalAmountForAllBillsInDisplayedMonth > 0
        ? Math.round((totalAmountPaidInDisplayedMonth / totalAmountForAllBillsInDisplayedMonth) * 100)
        : 0;

    const totalBillsInDisplayedMonth = billsDueInDisplayedMonth.length;
    const paidBillsInDisplayedMonth = billsDueInDisplayedMonth.filter(b => b.isPaid).length;
    const totalExpensesInDisplayedMonth = totalAmountPaidInDisplayedMonth;
    const totalAmountDueInDisplayedMonth = useMemo(() => {
        return billsDueInDisplayedMonth.reduce((sum, bill) => (!bill.isPaid && typeof bill.amount === 'number' ? sum + bill.amount : sum), 0);
    }, [billsDueInDisplayedMonth]);

    // Data source for the table, considering collapse state
     const tableDataSource = isTableCollapsed
        ? mainTableDataSourceFiltered.slice(0, defaultPageSize)
        : mainTableDataSourceFiltered;
    // --- End Derived State ---


    // --- Event Handlers (Remain in parent) ---
     const handleAddSingle = () => {
         setEditingBill(null);
         setIsModalVisible(true);
     };
     const handleEdit = (record) => {
         setEditingBill(record);
         setIsModalVisible(true);
     };
     const handleModalSubmit = async (values) => {
         let result = editingBill ? await updateBill(editingBill, values) : await addBill(values);
         if (result) { setIsModalVisible(false); setEditingBill(null); }
     };
     const handleTogglePaid = async (record) => { await updateBill(record, { isPaid: !record.isPaid }); };
     const handleDelete = async (record) => {
         if (!record || typeof record.id === 'undefined') { message.error('Cannot delete bill: Invalid data.'); return; }
         try { await deleteBill(record.id); } catch (error) { message.error(`Deletion error: ${error.message || 'Unknown'}`); }
     };
     const handleOpenMultiModal = () => {
         setMultiModalVisible(true);
     };
     const handleCloseMultiModal = () => {
         setMultiModalVisible(false);
     };
     const handleMenuClick = (e) => {
        if (e.key === 'add-multiple') {
            handleOpenMultiModal();
        }
     };
     // --- End Event Handlers ---


    // --- Table Columns Definition (Remains in parent) ---
    const columns = [
        { title: 'Status', dataIndex: 'isPaid', key: 'statusCheckbox', width: 60, align: 'center', render: (isPaid, record) => (<Tooltip title={isPaid ? "Mark as Unpaid" : "Mark as Paid"}><Checkbox className={`status-checkbox small-checkbox ${isPaid ? 'checked' : ''}`} checked={isPaid} onChange={() => handleTogglePaid(record)} /></Tooltip>) },
        { title: 'Name', dataIndex: 'name', key: 'name', width: 130, align: 'left', sorter: (a, b) => a.name.localeCompare(b.name), render: (text) => (<div style={{ textAlign: 'left' }}><Text strong>{text}</Text></div>) },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 100, align: 'left', sorter: (a, b) => a.amount - b.amount, render: (amount) => <Text strong>{`$${Number(amount).toFixed(2)}`}</Text> },
        { title: 'Category', dataIndex: 'category', key: 'category', width: 100, align: 'left', render: (category) => category ? (<div style={{ textAlign: 'left' }}><Tag icon={<span style={{ marginRight: '6px', display: 'inline-flex', alignItems: 'center' }}>{getCategoryIcon(category)}</span>} color={getCategoryColor(category)}>{category}</Tag></div>) : null },
        { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', width: 100, align: 'left', sorter: (a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf(), render: (date) => date ? dayjs(date).format('MM/DD/YYYY') : 'N/A' },
        {
            title: 'Due In', key: 'dueIn', dataIndex: 'dueDate', width: 60, align: 'left',
            sorter: (a, b) => {
                if (a.isPaid && !b.isPaid) return 1; if (!a.isPaid && b.isPaid) return -1;
                const dateA = dayjs(a.dueDate).isValid() ? dayjs(a.dueDate).valueOf() : Infinity;
                const dateB = dayjs(b.dueDate).isValid() ? dayjs(b.dueDate).valueOf() : Infinity;
                return dateA - dateB;
            },
            defaultSortOrder: 'ascend',
            render: (dueDate, record) => record.isPaid ? <span style={{ color: 'var(--neutral-400)' }}>-</span> : formatDueDate(dueDate, displayedMonth),
        },
        {
            title: (<Tooltip title={isTableCollapsed ? "Expand List" : "Collapse List"}><Button type="link" size="small" icon={isTableCollapsed ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />} onClick={() => setIsTableCollapsed(!isTableCollapsed)} style={{ padding: '0 4px' }} /></Tooltip>),
            key: 'actions', fixed: 'right', width: 30, align: 'center',
            render: (_, record) => {
                const menuItems = [
                    { key: 'edit', icon: <IconEdit size={16} />, label: 'Edit', onClick: (e) => { if (e && e.domEvent) e.domEvent.stopPropagation(); handleEdit(record); } },
                    { key: 'delete', icon: <IconTrash size={16} />, label: 'Delete', danger: true, onClick: (e) => { if (e && e.domEvent) e.domEvent.stopPropagation(); handleDelete(record); } }
                ];
                return (<Dropdown menu={{items: menuItems}} trigger={['click']}><Button type="text" icon={<IconDotsVertical size={16} />} style={{ padding: '0 12px' }} onClick={e => e.stopPropagation()} /></Dropdown>);
            }
        },
    ];
    // --- End Table Columns ---


    // --- Button Styles and Menu Items (Remain in parent) ---
    const selectedAllButtonStyle = { fontWeight: 600, padding: '0 10px', height: '28px', borderColor: 'var(--primary-500)', color: 'var(--primary-600)' };
    const defaultAllButtonStyle = { fontWeight: 500, padding: '0 10px', height: '28px' };
    const addBillMenuItems = [ { key: 'add-multiple', label: 'Add Multiple Bills', icon: <IconPlaylistAdd size={16} /> } ];
    // --- End Button Styles ---


    // --- Render Logic ---
    if (error && !loading) { return (<Card style={style}><Alert message="Error Loading Bills Data" description={error.message || 'Unknown error'} type="error" showIcon closable /></Card>); }

    return (
     <> {/* Fragment to wrap Card and Modals */}
        <Card
            style={style}
            styles={{ body: { padding: 'var(--space-20)' } }}
        >
            <Spin spinning={loading} tip="Loading Bills...">

                {/* Render Monthly Progress Summary Component */}
                <MonthlyProgressSummary
                    loading={loading}
                    displayedMonth={displayedMonth}
                    goToPreviousMonth={goToPreviousMonth}
                    goToNextMonth={goToNextMonth}
                    totalBillsInDisplayedMonth={totalBillsInDisplayedMonth}
                    paidBillsInDisplayedMonth={paidBillsInDisplayedMonth}
                    totalAmountForAllBillsInDisplayedMonth={totalAmountForAllBillsInDisplayedMonth}
                    percentAmountPaid={percentAmountPaid}
                    totalExpensesInDisplayedMonth={totalExpensesInDisplayedMonth}
                    totalAmountDueInDisplayedMonth={totalAmountDueInDisplayedMonth}
                />

                <Divider style={{ margin: '0 0 var(--space-24) 0' }} />

                {/* Render Bills List Section Component */}
                <BillsListSection
                    loading={loading}
                    columns={columns}
                    tableDataSource={tableDataSource}
                    isTableCollapsed={isTableCollapsed}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    handleAddSingle={handleAddSingle}
                    handleMenuClick={handleMenuClick}
                    addBillMenuItems={addBillMenuItems}
                    getCategoryIcon={getCategoryIcon} // Pass helper
                    selectedAllButtonStyle={selectedAllButtonStyle}
                    defaultAllButtonStyle={defaultAllButtonStyle}
                />

            </Spin>

            {/* Edit/Add Bill Modal (Single Bill) - Remains in Parent */}
            {isModalVisible && (
                 <EditBillModal
                    open={isModalVisible}
                    onCancel={() => { setIsModalVisible(false); setEditingBill(null); }}
                    onSubmit={handleModalSubmit}
                    initialData={editingBill}
                 />
            )}
        </Card>

        {/* Multi Bill Modal - Remains in Parent */}
        {isMultiModalVisible && (
             <MultiBillModal
                open={isMultiModalVisible}
                onClose={handleCloseMultiModal}
             />
        )}
     </>
    );
};

export default CombinedBillsOverview;
