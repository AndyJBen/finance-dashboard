// src/components/FinancialSummary/CombinedBillsOverview/CombinedBillsOverview.jsx
import React, { useState, useContext, useMemo } from 'react';
import {
    Table, Button, Space, Spin, Alert, Tooltip, Checkbox, Tag, Card,
    Progress, Typography, Row, Col, Statistic, Divider, message, Modal,
    List,
    Dropdown,
    Menu,
    Grid
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
const { useBreakpoint } = Grid;

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
        loading, error, deleteBill, updateBill, updateBillWithFuture, addBill,
        displayedMonth, goToPreviousMonth, goToNextMonth, bills,
    } = useContext(FinanceContext);
    const [isModalVisible, setIsModalVisible] = useState(false); // For EditBillModal
    const [isMultiModalVisible, setMultiModalVisible] = useState(false); // For MultiBillModal
    const [editingBill, setEditingBill] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isTableCollapsed, setIsTableCollapsed] = useState(false); // State for collapse/expand
    const [showPaidBills, setShowPaidBills] = useState(false); // New state for showing/hiding paid bills
    const [fadingBillId, setFadingBillId] = useState(null); // Row fade state

    const screens = useBreakpoint();
    const isSmallScreen = screens.xs || screens.sm;

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

    const renderDueIn = (dueDate, record) => {
        if (record.isPaid) {
            return <span style={{ color: 'var(--neutral-400)' }}>-</span>;
        }
        if (!dueDate || !dayjs(dueDate).isValid()) {
            return <span style={{ color: 'var(--neutral-400)' }}>N/A</span>;
        }
        const due = dayjs(dueDate).startOf('day');
        const today = dayjs().startOf('day');
        if (due.isBefore(today)) {
            if (record.category === 'Bill Prep') {
                return <span style={{ color: 'var(--neutral-400)' }}>-</span>;
            }
            const diffDays = today.diff(due, 'day');
            let text = '';
            if (diffDays <= 30) {
                text = `${diffDays}d Past`;
            } else if (diffDays <= 365) {
                const weeks = Math.floor(diffDays / 7);
                text = `${weeks}w Past`;
            } else {
                const months = Math.floor(diffDays / 30);
                text = `${months}m Past`;
            }
            return <span style={{ color: 'var(--danger-500)' }}>{text}</span>;
        }
        if (due.isSame(today, 'day')) {
            return <span style={{ color: 'var(--warning-700)' }}>Today</span>;
        }
        const diffDays = due.diff(today, 'day');
        let resultText = '';
        if (diffDays <= 10) { 
            resultText = `Due in ${diffDays}d`; 
        } else {
            const diffWeeks = Math.ceil(diffDays / 7);
            if (diffWeeks <= 6) { 
                resultText = `Due in ${diffWeeks}w`; 
            } else { 
                const diffMonths = Math.ceil(diffDays / 30.44); 
                resultText = `Due in ${diffMonths}m`; 
            }
        }
        return resultText;
    };

    // --- Button Styles and Menu Items (Remain in parent) ---
    const selectedAllButtonStyle = { fontWeight: 600, padding: '0 10px', height: '28px', borderColor: 'var(--primary-500)', color: 'var(--primary-600)' };
    const defaultAllButtonStyle = { fontWeight: 500, padding: '0 10px', height: '28px' };
    // --- End Button Styles ---

    // --- Render Logic ---
    if (error && !loading) { return (<Card style={style}><Alert message="Error Loading Bills Data" description={error.message || 'Unknown error'} type="error" showIcon closable /></Card>); }

    // Calculate the number of unpaid and paid bills with the current category filter applied
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

                {/* Replace BillsListSection with custom list */}
                <div>
                    {/* Filter Section */}
                    <div style={{ marginBottom: '20px', width: '100%' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            {/* Filter controls */}
                            <Space align="center">
                                <Text strong style={{ color: 'var(--neutral-600)', whiteSpace: 'nowrap' }}> Filter by: </Text>
                                <Button
                                    size="small"
                                    type="default"
                                    className="all-categories-btn"
                                    onClick={() => setSelectedCategory('All')}
                                    style={selectedCategory === 'All' ? selectedAllButtonStyle : defaultAllButtonStyle}
                                >
                                    All Categories
                                </Button>
                            </Space>

                            {/* Button for Adding Bills */}
                            <div>
                                <Button
                                    type="primary"
                                    icon={<IconPlus size={16} />}
                                    onClick={handleAddBill}
                                    style={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}
                                    className="hide-on-mobile"
                                >
                                    Add Bills
                                </Button>
                            </div>
                         </div>
                         {/* Category Tags Container */}
                         <div className="category-tags-container">
                            {categories.map((category) => (
                                <Tag.CheckableTag
                                    key={category}
                                    checked={selectedCategory === category}
                                    onChange={(checked) => { setSelectedCategory(checked ? category : 'All'); }}
                                    style={{ 
                                        padding: '2px 8px', 
                                        borderRadius: '12px', 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '6px', 
                                        cursor: 'pointer', 
                                        border: 'none',
                                        backgroundColor: selectedCategory === category ? 'var(--primary-50)' : 'var(--neutral-50)', 
                                        color: selectedCategory === category ? 'var(--primary-600)' : 'var(--neutral-700)', 
                                        lineHeight: '1.4', 
                                        fontSize: '0.8rem' 
                                    }}
                                >
                                    {getCategoryIcon(category)} <span>{category}</span>
                                </Tag.CheckableTag>
                            ))}
                         </div>
                    </div>

                    {/* Custom Bills List */}
                    {!isTableCollapsed && (
                        <div className="bills-list-container">
                            {tableDataSource.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--neutral-500)' }}>
                                    <Text type="secondary">No bills match the current filters for this month.</Text>
                                </div>
                            ) : (
                                tableDataSource.map((record, index) => (
                                    <div key={record.id || index} className={`bill-row ${rowClassName(record)}`}>
                                        {/* Checkbox */}
                                        <div className="bill-checkbox">
                                            <Checkbox 
                                                className={`status-checkbox small-checkbox ${record.isPaid ? 'checked' : ''}`} 
                                                checked={record.isPaid} 
                                                onChange={() => handleTogglePaid(record)} 
                                            />
                                        </div>

                                        {/* Main Content */}
                                        <div className="bill-content">
                                            {/* Top Row: Name and Amount */}
                                            <div className="bill-main-row">
                                                <Text strong className="bill-name">{record.name}</Text>
                                                <Text strong className="bill-amount">
                                                    ${Number(record.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Text>
                                            </div>

                                            {/* Bottom Row: Category and Due Status */}
                                            <div className="bill-details-row">
                                                {record.category && (
                                                    <Tag 
                                                        style={{ 
                                                            margin: 0,
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                            color: 'var(--neutral-600)',
                                                            fontSize: '0.7rem',
                                                            padding: '0 4px 0 0'
                                                        }}
                                                    >
                                                        <span style={{ marginRight: '4px', display: 'inline-flex', alignItems: 'center' }}>
                                                            {getCategoryIcon(record.category)}
                                                        </span>
                                                        {record.category}
                                                    </Tag>
                                                )}
                                                <div className="bill-due-status">
                                                    {renderDueIn(record.dueDate, record)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="bill-actions">
                                            <Dropdown
                                                menu={{ 
                                                    items: [
                                                        { 
                                                            key: 'edit', 
                                                            icon: <IconEdit size={16} />, 
                                                            label: 'Edit', 
                                                            onClick: (e) => { 
                                                                if (e && e.domEvent) e.domEvent.stopPropagation(); 
                                                                handleEdit(record); 
                                                            } 
                                                        },
                                                        { 
                                                            key: 'delete', 
                                                            icon: <IconTrash size={16} />, 
                                                            label: 'Delete', 
                                                            danger: true, 
                                                            onClick: (e) => { 
                                                                if (e && e.domEvent) e.domEvent.stopPropagation(); 
                                                                handleDelete(record); 
                                                            } 
                                                        }
                                                    ]
                                                }} 
                                                trigger={['click']}
                                            >
                                                <Button 
                                                    type='text' 
                                                    icon={<IconDotsVertical size={16} />} 
                                                    onClick={e => e.stopPropagation()} 
                                                />
                                            </Dropdown>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Collapse/Expand Button - REMOVED */}

                </div>

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

        {/* Custom CSS for the modern card-based design */}
        <style jsx global>{`
            .bills-list-container {
                display: flex;
                flex-direction: column;
                margin-top: 16px;
                background: white;
                border-radius: 12px;
                border: 1px solid var(--neutral-200);
                overflow: hidden;
            }

            .bill-row {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                background: white;
                border-radius: 0;
                border: none;
                border-bottom: 1px solid var(--neutral-100);
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .bill-row:hover {
                background-color: var(--neutral-50);
            }

            .bill-row:last-child {
                border-bottom: none;
            }

            .bill-checkbox {
                flex-shrink: 0;
            }

            .bill-content {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 4px; /* Reduced gap from 6px to 4px */
            }

            .bill-main-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
            }

            .bill-name {
                font-size: 14px;
                font-weight: 600;
                color: var(--neutral-800);
                line-height: 1.3;
                flex: 1;
                min-width: 0;
                word-break: break-word;
            }

            .bill-amount {
                font-size: 14px;
                font-weight: 600;
                color: var(--neutral-900);
                line-height: 1;
                flex-shrink: 0;
            }

            .bill-details-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
            }

            .bill-due-status {
                font-size: 12px;
                font-weight: 500;
                padding: 2px 6px;
                border-radius: 6px;
                background-color: var(--neutral-100);
                color: var(--neutral-700);
                white-space: nowrap;
            }

            .bill-actions {
                flex-shrink: 0;
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .bill-row:hover .bill-actions {
                opacity: 1;
            }

            /* Mobile optimizations */
            @media (max-width: 768px) {
                .bills-list-container {
                    margin-top: 12px;
                    border-radius: 8px;
                }

                .bill-row {
                    padding: 12px;
                    gap: 10px;
                }
            }

            /* Fade animation for bill completion */
            .bill-row-fade-out {
                opacity: 0.5;
                transform: scale(0.98);
            }

            /* Category tag styling */
            .bill-details-row .ant-tag {
                display: inline-flex;
                align-items: center;
                gap: 2px;
            }

            /* Due status color variations */
            .bill-due-status:has-text("Past") {
                background-color: var(--danger-100);
                color: var(--danger-700);
            }

            .bill-due-status:has-text("Today") {
                background-color: var(--warning-100);
                color: var(--warning-700);
            }
        `}</style>
     </>
    );
};

export default CombinedBillsOverview;