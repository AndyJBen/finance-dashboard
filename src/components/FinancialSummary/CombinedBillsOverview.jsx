// src/components/FinancialSummary/CombinedBillsOverview.jsx
// Combined "Add Bill" and "Add Multiple Bills" into a Dropdown.Button

import React, { useState, useContext, useMemo, useEffect } from 'react';
import {
    Table, Button, Space, Spin, Alert, Tooltip, Checkbox, Tag, Card,
    Progress, Typography, Row, Col, Statistic, Divider, message, Modal,
    List,
    Dropdown, // Keep Dropdown
    Menu // Keep Menu
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
    IconPlaylistAdd // New Icon for Multiple Bills
} from '@tabler/icons-react';
import { FinanceContext } from '../../contexts/FinanceContext';
import EditBillModal from '../BillsList/EditBillModal';
import MultiBillModal from './MultiBillModal'; // Keep MultiBillModal import
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
const { Text, Title, Paragraph } = Typography;

// --- Helper Functions (No changes) ---
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
    const startOfDisplayedMonth = dayjs(displayedMonth).startOf('month');
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

// --- Main Component ---
const CombinedBillsOverview = ({ style }) => {
    // Context and State
    const {
        loading, error, deleteBill, updateBill, addBill,
        displayedMonth, goToPreviousMonth, goToNextMonth, bills,
    } = useContext(FinanceContext);
    const [isModalVisible, setIsModalVisible] = useState(false); // For EditBillModal (single add/edit)
    const [isMultiModalVisible, setMultiModalVisible] = useState(false); // For MultiBillModal
    const [editingBill, setEditingBill] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isTableCollapsed, setIsTableCollapsed] = useState(false);
    const defaultPageSize = 10;

    // --- Derived State (No changes) ---
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
    // --- End Derived State ---

    // --- Event Handlers ---
     const handleAddSingle = () => { // Renamed for clarity
         setEditingBill(null);
         setIsModalVisible(true);
     };
     const handleEdit = (record) => {
         setEditingBill(record);
         setIsModalVisible(true);
     };
     const handleModalSubmit = async (values) => { // Handles single add/edit submit
         let result = editingBill ? await updateBill(editingBill, values) : await addBill(values);
         if (result) { setIsModalVisible(false); setEditingBill(null); }
     };
     const handleTogglePaid = async (record) => { await updateBill(record, { isPaid: !record.isPaid }); };
     const handleDelete = async (record) => {
         if (!record || typeof record.id === 'undefined') { message.error('Cannot delete bill: Invalid data.'); return; }
         try { await deleteBill(record.id); } catch (error) { message.error(`Deletion error: ${error.message || 'Unknown'}`); }
     };

     // Handlers for MultiBillModal
     const handleOpenMultiModal = () => {
         setMultiModalVisible(true);
     };
     const handleCloseMultiModal = () => {
         setMultiModalVisible(false);
     };

     // Handler for Dropdown Menu clicks
     const handleMenuClick = (e) => {
        if (e.key === 'add-multiple') {
            handleOpenMultiModal();
        } else { // Default to 'add-single'
            handleAddSingle();
        }
     };
     // --- End Event Handlers ---

    // --- Table Columns (No changes) ---
    const columns = [
        { title: 'Status', dataIndex: 'isPaid', key: 'statusCheckbox', width: 50, align: 'center', render: (isPaid, record) => (<Tooltip title={isPaid ? "Mark as Unpaid" : "Mark as Paid"}><Checkbox className={`status-checkbox small-checkbox ${isPaid ? 'checked' : ''}`} checked={isPaid} onChange={() => handleTogglePaid(record)} /></Tooltip>) },
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

    // --- Render Logic ---
    const monthText = dayjs(displayedMonth).isValid() ? dayjs(displayedMonth).format("MMMM") : "Invalid";
    const yearText = dayjs(displayedMonth).isValid() ? dayjs(displayedMonth).format("YYYY") : "Date";

    if (error && !loading) { return (<Card style={style}><Alert message="Error Loading Bills Data" description={error.message || 'Unknown error'} type="error" showIcon closable /></Card>); }

    const tableDataSource = isTableCollapsed
        ? mainTableDataSourceFiltered.slice(0, defaultPageSize)
        : mainTableDataSourceFiltered;

    // Style for the selected "All Categories" button
    const selectedAllButtonStyle = {
        fontWeight: 600,
        padding: '0 10px',
        height: '28px',
        borderColor: 'var(--primary-500)',
        color: 'var(--primary-600)',
    };

    // Style for the unselected "All Categories" button
    const defaultAllButtonStyle = {
        fontWeight: 500,
        padding: '0 10px',
        height: '28px',
    };

    // Define items for the Dropdown.Button menu
    const addBillMenuItems = [
        {
            key: 'add-single',
            label: 'Add Single Bill',
            icon: <IconPlus size={16} />,
        },
        {
            key: 'add-multiple',
            label: 'Add Multiple Bills',
            icon: <IconPlaylistAdd size={16} />, // Use a different icon
        },
    ];

    return (
     <> {/* Fragment to wrap Card and Modals */}
        <Card
            style={style}
            styles={{ body: { padding: 'var(--space-20)' } }}
            // REMOVED 'extra' prop - button moved below
        >
            <Spin spinning={loading} tip="Loading Bills...">

                {/* Section 1: Monthly Progress Summary (Original Content - No Changes Here) */}
                <div style={{ marginBottom: 'var(--space-24)' }}>
                    {/* Title and Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-16)' }}>
                        <div>
                             <Text strong style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-4)', fontSize: '1rem' }}>
                                 <IconCalendarFilled size={25} style={{ marginRight: 'var(--space-8)', color: 'var(--primary-600)' }} />
                                 Monthly Bills Progress
                                 {totalBillsInDisplayedMonth > 0 && (
                                     <Text type="secondary" style={{ fontSize: '0.875rem', marginLeft: '8px' }}>
                                         ({paidBillsInDisplayedMonth}/{totalBillsInDisplayedMonth})
                                     </Text>
                                 )}
                             </Text>
                        </div>
                        {totalAmountForAllBillsInDisplayedMonth > 0 && (
                             <Text style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-600)', backgroundColor: 'var(--primary-100)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}>
                                 {percentAmountPaid}% Paid
                             </Text>
                        )}
                    </div>

                    {/* Month Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 'var(--space-20)' }}>
                        <Tooltip title="Previous Month">
                            <Button shape="circle" icon={<IconChevronLeft size={16} />} onClick={goToPreviousMonth} style={{ margin: '0 var(--space-16)' }} />
                        </Tooltip>
                        <div style={{ textAlign: 'center', minWidth: '100px' }}>
                           <Paragraph style={{ margin: 0, fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.2, color: 'var(--neutral-800)', marginBottom: '2px' }}>
                               {monthText}
                           </Paragraph>
                           <Paragraph style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.1, color: 'var(--neutral-600)' }}>
                               {yearText}
                           </Paragraph>
                        </div>
                        <Tooltip title="Next Month">
                            <Button shape="circle" icon={<IconChevronRight size={16} />} onClick={goToNextMonth} style={{ margin: '0 var(--space-16)' }} />
                        </Tooltip>
                         </div>

                    {/* Progress Bar */}
                    {totalAmountForAllBillsInDisplayedMonth > 0 && (
                        <div style={{ width: '90%', margin: '0 auto', marginBottom: 'var(--space-20)' }}>
                            <Progress percent={percentAmountPaid} strokeColor="var(--success-500)" trailColor="var(--neutral-200)" showInfo={false} size={['100%', 12]} />
                        </div>
                    )}

                    {/* Stats */}
                    <Row gutter={[16, 16]} justify="space-around" align="middle" style={{ marginBottom: 'var(--space-16)' }}>
                         <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                            <Statistic title={<Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 500 }}>Paid This Month</Text>} value={totalExpensesInDisplayedMonth} precision={2} prefix="$" valueStyle={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--success-500)' }} />
                         </Col>
                         <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                            <Statistic title={<Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 500 }}>Total Bills</Text>} value={totalAmountForAllBillsInDisplayedMonth} precision={2} prefix="$" valueStyle={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--neutral-900)' }} />
                         </Col>
                         <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                               <Statistic title={<Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 500 }}>Remaining This Month</Text>} value={totalAmountDueInDisplayedMonth} precision={2} prefix="$" valueStyle={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--danger-500)' }} />
                         </Col>
                    </Row>

                    {totalBillsInDisplayedMonth === 0 && !loading && (
                        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 'var(--space-16)' }}>
                            No bills due this month.
                        </Text>
                    )}
                </div>
                <Divider style={{ margin: '0 0 var(--space-24) 0' }} />

                {/* Section 2: Bills List Table */}
                <div>
                    {/* Filter Section */}
                    <div style={{ marginBottom: '16px', width: '100%' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            {/* Filter controls */}
                            <Space align="center">
                                <Text strong style={{ color: 'var(--neutral-600)', whiteSpace: 'nowrap' }}> Filter by: </Text>
                                <Button size="small" type="default" onClick={() => setSelectedCategory('All')} style={selectedCategory === 'All' ? selectedAllButtonStyle : defaultAllButtonStyle} >
                                    All Categories
                                </Button>
                            </Space>

                            {/* MODIFIED: Dropdown Button for Adding Bills */}
                            <div>
                                <Dropdown.Button
                                    type="primary"
                                    icon={<IconChevronDown size={16} />} // Dropdown indicator
                                    onClick={handleAddSingle} // Default action: Add Single Bill
                                    menu={{ items: addBillMenuItems, onClick: handleMenuClick }} // Pass items and handler
                                    style={{ display: 'flex', alignItems: 'center', /* gap: '4px', */ fontWeight: 500 }}
                                >
                                    <IconPlus size={16} style={{marginRight: '4px'}}/> {/* Icon for the main button part */}
                                    Add Bill
                                </Dropdown.Button>
                            </div>
                         </div>
                         {/* Category Tags */}
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {categories.map((category) => (
                                <Tag.CheckableTag
                                    key={category}
                                    checked={selectedCategory === category}
                                    onChange={(checked) => { setSelectedCategory(checked ? category : 'All'); }}
                                    style={{ padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid', borderColor: selectedCategory === category ? 'var(--primary-500)' : 'var(--neutral-300)', backgroundColor: selectedCategory === category ? 'var(--primary-50)' : 'var(--neutral-50)', color: selectedCategory === category ? 'var(--primary-600)' : 'var(--neutral-700)', lineHeight: '1.4', fontSize: '0.8rem' }} >
                                    {getCategoryIcon(category)} <span>{category}</span>
                                </Tag.CheckableTag>
                            ))}
                         </div>
                         </div>
                         {/* END Filter Section */}

                    {/* Main Bills Table (No changes) */}
                    <Table columns={columns} dataSource={tableDataSource} rowKey={record => record.id || `${record.name}-${record.dueDate}`} pagination={false} scroll={{ x: 730 }} size="middle" />
                    {tableDataSource.length === 0 && !loading && (
                        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 'var(--space-16)' }}>
                            {isTableCollapsed ? 'Table is collapsed.' : 'No bills match the current filters for this month.'}
                        </Text>
                         )}
                </div>
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
