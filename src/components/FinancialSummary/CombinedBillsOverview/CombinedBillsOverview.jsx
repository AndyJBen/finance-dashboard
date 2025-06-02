// src/components/FinancialSummary/CombinedBillsOverview/CombinedBillsOverview.jsx
import React, { useState, useContext, useMemo, useRef, useCallback, useEffect } from 'react';
import {
    Button, Space, Spin, Alert, Checkbox, Tag, Card,
    Typography, message,
    Dropdown,
    Grid
} from 'antd';
import {
    IconCalendarFilled, IconEdit, IconTrash, IconPlus, IconChevronLeft,
    IconChevronRight, IconHome, IconBolt, IconWifi,
    IconCreditCard, IconCar, IconShoppingCart, IconHelp,
    IconCalendar, IconCurrencyDollar, IconCircleCheck, IconClock,
    IconCertificate, IconMedicineSyrup, IconCalendarTime,
    IconUser,
    IconDotsVertical,
    IconEye,
    IconEyeOff
} from '@tabler/icons-react';
import { FinanceContext } from '../../../contexts/FinanceContext';
import EditBillModal from '../../PopUpModals/EditBillModal';
import MultiBillModal from '../../PopUpModals/MultiBillModal';
import DeleteBillModal from '../../PopUpModals/DeleteBillModal';
import MonthlyProgressSummary from './MonthlyProgressSummary';
import { fetchBills } from '../../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBetween from 'dayjs/plugin/isBetween';
import './CombinedBillsOverview.css';

// Extend dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

const { Text } = Typography;
const { useBreakpoint } = Grid;

