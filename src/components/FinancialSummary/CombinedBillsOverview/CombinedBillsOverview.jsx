// src/components/FinancialSummary/CombinedBillsOverview/CombinedBillsOverview.jsx
import React, { useState, useContext, useMemo, useRef, useCallback } from 'react';
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

// Extend dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBeforePlugin);

const { Text } = Typography;
const { useBreakpoint } = Grid;

// Enhanced Bill Row Component with Haptic Interactions
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
    const [isLongPressing, setIsLongPressing] = useState(false);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [slideOffset, setSlideOffset] = useState(0);
    const [isSliding, setIsSliding] = useState(false);
    
    const longPressTimer = useRef(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const slideThreshold = 80; // Pixels to trigger action
    const longPressThreshold = 500; // ms for long press

    // Haptic feedback simulation (would use real haptics on device)
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

    // Long press handlers
    const handleTouchStart = useCallback((e) => {
        if (!isMobile) return;
        
        const touch = e.touches[0];
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
        
        // Start long press timer
        longPressTimer.current = setTimeout(() => {
            setIsLongPressing(true);
            setShowContextMenu(true);
            triggerHaptic('medium');
        }, longPressThreshold);
    }, [isMobile, triggerHaptic]);

    const handleTouchMove = useCallback((e) => {
        if (!isMobile) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX.current;
        const deltaY = touch.clientY - touchStartY.current;
        
        // Cancel long press if user moves too much
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            clearTimeout(longPressTimer.current);
            setIsLongPressing(false);
        }
        
        // Handle horizontal slide for quick actions
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
            setIsSliding(true);
            setSlideOffset(Math.max(-120, Math.min(0, deltaX)));
            
            // Haptic feedback at threshold
            if (Math.abs(deltaX) > slideThreshold && !isSliding) {
                triggerHaptic('light');
            }
        }
    }, [isMobile, triggerHaptic, isSliding]);

    const handleTouchEnd = useCallback((e) => {
        if (!isMobile) return;
        
        clearTimeout(longPressTimer.current);
        setIsLongPressing(false);
        
        // Handle slide actions
        if (Math.abs(slideOffset) > slideThreshold) {
            if (slideOffset < -slideThreshold) {
                // Slide left reveals delete action
                triggerHaptic('heavy');
                onDelete(record);
            }
        }
        
        // Reset slide
        setSlideOffset(0);
        setIsSliding(false);
    }, [isMobile, slideOffset, onDelete, record, triggerHaptic]);

    // Mouse handlers for desktop
    const handleMouseDown = useCallback((e) => {
        if (isMobile) return;
        
        longPressTimer.current = setTimeout(() => {
            setShowContextMenu(true);
        }, longPressThreshold);
    }, [isMobile]);

    const handleMouseUp = useCallback(() => {
        clearTimeout(longPressTimer.current);
    }, []);

    // Context menu items
    const contextMenuItems = [
        {
            key: 'edit',
            icon: <IconEdit size={20} style={{ color: '#007AFF' }} />,
            label: 'Edit Bill',
            onClick: () => {
                onEdit(record);
                setShowContextMenu(false);
            }
        },
        {
            key: 'delete',
            icon: <IconTrash size={20} style={{ color: '#FF3B30' }} />,
            label: 'Delete Bill',
            onClick: () => {
                onDelete(record);
                setShowContextMenu(false);
            }
        }
    ];

    return (
        <>
            <div 
                key={record.id || index} 
                className={`enhanced-bill-row ${rowClassName ? rowClassName(record) : ''} ${isLongPressing ? 'long-pressing' : ''}`}
                style={{
                    transform: `translateX(${slideOffset}px)`,
                    transition: isSliding ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Slide Action Background */}
                {isMobile && (
                    <div className="slide-action-background">
                        <div className="slide-action delete-action">
                            <IconTrash size={24} />
                            <span>Delete</span>
                        </div>
                    </div>
                )}

                {/* Main Row Content */}
                <div className="bill-row-content">
                    {/* Checkbox */}
                    <div className="bill-checkbox">
                        <Checkbox 
                            className={`status-checkbox small-checkbox ${record.isPaid ? 'checked' : ''}`} 
                            checked={record.isPaid} 
                            onChange={() => onTogglePaid(record)} 
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
                                        {React.cloneElement(getCategoryIcon(record.category), { size: 14 })}
                                    </span>
                                    <span style={{ 
                                        color: getCategoryColor(record.category) === 'default' 
                                            ? 'var(--neutral-600)' 
                                            : `var(--${getCategoryColor(record.category)}-600)` 
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

                {/* Long Press Blur Overlay */}
                {isLongPressing && (
                    <div className="long-press-overlay" />
                )}
            </div>

            {/* Context Menu Modal */}
            <Modal
                open={showContextMenu}
                footer={null}
                closable={false}
                centered
                width={280}
                bodyStyle={{ padding: 0 }}
                maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                onCancel={() => setShowContextMenu(false)}
                className="context-menu-modal"
            >
                <div className="context-menu-content">
                    <div className="context-menu-header">
                        <Text strong style={{ fontSize: '16px' }}>{record.name}</Text>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                            ${Number(record.amount).toFixed(2)}
                        </Text>
                    </div>
                    <div className="context-menu-actions">
                        {contextMenuItems.map(item => (
                            <div 
                                key={item.key}
                                className="context-menu-item"
                                onClick={item.onClick}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </>
    );
};

// Main Component (keeping original logic, just updating the bills list section)
const CombinedBillsOverview = ({ style }) => {
    const {
        loading, error, deleteBill, updateBill, updateBillWithFuture, addBill,
        displayedMonth, goToPreviousMonth, goToNextMonth, bills,
    } = useContext(FinanceContext);
    
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isMultiModalVisible, setMultiModalVisible] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isTableCollapsed, setIsTableCollapsed] = useState(false);
    const [showPaidBills, setShowPaidBills] = useState(false);
    const [fadingBillId, setFadingBillId] = useState(null);

    const screens = useBreakpoint();
    const isSmallScreen = screens.xs || screens.sm;

    // All the existing logic remains the same...
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

    // ... (all other computed values remain the same)

    const tableDataSource = isTableCollapsed ? [] : mainTableDataSourceFiltered;

    // Event handlers remain the same...
    const handleAddBill = () => setMultiModalVisible(true);
    const handleEdit = (record) => {
        setEditingBill(record);
        setIsEditModalVisible(true);
    };
    
    // ... (all other handlers remain the same)

    // Helper functions remain the same...
    const getCategoryIcon = (category) => {
        const lowerCategory = category?.toLowerCase() || '';
        if (lowerCategory.includes('rent') || lowerCategory.includes('mortgage')) return <IconHome size={16} />;
        if (lowerCategory.includes('electric') || lowerCategory.includes('utilit')) return <IconBolt size={16} />;
        // ... (rest of the function remains the same)
        return <IconHelp size={16} />;
    };

    const getCategoryColor = (category) => {
        switch (category?.toLowerCase()) {
            case 'utilities': return 'blue';
            case 'rent': return 'purple';
            // ... (rest remains the same)
            default: return 'default';
        }
    };

    const renderDueIn = (dueDate, record) => {
        // ... (function remains the same)
        if (record.isPaid) {
            return <span style={{ color: 'var(--neutral-400)' }}>-</span>;
        }
        // ... (rest of function logic)
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

    const rowClassName = (record) => (record.id === fadingBillId ? 'bill-row-fade-out' : '');

    // ... (rest of the component logic remains the same)

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
                                            backgroundColor: selectedCategory === category ? 'var(--primary-50)' : 'var(--neutral-50)', 
                                            color: selectedCategory === category ? 'var(--primary-600)' : 'var(--neutral-700)', 
                                            lineHeight: '1.4', 
                                            fontSize: '0.85rem' 
                                        }}
                                    >
                                        {getCategoryIcon(category)} <span>{category}</span>
                                    </Tag.CheckableTag>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Bills List */}
                    {!isTableCollapsed && (
                        <div className="enhanced-bills-container">
                            {tableDataSource.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--neutral-500)' }}>
                                    <Text type="secondary">No bills match the current filters for this month.</Text>
                                </div>
                            ) : (
                                tableDataSource.map((record, index) => (
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
                    )}

                    {/* Footer */}
                    {!isTableCollapsed && billsDueInDisplayedMonth.length > 0 && paidVisibleCount > 0 && (
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

                {/* Modals remain the same */}
                {isEditModalVisible && (
                    <EditBillModal
                        open={isEditModalVisible}
                        onCancel={() => { setIsEditModalVisible(false); setEditingBill(null); }}
                        onSubmit={async (values) => {
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
                            if (result) { setIsEditModalVisible(false); setEditingBill(null); }
                        }}
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
                    align-items: center;
                    background: white;
                    border-radius: 0;
                    border: none;
                    border-bottom: 1px solid var(--neutral-100);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    user-select: none;
                    -webkit-user-select: none;
                }

                .enhanced-bill-row:hover {
                    background-color: var(--neutral-50);
                }

                .enhanced-bill-row:last-child {
                    border-bottom: none;
                }

                /* Long Press State */
                .enhanced-bill-row.long-pressing {
                    transform: scale(0.98);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    z-index: 10;
                }

                /* Long Press Blur Overlay */
                .long-press-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(4px);
                    z-index: 5;
                    border-radius: inherit;
                }

                /* Slide Action Background */
                .slide-action-background {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    width: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                }

                .slide-action {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    width: 80px;
                    color: white;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .slide-action.delete-action {
                    background: linear-gradient(135deg, #FF3B30, #D70015);
                }

                /* Bill Row Content */
                .bill-row-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    width: 100%;
                    background: inherit;
                    z-index: 2;
                    position: relative;
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

                /* Context Menu Modal */
                .context-menu-modal .ant-modal-content {
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .context-menu-modal .ant-modal-body {
                    padding: 0;
                }

                .context-menu-content {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                }

                .context-menu-header {
                    padding: 20px 20px 16px 20px;
                    text-align: center;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8));
                }

                .context-menu-actions {
                    padding: 8px 0;
                }

                .context-menu-item {
                    display: flex;
                    align-items: center;
                    padding: 16px 20px;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    gap: 16px;
                    font-size: 16px;
                    font-weight: 500;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
                }

                .context-menu-item:last-child {
                    border-bottom: none;
                }

                .context-menu-item:hover {
                    background: rgba(0, 0, 0, 0.04);
                    transform: translateX(4px);
                }

                .context-menu-item:active {
                    transform: translateX(2px);
                    background: rgba(0, 0, 0, 0.08);
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
                        padding: 14px 16px;
                        gap: 12px;
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

                    /* Enhanced touch targets */
                    .enhanced-bill-row {
                        min-height: 64px;
                    }

                    /* Slide action responsiveness */
                    .slide-action-background {
                        width: 100px;
                    }

                    .slide-action {
                        width: 70px;
                        font-size: 11px;
                    }

                    /* Context menu mobile optimization */
                    .context-menu-modal {
                        margin: 0;
                        max-width: 100vw;
                    }

                    .context-menu-modal .ant-modal-content {
                        margin: 16px;
                        border-radius: 16px;
                    }

                    .context-menu-item {
                        padding: 18px 20px;
                        font-size: 17px;
                    }
                }

                /* Accessibility enhancements */
                @media (prefers-reduced-motion: reduce) {
                    .enhanced-bill-row,
                    .context-menu-item,
                    .bill-row-content {
                        transition: none;
                    }
                }

                /* High contrast mode support */
                @media (prefers-contrast: high) {
                    .enhanced-bill-row {
                        border: 2px solid var(--neutral-300);
                    }

                    .context-menu-content {
                        background: white;
                        backdrop-filter: none;
                    }

                    .context-menu-item {
                        border-bottom: 2px solid var(--neutral-200);
                    }
                }

                /* Dark mode preparation */
                @media (prefers-color-scheme: dark) {
                    .enhanced-bill-row {
                        background: var(--neutral-900);
                        border-bottom-color: var(--neutral-800);
                    }

                    .enhanced-bill-row:hover {
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

                    .context-menu-content {
                        background: rgba(30, 30, 30, 0.95);
                    }

                    .context-menu-header {
                        background: linear-gradient(135deg, rgba(40, 40, 40, 0.8), rgba(30, 30, 30, 0.8));
                        border-bottom-color: rgba(255, 255, 255, 0.1);
                    }

                    .context-menu-item {
                        color: var(--neutral-100);
                        border-bottom-color: rgba(255, 255, 255, 0.1);
                    }

                    .context-menu-item:hover {
                        background: rgba(255, 255, 255, 0.1);
                    }
                }

                /* Focus states for keyboard navigation */
                .enhanced-bill-row:focus-within {
                    outline: 2px solid var(--primary-500);
                    outline-offset: 2px;
                }

                .context-menu-item:focus {
                    outline: 2px solid var(--primary-500);
                    outline-offset: -2px;
                    background: rgba(0, 122, 255, 0.1);
                }

                /* Animation for context menu appearance */
                .context-menu-modal .ant-modal-content {
                    animation: contextMenuSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes contextMenuSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                /* Haptic feedback visual cues */
                .enhanced-bill-row.haptic-feedback {
                    animation: hapticPulse 0.15s ease-out;
                }

                @keyframes hapticPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }

                /* Slide threshold indicator */
                .enhanced-bill-row[data-slide-threshold="true"] {
                    box-shadow: inset -4px 0 0 #FF3B30;
                }

                /* Performance optimizations */
                .enhanced-bill-row {
                    contain: layout style paint;
                    will-change: transform;
                }

                .context-menu-content {
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