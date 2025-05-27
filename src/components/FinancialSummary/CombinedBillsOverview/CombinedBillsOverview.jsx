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
import EditBillModal from '../../BillsList/EditBillModal';
import MultiBillModal from './MultiBillModal';
import MonthlyProgressSummary from './MonthlyProgressSummary';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBetween from 'dayjs/plugin/isBetween';

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
            {/* Slide Actions Background - Always present but hidden */}
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
                        <Text strong className="bill-name">{record.name}</Text>
                        <Text strong className="bill-amount">
                            ${Number(record.amount).toLocaleString('en-US', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                            })}
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
                        )}
                        <div className="bill-due-status">
                            {renderDueIn(record.dueDate, record)}
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
        loading, error, deleteBill, updateBill, updateBillWithFuture, addBill,
        displayedMonth, goToPreviousMonth, goToNextMonth, bills,
    } = useContext(FinanceContext);
    
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isMultiModalVisible, setMultiModalVisible] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showPaidBills, setShowPaidBills] = useState(false);
    const [fadingBillId, setFadingBillId] = useState(null);

    const screens = useBreakpoint();
    const isSmallScreen = screens.xs || screens.sm;

    // Data processing logic
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
        const allBills = showPaidBills 
            ? billsDueInDisplayedMonth 
            : billsDueInDisplayedMonth.filter(bill => !bill.isPaid);
        
        // Sort bills: unpaid first, then paid (maintaining original order within each group)
        return allBills.sort((a, b) => {
            // If one is paid and the other isn't, unpaid comes first
            if (a.isPaid !== b.isPaid) {
                return a.isPaid ? 1 : -1;
            }
            // If both have same paid status, maintain original order (by due date)
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
    
    const handleDelete = async (record) => {
        if (!record || typeof record.id === 'undefined') { 
            message.error('Cannot delete bill: Invalid data.'); 
            return; 
        }
        try { 
            await deleteBill(record.id); 
        } catch (error) { 
            message.error(`Deletion error: ${error.message || 'Unknown'}`); 
        }
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
            case 'utilities': return { text: '#6B7D8F', bg: '#F8FAFC' }; // Subtle slate blue
            case 'rent': return { text: '#8B7CA3', bg: '#F9F8FB' }; // Muted lavender
            case 'mortgage': return { text: '#A3856B', bg: '#FBF9F7' }; // Warm taupe
            case 'groceries': return { text: '#7A9B76', bg: '#F8FBF8' }; // Soft sage
            case 'subscription': return { text: '#6B9499', bg: '#F7FAFB' }; // Muted teal
            case 'credit card': return { text: '#B5838B', bg: '#FCF8F9' }; // Dusty rose
            case 'loan': return { text: '#A89B6B', bg: '#FCFBF7' }; // Soft olive
            case 'insurance': return { text: '#9486A3', bg: '#FAF9FB' }; // Light mauve
            case 'medical': return { text: '#B58A6B', bg: '#FCF9F7' }; // Warm beige
            case 'personal care': return { text: '#8F8BA3', bg: '#FAF9FB' }; // Soft periwinkle
            case 'bill prep': return { text: '#7085A3', bg: '#F8F9FB' }; // Muted steel
            case 'auto': return { text: '#A3936B', bg: '#FCFAF7' }; // Soft amber
            default: return { text: '#8E8E93', bg: '#F7F7F7' }; // iOS default gray
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
                            displayedMonth={displayedMonth}
                            goToPreviousMonth={goToPreviousMonth}
                            goToNextMonth={goToNextMonth}
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
                                            size: 16,
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
                    {billsDueInDisplayedMonth.length > 0 && paidVisibleCount > 0 && (
                        <div style={{ 
                            textAlign: 'center', 
                            borderTop: '1px solid var(--neutral-200)',
                            padding: 'var(--space-12) var(--space-20)'
                        }}>
                            <Button
                                type="text"
                                icon={showPaidBills ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                                onClick={() => setShowPaidBills(prev => !prev)}
                                style={{ color: 'var(--neutral-600)' }}
                            >
                                {showPaidBills ? 'Hide Paid Bills' : 'Show All Bills'}
                            </Button>
                        </div>
                    )}
                </Spin>

                {/* Modals */}
                {isEditModalVisible && (
                    <EditBillModal
                        open={isEditModalVisible}
                        onCancel={() => { setIsEditModalVisible(false); setEditingBill(null); }}
                        onSubmit={handleModalSubmit}
                        initialData={editingBill}
                    />
                )}
            </Card>

            {isMultiModalVisible && (
                <MultiBillModal
                    open={isMultiModalVisible}
                    onClose={() => setMultiModalVisible(false)}
                />
            )}

            {/* Enhanced Styles */}
            <style jsx global>{`
                /* Enhanced Bills Container */
                .enhanced-bills-container {
                    display: flex;
                    flex-direction: column;
                    margin-top: 16px;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                }

                /* Enhanced Bill Row */
                .enhanced-bill-row {
                    position: relative;
                    display: flex;
                    align-items: stretch;
                    background: white;
                    border-radius: 0;
                    border: none;
                    border-bottom: 1px solid var(--neutral-100);
                    overflow: hidden;
                    user-select: none;
                    -webkit-user-select: none;
                    min-height: 64px;
                }

                .enhanced-bill-row:hover {
                    background-color: var(--neutral-50);
                }

                .enhanced-bill-row:last-child {
                    border-bottom: none;
                }

                /* Slide Actions Background - Always positioned behind content */
                .slide-actions-background {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    width: 140px;
                    display: flex;
                    z-index: 1;
                    background: transparent;
                }

                .slide-action {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    gap: 2px;
                    min-height: 100%;
                    outline: none;
                }

                .slide-action:active {
                    transform: scale(0.95);
                }

                .edit-action {
                    background: linear-gradient(135deg, #007AFF, #0056CC);
                }

                .edit-action:hover {
                    background: linear-gradient(135deg, #0056CC, #003D99);
                }

                .delete-action {
                    background: linear-gradient(135deg, #FF3B30, #D70015);
                }

                .delete-action:hover {
                    background: linear-gradient(135deg, #D70015, #B30000);
                }

                /* Bill Row Content - This is what slides */
                .bill-row-content {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 28px;
                    width: 100%;
                    background: white;
                    z-index: 2;
                    min-height: 64px;
                    touch-action: pan-y; /* Allow vertical scrolling but handle horizontal ourselves */
                }

                .bill-checkbox {
                    flex-shrink: 0;
                }

                .bill-content {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
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
                    flex-shrink: 0;
                }

                /* Fade animation for bill completion */
                .bill-row-fade-out {
                    opacity: 0.5;
                    transform: scale(0.98);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Mobile optimizations */
                @media (max-width: 768px) {
                    .enhanced-bills-container {
                        margin-top: 12px;
                        border-radius: 0;
                    }

                    .bill-row-content {
                        padding: 14px 24px;
                        gap: 12px;
                        min-height: 60px;
                    }

                    .enhanced-bill-row {
                        min-height: 60px;
                    }

                    .bill-content {
                        gap: 4px;
                    }

                    .bill-main-row {
                        gap: 8px;
                    }

                    .bill-name {
                        font-size: 13px;
                    }

                    .bill-amount {
                        font-size: 13px;
                    }

                    .bill-due-status {
                        font-size: 11px;
                        padding: 1px 4px;
                    }

                    /* Slide actions mobile optimization */
                    .slide-actions-background {
                        width: 120px;
                    }

                    .slide-action {
                        font-size: 10px;
                        gap: 1px;
                    }
                }

                /* Accessibility enhancements */
                @media (prefers-reduced-motion: reduce) {
                    .enhanced-bill-row,
                    .slide-action,
                    .bill-row-content {
                        transition: none;
                    }
                }

                @media (prefers-contrast: high) {
                    .enhanced-bill-row {
                        border: 2px solid var(--neutral-300);
                    }

                    .slide-action {
                        border: 2px solid rgba(255, 255, 255, 0.5);
                    }

                    .edit-action {
                        background: #0066CC;
                    }

                    .delete-action {
                        background: #CC0000;
                    }
                }

                /* Dark mode preparation */
                @media (prefers-color-scheme: dark) {
                    .enhanced-bill-row {
                        background: var(--neutral-900);
                        border-bottom-color: var(--neutral-800);
                    }

                    .bill-row-content {
                        background: var(--neutral-900);
                    }

                    .enhanced-bill-row:hover {
                        background-color: var(--neutral-800);
                    }

                    .enhanced-bill-row:hover .bill-row-content {
                        background-color: var(--neutral-800);
                    }

                    .bill-name,
                    .bill-amount {
                        color: var(--neutral-100);
                    }

                    .bill-due-status {
                        background-color: var(--neutral-800);
                        color: var(--neutral-300);
                    }
                }

                /* Focus states for keyboard navigation */
                .enhanced-bill-row:focus-within {
                    outline: 2px solid var(--primary-500);
                    outline-offset: 2px;
                }

                .slide-action:focus {
                    outline: 2px solid rgba(255, 255, 255, 0.8);
                    outline-offset: -2px;
                }

                /* Performance optimizations */
                .enhanced-bill-row {
                    contain: layout style;
                }

                .bill-row-content {
                    contain: layout style paint;
                    will-change: transform;
                }

                .slide-actions-background {
                    contain: layout style paint;
                }

                /* Ensure proper stacking contexts */
                .enhanced-bills-container {
                    isolation: isolate;
                }

                .enhanced-bill-row {
                    isolation: isolate;
                }
            `}</style>
        </>
    );
};

export default CombinedBillsOverview;