// Enhanced Bill Row Component with iOS-style Slide Actions
const EnhancedBillRow = ({ 
    record, 
    index, 
    onTogglePaid, 
    onEdit, 
    onDelete, 
    getCategoryIcon, 
    getCategoryColor, 
    renderDueIn, 
    rowClassName,
    isMobile 
}) => {
    const [slideOffset, setSlideOffset] = useState(0);
    const [isSliding, setIsSliding] = useState(false);
    const [showActions, setShowActions] = useState(false);
    
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const slideThreshold = 60; // Pixels to reveal actions
    const maxSlide = 140; // Maximum slide distance
    const snapThreshold = 40; // Minimum distance to keep actions visible

    // Haptic feedback simulation
    const triggerHaptic = useCallback((type = 'light') => {
        if (navigator.vibrate) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30]
            };
            navigator.vibrate(patterns[type]);
        }
    }, []);

    const handleTouchStart = useCallback((e) => {
        if (!isMobile) return;
        
        const touch = e.touches[0];
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
        setIsSliding(false);
    }, [isMobile]);

    const handleTouchMove = useCallback((e) => {
        if (!isMobile) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX.current;
        const deltaY = touch.clientY - touchStartY.current;
        
        // Only handle horizontal swipes that are more horizontal than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 15) {
            e.preventDefault(); // Prevent scrolling
            setIsSliding(true);
            
            // Only allow left swipe (negative values)
            if (deltaX < 0) {
                const newOffset = Math.max(-maxSlide, deltaX);
                setSlideOffset(newOffset);
                
                // Show actions when threshold is reached
                const shouldShowActions = Math.abs(newOffset) > slideThreshold;
                if (shouldShowActions && !showActions) {
                    setShowActions(true);
                    triggerHaptic('light');
                }
            } else if (showActions && deltaX > 0) {
                // Allow swiping back to close actions
                const newOffset = Math.min(0, deltaX - maxSlide);
                setSlideOffset(newOffset);
                
                if (Math.abs(newOffset) < slideThreshold && showActions) {
                    setShowActions(false);
                }
            }
        }
    }, [isMobile, showActions, triggerHaptic]);

    const handleTouchEnd = useCallback(() => {
        if (!isMobile) return;
        
        setIsSliding(false);
        
        // Determine if we should snap to open or closed position
        if (Math.abs(slideOffset) > snapThreshold) {
            // Snap to open position
            setSlideOffset(-maxSlide);
            setShowActions(true);
        } else {
            // Snap back to closed position
            setSlideOffset(0);
            setShowActions(false);
        }
    }, [isMobile, slideOffset]);

    // Handle action clicks
    const handleActionClick = useCallback((action, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        triggerHaptic('medium');
        
        // Execute action immediately without closing first
        if (action === 'edit') {
            onEdit(record);
        } else if (action === 'delete') {
            onDelete(record);
        }
        
        // Close the actions after a brief delay to allow the action to register
        setTimeout(() => {
            setSlideOffset(0);
            setShowActions(false);
        }, 100);
    }, [onEdit, onDelete, record, triggerHaptic]);

    // Close actions when tapping elsewhere
    const handleRowClick = useCallback((e) => {
        if (showActions) {
            e.preventDefault();
            e.stopPropagation();
            setSlideOffset(0);
            setShowActions(false);
        }
    }, [showActions]);

    // Close actions when scrolling or other interactions
    useEffect(() => {
        const handleDocumentTouch = (e) => {
            // Don't close if touching the slide actions themselves
            if (e.target.closest('.slide-actions-background')) {
                return;
            }
            
            if (showActions) {
                setSlideOffset(0);
                setShowActions(false);
            }
        };

        if (showActions) {
            document.addEventListener('touchstart', handleDocumentTouch, { passive: true });
            return () => document.removeEventListener('touchstart', handleDocumentTouch);
        }
    }, [showActions]);

    return (
        <div 
            key={record.id || index} 
            className={`enhanced-bill-row ${rowClassName ? rowClassName(record) : ''}`}
            onClick={handleRowClick}
        >
            {/* Slide Actions Background - mobile only */}
            {isMobile && (
                <div className="slide-actions-background">
                    <button
                        className="slide-action edit-action"
                        onTouchEnd={(e) => handleActionClick('edit', e)}
                        onClick={(e) => handleActionClick('edit', e)}
                        aria-label="Edit bill"
                    >
                        <IconEdit size={18} />
                        <span>Edit</span>
                    </button>
                    <button
                        className="slide-action delete-action"
                        onTouchEnd={(e) => handleActionClick('delete', e)}
                        onClick={(e) => handleActionClick('delete', e)}
                        aria-label="Delete bill"
                    >
                        <IconTrash size={18} />
                        <span>Delete</span>
                    </button>
                </div>
            )}

            {/* Main Row Content - This slides to reveal actions */}
            <div 
                className="bill-row-content"
                style={{
                    transform: `translateX(${slideOffset}px)`,
                    transition: isSliding ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Checkbox */}
                <div className="bill-checkbox">
                    <Checkbox 
                        className={`status-checkbox small-checkbox ${record.isPaid ? 'checked' : ''}`} 
                        checked={record.isPaid} 
                        onChange={(e) => {
                            e.stopPropagation();
                            onTogglePaid(record);
                        }} 
                    />
                </div>

                {/* Bill Content */}
                <div className="bill-content">
                    {/* Top Row: Name and Amount */}
                    <div className="bill-main-row">
                        <div className="bill-name-and-category">
                            <Text strong className="bill-name">{record.name}</Text>
                            {record.category && (
                                <div className="category-and-date">
                                    <Tag
                                        className="bill-category-tag"
                                        style={{
                                            margin: 0,
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            fontSize: '0.75rem',
                                            padding: '0 4px 0 0'
                                        }}
                                    >
                                        <span style={{
                                            marginRight: '6px',
                                            display: 'inline-flex',
                                            alignItems: 'center'
                                        }}>
                                            {React.cloneElement(getCategoryIcon(record.category), {
                                                size: 14,
                                                style: { color: getCategoryColor(record.category).text }
                                            })}
                                        </span>
                                        <span style={{
                                            color: getCategoryColor(record.category).text
                                        }}>
                                            {record.category}
                                        </span>
                                    </Tag>
                                    <span className="bill-due-date">
                                        {dayjs(record.dueDate).isValid() ? dayjs(record.dueDate).format('MM/DD/YYYY') : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="bill-amount-section">
                            <div className="amount-and-due">
                                <Text strong className="bill-amount">
                                    ${Number(record.amount).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </Text>
                                <div className="bill-due-status">
                                    {renderDueIn(record.dueDate, record)}
                                </div>
                            </div>
                            <Dropdown
                                menu={{
                                    items: [
                                        { key: 'edit', icon: <IconEdit size={16} />, label: 'Edit', onClick: () => onEdit(record) },
                                        { key: 'delete', icon: <IconTrash size={16} />, label: 'Delete', danger: true, onClick: () => onDelete(record) }
                                    ],
                                    onClick: e => e.domEvent.stopPropagation()
                                }}
                                trigger={[ 'click' ]}
                                placement="bottomRight"
                            >
                                <Button
                                    className="bill-action-dropdown-trigger"
                                    type="text"
                                    size="small"
                                    icon={<IconDotsVertical size={16} />}
                                    onClick={e => e.stopPropagation()}
                                />
                            </Dropdown>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Main Component
const CombinedBillsOverview = ({ style }) => {
    const {
        deleteBill,
        deleteMasterBill,
        updateBill,
        updateBillWithFuture,
        addBill,
        bills: contextBills,
        displayedMonth: contextDisplayedMonth
    } = useContext(FinanceContext);

    // Local state for month navigation and bills so that changing months here
    // does not affect the global FinanceContext month or bills
    const [overviewMonth, setOverviewMonth] = useState(dayjs());
    const [localBills, setLocalBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isMultiModalVisible, setMultiModalVisible] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showPaidBills, setShowPaidBills] = useState(false);
    const [fadingBillId, setFadingBillId] = useState(null);
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [billToDelete, setBillToDelete] = useState(null);

    const screens = useBreakpoint();
    const isSmallScreen = screens.xs || screens.sm;

    const loadBills = useCallback(async (targetMonth = overviewMonth) => {
        setLoading(true);
        setError(null);
        try {
            const monthString = targetMonth.format('YYYY-MM');
            const fetched = await fetchBills(monthString, true);
            setLocalBills(Array.isArray(fetched) ? fetched : []);
        } catch (err) {
            setLocalBills([]);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [overviewMonth]);

    useEffect(() => {
        loadBills();
    }, [overviewMonth, loadBills]);

    // Keep local bills in sync with context when months match
    useEffect(() => {
        if (dayjs(contextDisplayedMonth).isSame(overviewMonth, 'month')) {
            setLocalBills(Array.isArray(contextBills) ? contextBills : []);
        }
    }, [contextBills, contextDisplayedMonth, overviewMonth]);

    // Data processing logic
    const validBills = Array.isArray(localBills) ? localBills : [];
    const startOfDisplayedMonth = overviewMonth.startOf('month');
    const endOfDisplayedMonth = overviewMonth.endOf('month');

    const billsDueInDisplayedMonth = useMemo(() => {
        return validBills.filter(bill => {
            const dueDate = dayjs(bill.dueDate);
            return dueDate.isValid() && dueDate.isBetween(startOfDisplayedMonth, endOfDisplayedMonth, 'day', '[]');
        });
    }, [validBills, overviewMonth, startOfDisplayedMonth, endOfDisplayedMonth]);

    const filteredBillsByPaidStatus = useMemo(() => {
        const allBills = showPaidBills
            ? billsDueInDisplayedMonth
            : billsDueInDisplayedMonth.filter(bill => !bill.isPaid);

        // Sort bills in the following order:
        //   1. Unpaid "Bill Prep" bills, by due date
        //   2. Other unpaid bills, by due date
        //   3. Paid bills, by due date
        return allBills.slice().sort((a, b) => {
            const aBillPrep = !a.isPaid && a.category?.toLowerCase() === 'bill prep';
            const bBillPrep = !b.isPaid && b.category?.toLowerCase() === 'bill prep';

            if (aBillPrep && !bBillPrep) return -1;
            if (!aBillPrep && bBillPrep) return 1;

            if (!a.isPaid && b.isPaid) return -1;
            if (a.isPaid && !b.isPaid) return 1;

            return dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf();
        });
    }, [billsDueInDisplayedMonth, showPaidBills]);

    const mainTableDataSourceFiltered = useMemo(() => {
        return filteredBillsByPaidStatus.filter(bill =>
            selectedCategory === 'All' || bill.category === selectedCategory
        );
    }, [filteredBillsByPaidStatus, selectedCategory]);

    const categories = useMemo(() => {
        return [...new Set(billsDueInDisplayedMonth.map(bill => bill.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    }, [billsDueInDisplayedMonth]);

    // Event handlers
    const handleAddBill = () => setMultiModalVisible(true);
    const handleEdit = (record) => {
        setEditingBill(record);
        setIsEditModalVisible(true);
    };
    
    const handleDelete = (record) => {
        if (!record || typeof record.id === 'undefined') {
            message.error('Cannot delete bill: Invalid data.');
            return;
        }
        setBillToDelete(record);
        setDeleteModalVisible(true);
    };

    const handleTogglePaid = async (record) => {
        const markingAsPaid = !record.isPaid;
        if (markingAsPaid) {
            setFadingBillId(record.id);
            await new Promise(res => setTimeout(res, 300));
        }
        await updateBill(record, { isPaid: markingAsPaid });
        await loadBills();
        if (markingAsPaid) {
            setFadingBillId(null);
        }
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
            await loadBills();
        }
    };

    const confirmDeleteCurrent = async () => {
        if (!billToDelete) return;
        try {
            await deleteBill(billToDelete.id);
        } catch (error) {
            message.error(`Deletion error: ${error.message || 'Unknown'}`);
        } finally {
            setDeleteModalVisible(false);
            setBillToDelete(null);
            await loadBills();
        }
    };

    const confirmDeleteFuture = async () => {
        if (!billToDelete) return;
        try {
            await deleteMasterBill(billToDelete.masterId, billToDelete.dueDate);
            await loadBills();
        } catch (error) {
            message.error(`Deletion error: ${error.message || 'Unknown'}`);
        } finally {
            setDeleteModalVisible(false);
            setBillToDelete(null);
        }
    };

    const rowClassName = (record) => (record.id === fadingBillId ? 'bill-row-fade-out' : '');

    // Helper functions
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

    const getCategoryColor = (category) => {
        switch (category?.toLowerCase()) {
            case 'utilities': return { text: '#6B94D6', bg: '#F4F7FC' }; // Soft blue - lighter
            case 'rent': return { text: '#A07BB8', bg: '#F7F5FA' }; // Muted lavender - lighter
            case 'mortgage': return { text: '#C7956B', bg: '#FCF8F5' }; // Warm terracotta - lighter
            case 'groceries': return { text: '#7DB473', bg: '#F6FAF5' }; // Soft green - lighter
            case 'subscription': return { text: '#6BAFB4', bg: '#F5FAFB' }; // Teal - lighter
            case 'credit card': return { text: '#D4869A', bg: '#FBF6F8' }; // Soft rose - lighter
            case 'loan': return { text: '#C5B06B', bg: '#FCFBF5' }; // Soft gold - lighter
            case 'insurance': return { text: '#B296D4', bg: '#F8F6FB' }; // Light purple - lighter
            case 'medical': return { text: '#D4966B', bg: '#FCF7F5' }; // Soft coral - lighter
            case 'personal care': return { text: '#A096D4', bg: '#F8F6FB' }; // Periwinkle - lighter
            case 'bill prep': return { text: '#6B9FD4', bg: '#F5F8FC' }; // Steel blue - lighter
            case 'auto': return { text: '#D4B56B', bg: '#FCFAF5' }; // Soft amber - lighter
            default: return { text: '#9B9B9B', bg: '#F8F8F8' }; // iOS default gray - lighter
        }
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

    if (error && !loading) { 
        return (
            <Card style={style}>
                <Alert message="Error Loading Bills Data" description={error.message || 'Unknown error'} type="error" showIcon closable />
            </Card>
        ); 
    }

    const paidVisibleCount = billsDueInDisplayedMonth.filter(bill =>
        bill.isPaid && (selectedCategory === 'All' || bill.category === selectedCategory)
    ).length;

    return (
        <>
            <Card
                style={{...style, borderRadius: '20px', boxShadow: 'none'}}
                styles={{ body: { padding: 0 } }}
            >
                <Spin spinning={loading} tip="Loading Bills...">
                    {/* Header Section */}
                    <div style={{ padding: 'var(--space-20)', paddingBottom: 'calc(var(--space-20) * 0.1)' }}>
                        <MonthlyProgressSummary
                            loading={loading}
                            displayedMonth={overviewMonth}
                            goToPreviousMonth={() => setOverviewMonth(prev => prev.subtract(1, 'month'))}
                            goToNextMonth={() => setOverviewMonth(prev => prev.add(1, 'month'))}
                            totalBillsInDisplayedMonth={billsDueInDisplayedMonth.length}
                            paidBillsInDisplayedMonth={billsDueInDisplayedMonth.filter(b => b.isPaid).length}
                            totalAmountForAllBillsInDisplayedMonth={billsDueInDisplayedMonth.reduce((sum, bill) => (typeof bill.amount === 'number' ? sum + bill.amount : sum), 0)}
                            percentAmountPaid={billsDueInDisplayedMonth.reduce((sum, bill) => (typeof bill.amount === 'number' ? sum + bill.amount : sum), 0) > 0 ? Math.round((billsDueInDisplayedMonth.reduce((sum, bill) => (bill.isPaid && typeof bill.amount === 'number' ? sum + bill.amount : sum), 0) / billsDueInDisplayedMonth.reduce((sum, bill) => (typeof bill.amount === 'number' ? sum + bill.amount : sum), 0)) * 100) : 0}
                            totalExpensesInDisplayedMonth={billsDueInDisplayedMonth.reduce((sum, bill) => (bill.isPaid && typeof bill.amount === 'number' ? sum + bill.amount : sum), 0)}
                            totalAmountDueInDisplayedMonth={billsDueInDisplayedMonth.reduce((sum, bill) => (!bill.isPaid && typeof bill.amount === 'number' ? sum + bill.amount : sum), 0)}
                        />

                        {/* Filter Section */}
                        <div style={{ marginBottom: '20px', width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <Space align="center">
                                    <Text strong style={{ color: 'var(--neutral-600)', whiteSpace: 'nowrap' }}>Filter by:</Text>
                                    <Button
                                        size="small"
                                        type="default"
                                        className="all-categories-btn"
                                        onClick={() => setSelectedCategory('All')}
                                        style={selectedCategory === 'All' ? 
                                            { fontWeight: 600, padding: '0 10px', height: '28px', borderColor: 'var(--primary-500)', color: 'var(--primary-600)' } : 
                                            { fontWeight: 500, padding: '0 10px', height: '28px' }
                                        }
                                    >
                                        All Categories
                                    </Button>
                                </Space>
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
                            <div className="category-tags-container">
                                {categories.map((category) => (
                                    <Tag.CheckableTag
                                        key={category}
                                        checked={selectedCategory === category}
                                        onChange={(checked) => { setSelectedCategory(checked ? category : 'All'); }}
                                        style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '12px', 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '6px', 
                                            cursor: 'pointer', 
                                            border: 'none',
                                            backgroundColor: selectedCategory === category ? getCategoryColor(category).bg : 'var(--neutral-50)', 
                                            color: selectedCategory === category ? getCategoryColor(category).text : 'var(--neutral-700)', 
                                            lineHeight: '1.4', 
                                            fontSize: '0.85rem' 
                                        }}
                                    >
                                        {React.cloneElement(getCategoryIcon(category), { 
                                            size: 18,
                                            style: { 
                                                color: selectedCategory === category ? getCategoryColor(category).text : 'var(--neutral-700)' 
                                            }
                                        })} 
                                        <span>{category}</span>
                                    </Tag.CheckableTag>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Bills List */}
                    <div className="enhanced-bills-container">
                        {mainTableDataSourceFiltered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--neutral-500)' }}>
                                <Text type="secondary">No bills match the current filters for this month.</Text>
                            </div>
                        ) : (
                            mainTableDataSourceFiltered.map((record, index) => (
                                <EnhancedBillRow
                                    key={record.id || index}
                                    record={record}
                                    index={index}
                                    onTogglePaid={handleTogglePaid}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    getCategoryIcon={getCategoryIcon}
                                    getCategoryColor={getCategoryColor}
                                    renderDueIn={renderDueIn}
                                    rowClassName={rowClassName}
                                    isMobile={isSmallScreen}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            textAlign: 'center',
                            borderTop: '1px solid var(--neutral-200)',
                            padding: 'var(--space-12) var(--space-20)',
                            cursor: 'pointer'
                        }}
                        onClick={
                            billsDueInDisplayedMonth.length > 0 && paidVisibleCount > 0
                                ? () => setShowPaidBills(prev => !prev)
                                : undefined
                        }
                    >
                        {billsDueInDisplayedMonth.length > 0 && paidVisibleCount > 0 && (
                            <Button
                                type="text"
                                icon={showPaidBills ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPaidBills(prev => !prev);
                                }}
                                style={{ color: 'var(--neutral-600)' }}
                            >
                                {showPaidBills ? 'Hide Paid Bills' : 'Show All Bills'}
                            </Button>
                        )}
                    </div>
                </Spin>

                {/* Modals */}
                {isEditModalVisible && (
                    <EditBillModal
                        open={isEditModalVisible}
                        onCancel={() => { setIsEditModalVisible(false); setEditingBill(null); }}
                        onSubmit={handleModalSubmit}
                        bill={editingBill}
                    />
                )}
            </Card>

            {isMultiModalVisible && (
                <MultiBillModal
                    open={isMultiModalVisible}
                    onClose={() => setMultiModalVisible(false)}
                    onBillsAdded={loadBills}
                />
            )}

            {isDeleteModalVisible && (
                <DeleteBillModal
                    open={isDeleteModalVisible}
                    bill={billToDelete}
                    onCancel={() => { setDeleteModalVisible(false); setBillToDelete(null); }}
                    onDeleteCurrent={confirmDeleteCurrent}
                    onDeleteFuture={confirmDeleteFuture}
                />
            )}
        </>
    );
};

export default CombinedBillsOverview;