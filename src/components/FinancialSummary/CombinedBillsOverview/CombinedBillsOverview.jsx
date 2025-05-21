// src/components/FinancialSummary/CombinedBillsOverview/CombinedBillsOverview.jsx
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
    IconPlaylistAdd,
    IconEye, // New icon for showing all bills
    IconEyeOff  // New icon for hiding paid bills
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

// Updated formatDueDate to handle past due logic *outside* this function
// It now focuses purely on formatting future dates relative to today.
const formatDueDate = (dueDate) => {
    if (!dueDate || !dayjs(dueDate).isValid()) { return <span style={{ color: 'var(--neutral-400)' }}>N/A</span>; }
    const due = dayjs(dueDate).startOf('day');
    const today = dayjs().startOf('day');
    // This function now assumes the date is NOT past due or today,
    // as those checks are handled in the column render function.
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
    const [isTableCollapsed, setIsTableCollapsed] = useState(false); // State for collapse/expand
    const [showPaidBills, setShowPaidBills] = useState(false); // New state for showing/hiding paid bills
    const [fadingBillId, setFadingBillId] = useState(null); // Row fade state
    const defaultPageSize = 10; // Kept for reference, but not used for slicing when collapsed

    // --- Derived State (Modified to filter out paid bills by default) ---
    const validBills = Array.isArray(bills) ? bills : [];
    const startOfDisplayedMonth = displayedMonth.startOf('month');
    const endOfDisplayedMonth = displayedMonth.endOf('month');

    const billsDueInDisplayedMonth = useMemo(() => {
        return validBills.filter(bill => {
            const dueDate = dayjs(bill.dueDate);
            return dueDate.isValid() && dueDate.isBetween(startOfDisplayedMonth, endOfDisplayedMonth, 'day', '[]');
        });
    }, [validBills, displayedMonth, startOfDisplayedMonth, endOfDisplayedMonth]);

    // Filter bills by paid status and category
    const filteredBillsByPaidStatus = useMemo(() => {
        // If showPaidBills is true, return all bills, otherwise only return unpaid bills
        return showPaidBills 
            ? billsDueInDisplayedMonth 
            : billsDueInDisplayedMonth.filter(bill => !bill.isPaid);
    }, [billsDueInDisplayedMonth, showPaidBills]);

    // Then apply the category filter
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

    // --- MODIFIED LOGIC FOR COLLAPSE & BILL VISIBILITY ---
    const tableDataSource = isTableCollapsed
        ? [] // Provide an empty array when collapsed to hide all rows
        : mainTableDataSourceFiltered; // Show filtered bills when not collapsed
    // --- END MODIFIED LOGIC ---

    // --- Event Handlers (Remain in parent) ---
     const handleAddBill = () => {
         setMultiModalVisible(true);
     };
     const handleEdit = (record) => {
         setEditingBill(record);
         setIsModalVisible(true);
     };
     const handleModalSubmit = async (values) => {
         let result = editingBill ? await updateBill(editingBill, values) : await addBill(values);
         if (result) { setIsModalVisible(false); setEditingBill(null); }
     };
    const handleTogglePaid = async (record) => {
         const markingAsPaid = !record.isPaid;
         if (markingAsPaid) {
             setFadingBillId(record.id);
             await new Promise(res => setTimeout(res, 300));
         }
         await updateBill(record, { isPaid: markingAsPaid });
         if (markingAsPaid) {
             setFadingBillId(null);
         }
     };
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
        const handleMenuClick = () => {
            handleOpenMultiModal();
        };

     // New handler for toggling paid bills visibility
    const togglePaidBillsVisibility = () => {
        setShowPaidBills(prev => !prev);
    };
    const rowClassName = (record) => (record.id === fadingBillId ? 'bill-row-fade-out' : '');
     // --- End Event Handlers ---


    // --- Table Columns Definition (Remains in parent) ---
    const columns = [
        { title: '', dataIndex: 'isPaid', key: 'statusCheckbox', width: 32, align: 'center', render: (isPaid, record) => (<Tooltip title={isPaid ? "Mark as Unpaid" : "Mark as Paid"}><Checkbox className={`status-checkbox small-checkbox ${isPaid ? 'checked' : ''}`} checked={isPaid} onChange={() => handleTogglePaid(record)} /></Tooltip>) },
        { title: 'Name', dataIndex: 'name', key: 'name', width: 130, align: 'left', sorter: (a, b) => a.name.localeCompare(b.name), render: (text) => (<div style={{ textAlign: 'left' }}><Text strong>{text}</Text></div>) },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 80, align: 'left', sorter: (a, b) => a.amount - b.amount, render: (amount) => <Text strong>{`$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</Text> },
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
            // --- START: Updated Render Logic for 'Due In' ---
            render: (dueDate, record) => {
                // If paid, always show dash
                if (record.isPaid) {
                    return <span style={{ color: 'var(--neutral-400)' }}>-</span>;
                }

                // Check if dueDate is valid
                if (!dueDate || !dayjs(dueDate).isValid()) {
                    return <span style={{ color: 'var(--neutral-400)' }}>N/A</span>;
                }

                const due = dayjs(dueDate).startOf('day');
                const today = dayjs().startOf('day');

                // Check if past due
                if (due.isBefore(today)) {
                    // Special case for 'Bill Prep' category when past due
                    if (record.category === 'Bill Prep') {
                        return <span style={{ color: 'var(--neutral-400)' }}>-</span>; // Show dash instead of 'Past Due'
                    } else {
                        return <span style={{ color: 'var(--danger-500)' }}>Past Due</span>; // Default past due text
                    }
                }

                // Check if due today
                if (due.isSame(today, 'day')) {
                    return <span style={{ color: 'var(--warning-700)' }}>Today</span>;
                }

                // Otherwise, calculate relative time using the helper function
                return formatDueDate(dueDate); // Pass only dueDate
            },
            // --- END: Updated Render Logic for 'Due In' ---
        },
        {
            // --- START: Collapse/Expand Button ---
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


    // --- Button Styles and Menu Items (Remain in parent) ---
    const selectedAllButtonStyle = { fontWeight: 600, padding: '0 10px', height: '28px', borderColor: 'var(--primary-500)', color: 'var(--primary-600)' };
    const defaultAllButtonStyle = { fontWeight: 500, padding: '0 10px', height: '28px' };
    // --- End Button Styles ---


    // --- Render Logic ---
    if (error && !loading) { return (<Card style={style}><Alert message="Error Loading Bills Data" description={error.message || 'Unknown error'} type="error" showIcon closable /></Card>); }

    // Calculate the number of unpaid and paid bills with the current category filter applied
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
                    tableDataSource={tableDataSource} // Pass the potentially empty dataSource
                    isTableCollapsed={isTableCollapsed} // Pass collapse state down
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    handleAddBill={handleAddBill}
                    handleMenuClick={handleMenuClick}
                    getCategoryIcon={getCategoryIcon} // Pass helper
                    selectedAllButtonStyle={selectedAllButtonStyle}
                    defaultAllButtonStyle={defaultAllButtonStyle}
                    rowClassName={rowClassName}
                />

                {/* Show/Hide Paid Bills Toggle Button - Only displayed when table is not collapsed */}
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