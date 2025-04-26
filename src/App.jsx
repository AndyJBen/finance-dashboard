// src/components/FinancialSummary/CombinedBillsOverview/CombinedBillsOverview.jsx
// Added onExpansionChange prop and useEffect to notify parent

import React, { useState, useContext, useMemo, useEffect } from 'react'; // Added useEffect
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
    IconPlaylistAdd,
    IconEye,
    IconEyeOff
} from '@tabler/icons-react';
import { FinanceContext } from '../../../contexts/FinanceContext';
import EditBillModal from '../../BillsList/EditBillModal';
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

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBeforePlugin);

const { Text } = Typography;

// --- Helper Functions (Remain the same) ---
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

const formatDueDate = (dueDate) => {
    if (!dueDate || !dayjs(dueDate).isValid()) { return <span style={{ color: 'var(--neutral-400)' }}>N/A</span>; }
    const due = dayjs(dueDate).startOf('day');
    const today = dayjs().startOf('day');
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
// Added onExpansionChange prop
const CombinedBillsOverview = ({ style, onExpansionChange }) => {
    // Context and State
    const {
        loading, error, deleteBill, updateBill, addBill,
        displayedMonth, goToPreviousMonth, goToNextMonth, bills,
    } = useContext(FinanceContext);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isMultiModalVisible, setMultiModalVisible] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isTableCollapsed, setIsTableCollapsed] = useState(false); // Default to expanded
    const [showPaidBills, setShowPaidBills] = useState(false);

    // --- NEW: useEffect to notify parent about expansion state changes ---
    useEffect(() => {
        // Call the callback prop with the current *expanded* state (!isTableCollapsed)
        if (onExpansionChange) {
            onExpansionChange(!isTableCollapsed);
        }
    }, [isTableCollapsed, onExpansionChange]); // Rerun when isTableCollapsed or the callback function changes
    // --- END NEW useEffect ---

    // --- Derived State (Calculations remain the same) ---
    const validBills = Array.isArray(bills) ? bills : [];
    const startOfDisplayedMonth = displayedMonth.startOf('month');
    const endOfDisplayedMonth = displayedMonth.endOf('month');

    const billsDueInDisplayedMonth = useMemo(() => {
        return validBills.filter(bill => {
            const dueDate = dayjs(bill.dueDate);
            return dueDate.isValid() && dueDate.isBetween(startOfDisplayedMonth, endOfDisplayedMonth, 'day', '[]');
        });
    }, [validBills, displayedMonth, startOfDisplayedMonth, endOfDisplayedMonth]);

    const filteredBillsByPaidStatus = useMemo(() => {
        return showPaidBills
            ? billsDueInDisplayedMonth
            : billsDueInDisplayedMonth.filter(bill => !bill.isPaid);
    }, [billsDueInDisplayedMonth, showPaidBills]);

    const mainTableDataSourceFiltered = useMemo(() => {
        return filteredBillsByPaidStatus.filter(bill =>
            selectedCategory === 'All' || bill.category === selectedCategory
        );
    }, [filteredBillsByPaidStatus, selectedCategory]);

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
    const unpaidBillsInDisplayedMonth = totalBillsInDisplayedMonth - paidBillsInDisplayedMonth;
    const totalExpensesInDisplayedMonth = totalAmountPaidInDisplayedMonth;
    const totalAmountDueInDisplayedMonth = useMemo(() => {
        return billsDueInDisplayedMonth.reduce((sum, bill) => (!bill.isPaid && typeof bill.amount === 'number' ? sum + bill.amount : sum), 0);
    }, [billsDueInDisplayedMonth]);

    const tableDataSource = isTableCollapsed
        ? []
        : mainTableDataSourceFiltered;

    // --- Event Handlers (Remain the same) ---
     const handleAddSingle = () => {
         setEditingBill(null);
         setIsModalVisible(true);
     };
     const handleEdit = (record) => {
         setEditingBill(record);
         setIsModalVisible(true);
     };
     const handleModalSubmit = async (values) => {
         let result = editingBill ? await updateBill(editingBill.id, values) : await addBill(values); // Pass ID for update
         if (result) { setIsModalVisible(false); setEditingBill(null); }
     };
     const handleTogglePaid = async (record) => { await updateBill(record.id, { isPaid: !record.isPaid }); }; // Pass ID for update
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
     const togglePaidBillsVisibility = () => {
         setShowPaidBills(prev => !prev);
     };
     // --- End Event Handlers ---


    // --- Table Columns Definition (Slight modification to collapse button onClick) ---
    const columns = [
        { title: 'Status', dataIndex: 'isPaid', key: 'statusCheckbox', width: 32, align: 'center', render: (isPaid, record) => (<Tooltip title={isPaid ? "Mark as Unpaid" : "Mark as Paid"}><Checkbox className={`status-checkbox small-checkbox ${isPaid ? 'checked' : ''}`} checked={isPaid} onChange={() => handleTogglePaid(record)} /></Tooltip>) },
        { title: 'Name', dataIndex: 'name', key: 'name', width: 130, align: 'left', sorter: (a, b) => a.name.localeCompare(b.name), render: (text) => (<div style={{ textAlign: 'left' }}><Text strong>{text}</Text></div>) },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 80, align: 'left', sorter: (a, b) => a.amount - b.amount, render: (amount) => <Text strong>{`$${Number(amount).toFixed(2)}`}</Text> },
        { title: 'Category', dataIndex: 'category', key: 'category', width: 80, align: 'left', render: (category) => category ? (<div style={{ textAlign: 'left' }}><Tag icon={<span style={{ marginRight: '6px', display: 'inline-flex', alignItems: 'center' }}>{getCategoryIcon(category)}</span>} color={getCategoryColor(category)}>{category}</Tag></div>) : null },
        { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', width: 80, align: 'left', sorter: (a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf(), render: (date) => date ? dayjs(date).format('MM/DD/YYYY') : 'N/A' },
        {
            title: 'Due In', key: 'dueIn', dataIndex: 'dueDate', width: 60, align: 'left',
            sorter: (a, b) => {
                if (a.isPaid && !b.isPaid) return 1; if (!a.isPaid && b.isPaid) return -1;
                const dateA = dayjs(a.dueDate).isValid() ? dayjs(a.dueDate).valueOf() : Infinity;
                const dateB = dayjs(b.dueDate).isValid() ? dayjs(b.dueDate).valueOf() : Infinity;
                return dateA - dateB;
            },
            defaultSortOrder: 'ascend',
            render: (dueDate, record) => {
                if (record.isPaid) { return <span style={{ color: 'var(--neutral-400)' }}>-</span>; }
                if (!dueDate || !dayjs(dueDate).isValid()) { return <span style={{ color: 'var(--neutral-400)' }}>N/A</span>; }
                const due = dayjs(dueDate).startOf('day');
                const today = dayjs().startOf('day');
                if (due.isBefore(today)) {
                    if (record.category === 'Bill Prep') { return <span style={{ color: 'var(--neutral-400)' }}>-</span>; }
                    else { return <span style={{ color: 'var(--danger-500)' }}>Past Due</span>; }
                }
                if (due.isSame(today, 'day')) { return <span style={{ color: 'var(--warning-700)' }}>Today</span>; }
                return formatDueDate(dueDate);
            },
        },
        {
            // --- START: Collapse/Expand Button ---
            // The onClick now simply toggles the internal state. The useEffect handles notifying the parent.
            title: (<Tooltip title={isTableCollapsed ? "Expand List" : "Collapse List"}><Button type="link" size="small" icon={isTableCollapsed ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />} onClick={() => setIsTableCollapsed(!isTableCollapsed)} style={{ padding: '0 4px' }} /></Tooltip>),
            // --- END: Collapse/Expand Button ---
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


    // --- Button Styles and Menu Items (Remain the same) ---
    const selectedAllButtonStyle = { fontWeight: 600, padding: '0 10px', height: '28px', borderColor: 'var(--primary-500)', color: 'var(--primary-600)' };
    const defaultAllButtonStyle = { fontWeight: 500, padding: '0 10px', height: '28px' };
    const addBillMenuItems = [ { key: 'add-multiple', label: 'Add Multiple Bills', icon: <IconPlaylistAdd size={16} /> } ];
    // --- End Button Styles ---


    // --- Render Logic (Remains the same) ---
    if (error && !loading) { return (<Card style={style}><Alert message="Error Loading Bills Data" description={error.message || 'Unknown error'} type="error" showIcon closable /></Card>); }

    const unpaidVisibleCount = billsDueInDisplayedMonth.filter(bill =>
        !bill.isPaid && (selectedCategory === 'All' || bill.category === selectedCategory)
    ).length;

    const paidVisibleCount = billsDueInDisplayedMonth.filter(bill =>
        bill.isPaid && (selectedCategory === 'All' || bill.category === selectedCategory)
    ).length;

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
                    getCategoryIcon={getCategoryIcon}
                    selectedAllButtonStyle={selectedAllButtonStyle}
                    defaultAllButtonStyle={defaultAllButtonStyle}
                />

                {/* Show/Hide Paid Bills Toggle Button */}
                {!isTableCollapsed && billsDueInDisplayedMonth.length > 0 && paidVisibleCount > 0 && (
                    <div style={{
                        textAlign: 'center',
                        borderTop: '1px solid var(--neutral-200)',
                        paddingTop: 'var(--space-12)'
                    }}>
                        <Button
                            type="text"
                            icon={showPaidBills ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                            onClick={togglePaidBillsVisibility}
                            style={{ color: 'var(--neutral-600)' }}
                        >
                            {showPaidBills ?
                                `Hide Paid Bills` :
                                `Show All Bills`
                            }
                        </Button>
                    </div>
                )}

            </Spin>

            {/* Edit/Add Bill Modal (Single Bill) */}
            {isModalVisible && (
                 <EditBillModal
                    open={isModalVisible}
                    onCancel={() => { setIsModalVisible(false); setEditingBill(null); }}
                    onSubmit={handleModalSubmit}
                    initialData={editingBill}
                 />
            )}
        </Card>

        {/* Multi Bill Modal */}
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
