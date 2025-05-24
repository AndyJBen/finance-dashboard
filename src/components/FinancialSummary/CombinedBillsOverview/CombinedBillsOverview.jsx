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
    IconEye,
    IconEyeOff
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;
const { useBreakpoint } = Grid;

// Mock data for demonstration
const mockBills = [
    {
        id: 1,
        name: 'Netflix Subscription',
        amount: 15.99,
        dueDate: '2025-02-15',
        category: 'Subscription',
        isPaid: false,
        isRecurring: true
    },
    {
        id: 2,
        name: 'Electric Bill',
        amount: 127.50,
        dueDate: '2025-02-20',
        category: 'Utilities',
        isPaid: true,
        isRecurring: true
    },
    {
        id: 3,
        name: 'Car Insurance',
        amount: 89.00,
        dueDate: '2025-02-10',
        category: 'Insurance',
        isPaid: false,
        isRecurring: true
    },
    {
        id: 4,
        name: 'Grocery Store',
        amount: 234.67,
        dueDate: '2025-01-28',
        category: 'Groceries',
        isPaid: false,
        isRecurring: false
    },
    {
        id: 5,
        name: 'Rent Payment',
        amount: 1850.00,
        dueDate: '2025-02-01',
        category: 'Rent',
        isPaid: true,
        isRecurring: true
    }
];

// Helper Functions
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
    if (!dueDate || !dayjs(dueDate).isValid()) { 
        return <span style={{ color: 'var(--neutral-400)' }}>N/A</span>; 
    }
    const due = dayjs(dueDate).startOf('day');
    const today = dayjs().startOf('day');
    const diffDaysFromToday = due.diff(today, 'day');
    
    let resultText = '';
    if (diffDaysFromToday <= 10) { 
        resultText = `${diffDaysFromToday}d`; 
    } else {
        const diffWeeks = Math.ceil(diffDaysFromToday / 7);
        if (diffWeeks <= 6) { 
            resultText = `${diffWeeks}w`; 
        } else { 
            const diffMonths = Math.ceil(diffDaysFromToday / 30.44); 
            resultText = `${diffMonths}m`; 
        }
    }
    return resultText;
};

const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
        case 'utilities': return 'blue';
        case 'rent': return 'purple';
        case 'mortgage': return 'volcano';
        case 'groceries': return 'green';
        case 'subscription': return 'cyan';
        case 'credit card': return 'red';
        case 'loan': return 'gold';
        case 'insurance': return 'magenta';
        case 'medical': return 'red';
        case 'personal care': return 'lime';
        case 'bill prep': return 'geekblue';
        case 'auto': return 'orange';
        default: return 'default';
    }
};

const ModernBillsTable = () => {
    const screens = useBreakpoint();
    const isMobileView = !screens.md;
    const [isTableCollapsed, setIsTableCollapsed] = useState(false);
    const [showPaidBills, setShowPaidBills] = useState(false);
    const [fadingBillId, setFadingBillId] = useState(null);

    // Filter bills based on paid status
    const filteredBills = useMemo(() => {
        return showPaidBills 
            ? mockBills 
            : mockBills.filter(bill => !bill.isPaid);
    }, [showPaidBills]);

    const handleTogglePaid = async (record) => {
        const markingAsPaid = !record.isPaid;
        if (markingAsPaid) {
            setFadingBillId(record.id);
            await new Promise(res => setTimeout(res, 300));
        }
        // Update bill logic would go here
        if (markingAsPaid) {
            setFadingBillId(null);
        }
    };

    const handleEdit = (record) => {
        console.log('Edit:', record);
    };

    const handleDelete = (record) => {
        console.log('Delete:', record);
    };

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
            return <span style={{ color: 'var(--danger-500)' }}>Past Due</span>;
        }
        if (due.isSame(today, 'day')) {
            return <span style={{ color: 'var(--warning-700)' }}>Today</span>;
        }
        return formatDueDate(dueDate);
    };

    const rowClassName = (record) => (record.id === fadingBillId ? 'bill-row-fade-out' : '');

    // Add this to your existing CombinedBillsOverview.jsx file
    // Replace your existing mobileColumns definition with this:
    const mobileColumns = [
        { 
            title: '', 
            dataIndex: 'isPaid', 
            key: 'statusCheckbox', 
            width: 48, 
            align: 'center', 
            render: (isPaid, record) => (
                <Checkbox 
                    className={`status-checkbox ${isPaid ? 'checked' : ''}`} 
                    checked={isPaid} 
                    onChange={() => handleTogglePaid(record)} 
                />
            ) 
        },
        {
            title: 'Bill Details',
            key: 'billInfo',
            render: (_, record) => {
                const amountFormatted = `$${Number(record.amount).toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                })}`;
                
                return (
                    <div className='modern-bill-cell'>
                        {/* Main row with name and amount */}
                        <div className='bill-main-row'>
                            <Text strong className="bill-name">{record.name}</Text>
                            <Text strong className='bill-amount' style={{
                                color: record.isPaid ? 'var(--success-600)' : 'var(--neutral-800)',
                                fontSize: '16px',
                                fontWeight: 600
                            }}>
                                {amountFormatted}
                            </Text>
                        </div>
                        
                        {/* Secondary row with metadata */}
                        <div className='bill-meta-row'>
                            <div className="bill-meta-left">
                                {record.category && (
                                    <Tag 
                                        icon={getCategoryIcon(record.category)} 
                                        color={getCategoryColor(record.category)}
                                        style={{ 
                                            fontSize: '11px', 
                                            padding: '2px 8px',
                                            height: '22px',
                                            borderRadius: '11px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        {record.category}
                                    </Tag>
                                )}
                                {record.isRecurring && (
                                    <Tag 
                                        style={{ 
                                            fontSize: '10px',
                                            padding: '1px 6px',
                                            height: '18px',
                                            borderRadius: '9px',
                                            backgroundColor: 'var(--primary-50)',
                                            color: 'var(--primary-600)',
                                            border: '1px solid var(--primary-200)',
                                            marginLeft: '4px'
                                        }}
                                    >
                                        Recurring
                                    </Tag>
                                )}
                            </div>
                            <div className="bill-meta-right">
                                <Text 
                                    type="secondary" 
                                    style={{ 
                                        fontSize: '12px',
                                        color: 'var(--neutral-500)'
                                    }}
                                >
                                    Due {record.dueDate ? dayjs(record.dueDate).format('MMM D') : 'N/A'}
                                </Text>
                                <Text 
                                    style={{ 
                                        fontSize: '11px',
                                        color: renderDueIn(record.dueDate, record).props?.style?.color || 'var(--neutral-600)',
                                        fontWeight: 500,
                                        marginLeft: '8px'
                                    }}
                                >
                                    {typeof renderDueIn(record.dueDate, record) === 'string' ? 
                                        renderDueIn(record.dueDate, record) : 
                                        renderDueIn(record.dueDate, record).props?.children || ''}
                                </Text>
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            title: (
                <Tooltip title={isTableCollapsed ? 'Expand List' : 'Collapse List'}>
                    <Button 
                        type='link' 
                        size='small' 
                        icon={isTableCollapsed ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />} 
                        onClick={() => setIsTableCollapsed(!isTableCollapsed)} 
                        style={{ padding: '0 4px' }} 
                    />
                </Tooltip>
            ),
            key: 'actions', 
            fixed: 'right', 
            width: 44, 
            align: 'center',
            render: (_, record) => {
                const menuItems = [
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
                ];
                return (
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <Button 
                            type='text' 
                            icon={<IconDotsVertical size={16} />} 
                            style={{ 
                                padding: '8px',
                                borderRadius: '8px'
                            }} 
                            onClick={e => e.stopPropagation()} 
                        />
                    </Dropdown>
                );
            }
        }
    ];

    // Desktop columns (unchanged for comparison)
    const desktopColumns = [
        { 
            title: '', 
            dataIndex: 'isPaid', 
            key: 'statusCheckbox', 
            width: 32, 
            align: 'center', 
            render: (isPaid, record) => (
                <Tooltip title={isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}>
                    <Checkbox 
                        className={`status-checkbox ${isPaid ? 'checked' : ''}`} 
                        checked={isPaid} 
                        onChange={() => handleTogglePaid(record)} 
                    />
                </Tooltip>
            ) 
        },
        { 
            title: 'Name', 
            dataIndex: 'name', 
            key: 'name', 
            width: 130, 
            align: 'left', 
            sorter: (a, b) => a.name.localeCompare(b.name), 
            render: (text) =>  <Text strong>{text}</Text>
        },
        { 
            title: 'Amount', 
            dataIndex: 'amount', 
            key: 'amount', 
            width: 80, 
            align: 'left', 
            sorter: (a, b) => a.amount - b.amount, 
            render: (amount) => <Text strong>{`$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</Text> 
        },
        { 
            title: 'Category', 
            dataIndex: 'category', 
            key: 'category', 
            width: 80, 
            align: 'left', 
            render: (category) => category ? (
                <Tag icon={getCategoryIcon(category)} color={getCategoryColor(category)}>
                    {category}
                </Tag>
            ) : null 
        },
        { 
            title: 'Due Date', 
            dataIndex: 'dueDate', 
            key: 'dueDate', 
            width: 80, 
            align: 'left', 
            sorter: (a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf(), 
            render: (date) => date ? dayjs(date).format('MM/DD/YYYY') : 'N/A' 
        },
        {
            title: 'Due In', 
            key: 'dueIn', 
            dataIndex: 'dueDate', 
            width: 60, 
            align: 'left',
            sorter: (a, b) => {
                if (a.isPaid && !b.isPaid) return 1; 
                if (!a.isPaid && b.isPaid) return -1;
                const dateA = dayjs(a.dueDate).isValid() ? dayjs(a.dueDate).valueOf() : Infinity;
                const dateB = dayjs(b.dueDate).isValid() ? dayjs(b.dueDate).valueOf() : Infinity;
                return dateA - dateB;
            },
            defaultSortOrder: 'ascend',
            render: (dueDate, record) => renderDueIn(dueDate, record),
        },
        {
            title: (
                <Tooltip title={isTableCollapsed ? 'Expand List' : 'Collapse List'}>
                    <Button 
                        type='link' 
                        size='small' 
                        icon={isTableCollapsed ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />} 
                        onClick={() => setIsTableCollapsed(!isTableCollapsed)} 
                        style={{ padding: '0 4px' }} 
                    />
                </Tooltip>
            ),
            key: 'actions', 
            fixed: 'right', 
            width: 30, 
            align: 'center',
            render: (_, record) => {
                const menuItems = [
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
                ];
                return (
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <Button 
                            type='text' 
                            icon={<IconDotsVertical size={16} />} 
                            style={{ padding: '0 12px' }} 
                            onClick={e => e.stopPropagation()} 
                        />
                    </Dropdown>
                );
            }
        },
    ];

    const columns = isMobileView ? mobileColumns : desktopColumns;
    const tableDataSource = isTableCollapsed ? [] : filteredBills;

    // Calculate paid bills count for toggle button
    const paidVisibleCount = mockBills.filter(bill => bill.isPaid).length;

    return (
        <Card style={{ margin: '16px', borderRadius: '16px' }}>
            {/* Monthly Progress Summary */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <IconCalendarFilled
                            size={24}
                            style={{ marginRight: '8px', color: 'var(--primary-600)' }}
                        />
                        <Text strong style={{ fontSize: '16px' }}>
                            Monthly Bills Progress
                            <Text type="secondary" style={{ fontSize: '14px', marginLeft: '8px' }}>
                                (3/5)
                            </Text>
                        </Text>
                    </div>
                    <Text style={{ 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        color: 'var(--primary-600)', 
                        backgroundColor: 'var(--primary-100)', 
                        padding: '4px 8px', 
                        borderRadius: '12px' 
                    }}>
                        60% Paid
                    </Text>
                </div>

                <Progress 
                    percent={60} 
                    strokeColor="var(--success-500)" 
                    trailColor="var(--neutral-200)" 
                    showInfo={false} 
                    style={{ marginBottom: '16px' }}
                />

                <Row gutter={[16, 16]}>
                    <Col span={8} style={{ textAlign: 'center' }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: '12px' }}>Paid</Text>}
                            value={2077.49}
                            precision={2}
                            prefix="$"
                            valueStyle={{ fontWeight: 600, fontSize: '16px', color: 'var(--success-500)' }}
                        />
                    </Col>
                    <Col span={8} style={{ textAlign: 'center' }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: '12px' }}>Total</Text>}
                            value={2317.16}
                            precision={2}
                            prefix="$"
                            valueStyle={{ fontWeight: 600, fontSize: '16px', color: 'var(--neutral-900)' }}
                        />
                    </Col>
                    <Col span={8} style={{ textAlign: 'center' }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: '12px' }}>Remaining</Text>}
                            value={239.67}
                            precision={2}
                            prefix="$"
                            valueStyle={{ fontWeight: 600, fontSize: '16px', color: 'var(--danger-500)' }}
                        />
                    </Col>
                </Row>
            </div>

            <Divider />

            {/* Bills Table */}
            <Table
                className="modern-bills-table"
                columns={columns}
                dataSource={tableDataSource}
                rowKey="id"
                rowClassName={rowClassName}
                pagination={false}
                scroll={isMobileView ? undefined : { x: 730 }}
                size="middle"
                locale={isTableCollapsed ? { emptyText: null } : undefined}
            />

            {/* Show/Hide Paid Bills Toggle */}
            {!isTableCollapsed && mockBills.length > 0 && paidVisibleCount > 0 && (
                <div style={{ 
                    textAlign: 'center', 
                    borderTop: '1px solid var(--neutral-200)',
                    paddingTop: '12px',
                    marginTop: '16px'
                }}>
                    <Button
                        type="text"
                        icon={showPaidBills ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        onClick={() => setShowPaidBills(!showPaidBills)}
                        style={{ color: 'var(--neutral-600)' }}
                    >
                        {showPaidBills ? 'Hide Paid Bills' : 'Show All Bills'}
                    </Button>
                </div>
            )}

            <style jsx global>{`
                .modern-bills-table .modern-bill-cell {
                    padding: 4px 0;
                    width: 100%;
                }

                .modern-bills-table .bill-main-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 6px;
                }

                .modern-bills-table .bill-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--neutral-800);
                    flex: 1;
                    min-width: 0;
                    margin-right: 12px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .modern-bills-table .bill-amount {
                    flex-shrink: 0;
                    text-align: right;
                }

                .modern-bills-table .bill-meta-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                }

                .modern-bills-table .bill-meta-left {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 4px;
                    flex: 1;
                    min-width: 0;
                }

                .modern-bills-table .bill-meta-right {
                    display: flex;
                    align-items: center;
                    flex-shrink: 0;
                    white-space: nowrap;
                }

                .modern-bills-table .ant-table-tbody > tr > td {
                    padding: 12px 8px !important;
                    border-bottom: 1px solid var(--neutral-200) !important;
                    vertical-align: top;
                }

                .modern-bills-table .ant-table-tbody > tr:hover > td {
                    background-color: var(--neutral-50) !important;
                }

                .modern-bills-table .ant-table-thead > tr > th {
                    background-color: var(--neutral-50) !important;
                    border-bottom: 1px solid var(--neutral-200) !important;
                    font-weight: 600;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--neutral-600);
                    padding: 12px 8px !important;
                }

                .modern-bills-table .ant-table-thead > tr > th:first-child {
                    width: 48px !important;
                    text-align: center;
                }

                .modern-bills-table .ant-table-thead > tr > th:last-child {
                    width: 44px !important;
                    text-align: center;
                }

                .modern-bills-table .status-checkbox .ant-checkbox-inner {
                    width: 18px;
                    height: 18px;
                    border-radius: 4px;
                    border: 2px solid var(--neutral-300);
                    transition: all 0.2s ease;
                }

                .modern-bills-table .status-checkbox .ant-checkbox-checked .ant-checkbox-inner {
                    background-color: var(--success-500) !important;
                    border-color: var(--success-500) !important;
                }

                .modern-bills-table .ant-tag {
                    margin: 0;
                    font-weight: 500;
                    border: none;
                    display: inline-flex;
                    align-items: center;
                }

                @keyframes billRowFadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }

                .modern-bills-table .bill-row-fade-out {
                    animation: billRowFadeOut 0.3s ease forwards;
                }

                /* Responsive enhancements */
                @media (max-width: 768px) {
                    .modern-bills-table .ant-table-tbody > tr > td:first-child {
                        padding-left: 12px !important;
                    }
                    
                    .modern-bills-table .ant-table-tbody > tr > td:last-child {
                        padding-right: 12px !important;
                    }
                }
            `}</style>
        </Card>
    );
};

export default ModernBillsTable;