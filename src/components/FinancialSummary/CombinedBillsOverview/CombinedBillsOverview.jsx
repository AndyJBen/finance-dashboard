import React, { useState, useContext, useMemo } from 'react';
import {
    Card, Button, Space, Tooltip, Checkbox, Tag, 
    Progress, Typography, Row, Col, Statistic, 
    Modal, Dropdown, Grid, Badge
} from 'antd';
import {
    IconCalendarFilled, IconEdit, IconTrash, IconPlus, IconChevronLeft,
    IconChevronRight, IconHome, IconBolt, IconWifi, IconCreditCard, 
    IconCar, IconShoppingCart, IconHelp, IconCalendar, IconCurrencyDollar, 
    IconCircleCheck, IconClock, IconCertificate, IconMedicineSyrup, 
    IconCalendarTime, IconUser, IconDotsVertical, IconChevronDown,
    IconChevronUp, IconEye, IconEyeOff, IconTrendingUp, IconAlertTriangle,
    IconSparkles, IconZap
} from '@tabler/icons-react';
import dayjs from 'dayjs';

const { Text } = Typography;
const { useBreakpoint } = Grid;

// Mock context for demonstration
const FinanceContext = React.createContext({
    loading: false,
    bills: [
        { id: 1, name: 'Electric Bill', amount: 156.78, dueDate: '2025-01-28', category: 'Utilities', isPaid: false, isRecurring: true },
        { id: 2, name: 'Rent Payment', amount: 1850.00, dueDate: '2025-01-31', category: 'Rent', isPaid: true, isRecurring: true },
        { id: 3, name: 'Phone Bill', amount: 89.99, dueDate: '2025-01-25', category: 'Utilities', isPaid: false, isRecurring: true },
        { id: 4, name: 'Grocery Shopping', amount: 245.33, dueDate: '2025-01-20', category: 'Groceries', isPaid: true, isRecurring: false },
        { id: 5, name: 'Internet Service', amount: 79.99, dueDate: '2025-01-15', category: 'Utilities', isPaid: false, isRecurring: true },
    ],
    displayedMonth: dayjs(),
    updateBill: () => {},
    deleteBill: () => {},
});

// 2025 Design System Tokens
const designTokens = {
    // Depth & Elevation
    elevation: {
        surface: '0 1px 3px rgba(0, 0, 0, 0.04), 0 0 1px rgba(0, 0, 0, 0.02)',
        raised: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)',
        floating: '0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
        overlay: '0 16px 48px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08)'
    },
    // Advanced Color Psychology
    semantic: {
        success: { base: '#10B981', surface: '#ECFDF5', accent: '#065F46' },
        warning: { base: '#F59E0B', surface: '#FFFBEB', accent: '#92400E' },
        danger: { base: '#EF4444', surface: '#FEF2F2', accent: '#991B1B' },
        info: { base: '#3B82F6', surface: '#EFF6FF', accent: '#1E40AF' },
        neutral: { base: '#6B7280', surface: '#F9FAFB', accent: '#374151' }
    },
    // Motion
    motion: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
    },
    // Spacing with Golden Ratio
    space: {
        xs: '4px', sm: '8px', md: '12px', lg: '20px', xl: '32px', xxl: '52px'
    }
};

// Helper Functions
const getCategoryIcon = (category) => {
    const iconMap = {
        'utilities': <IconBolt size={16} />,
        'rent': <IconHome size={16} />,
        'groceries': <IconShoppingCart size={16} />,
        'phone': <IconCreditCard size={16} />,
        'internet': <IconWifi size={16} />
    };
    return iconMap[category?.toLowerCase()] || <IconHelp size={16} />;
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

const getUrgencyLevel = (dueDate, isPaid) => {
    if (isPaid) return 'completed';
    const days = dayjs(dueDate).diff(dayjs(), 'day');
    if (days < 0) return 'overdue';
    if (days <= 3) return 'urgent';
    if (days <= 7) return 'warning';
    return 'normal';
};

// Novel Component: Smart Bill Card
const SmartBillCard = ({ bill, onEdit, onDelete, onTogglePaid, compact = false }) => {
    const urgency = getUrgencyLevel(bill.dueDate, bill.isPaid);
    const [isExpanded, setIsExpanded] = useState(false);
    
    const urgencyStyles = {
        completed: { 
            bg: designTokens.semantic.success.surface, 
            border: designTokens.semantic.success.base,
            accent: designTokens.semantic.success.accent
        },
        overdue: { 
            bg: designTokens.semantic.danger.surface, 
            border: designTokens.semantic.danger.base,
            accent: designTokens.semantic.danger.accent
        },
        urgent: { 
            bg: designTokens.semantic.warning.surface, 
            border: designTokens.semantic.warning.base,
            accent: designTokens.semantic.warning.accent
        },
        warning: { 
            bg: designTokens.semantic.info.surface, 
            border: designTokens.semantic.info.base,
            accent: designTokens.semantic.info.accent
        },
        normal: { 
            bg: designTokens.semantic.neutral.surface, 
            border: 'transparent',
            accent: designTokens.semantic.neutral.accent
        }
    };

    const style = urgencyStyles[urgency];

    return (
        <div
            style={{
                backgroundColor: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: '16px',
                padding: compact ? '12px 16px' : '16px 20px',
                marginBottom: '8px',
                transition: `all 300ms ${designTokens.motion.spring}`,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isExpanded ? designTokens.elevation.raised : designTokens.elevation.surface,
                transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
            }}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            {/* Urgency Indicator */}
            {urgency !== 'normal' && (
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        background: `linear-gradient(180deg, ${style.border}, ${style.accent})`,
                        borderRadius: '0 4px 4px 0'
                    }}
                />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Smart Checkbox with Animation */}
                <div
                    style={{
                        position: 'relative',
                        transform: bill.isPaid ? 'scale(1.1)' : 'scale(1)',
                        transition: `transform 200ms ${designTokens.motion.spring}`
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        checked={bill.isPaid}
                        onChange={() => onTogglePaid(bill)}
                        style={{
                            transform: bill.isPaid ? 'rotate(360deg)' : 'rotate(0deg)',
                            transition: `transform 500ms ${designTokens.motion.spring}`
                        }}
                    />
                    {bill.isPaid && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '-2px',
                                right: '-2px',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: designTokens.semantic.success.base,
                                animation: 'pulse 2s infinite'
                            }}
                        />
                    )}
                </div>

                {/* Category Icon with Glow Effect */}
                <div
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: designTokens.elevation.surface,
                        position: 'relative'
                    }}
                >
                    {getCategoryIcon(bill.category)}
                    {urgency === 'urgent' && (
                        <div
                            style={{
                                position: 'absolute',
                                inset: '-2px',
                                borderRadius: '14px',
                                background: `linear-gradient(45deg, ${designTokens.semantic.warning.base}40, transparent)`,
                                animation: 'glow 2s ease-in-out infinite alternate'
                            }}
                        />
                    )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <Text strong style={{ fontSize: '16px', color: style.accent }}>
                                {bill.name}
                            </Text>
                            <div style={{ marginTop: '2px' }}>
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                    Due {dayjs(bill.dueDate).format('MMM D')}
                                </Text>
                                {bill.isRecurring && (
                                    <Badge
                                        count="Recurring"
                                        style={{
                                            backgroundColor: designTokens.semantic.info.base,
                                            marginLeft: '8px',
                                            fontSize: '10px',
                                            height: '18px',
                                            lineHeight: '18px'
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                            <Text
                                strong
                                style={{
                                    fontSize: '18px',
                                    color: bill.isPaid ? designTokens.semantic.success.base : style.accent,
                                    fontFeatureSettings: '"tnum"' // Tabular numbers
                                }}
                            >
                                {formatCurrency(bill.amount)}
                            </Text>
                            {urgency === 'overdue' && (
                                <div style={{ marginTop: '2px' }}>
                                    <IconAlertTriangle size={14} style={{ color: designTokens.semantic.danger.base }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expandable Actions */}
                {isExpanded && (
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            opacity: isExpanded ? 1 : 0,
                            transform: isExpanded ? 'translateX(0)' : 'translateX(20px)',
                            transition: `all 200ms ${designTokens.motion.smooth}`
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            type="text"
                            size="small"
                            icon={<IconEdit size={16} />}
                            onClick={() => onEdit(bill)}
                            style={{ borderRadius: '8px' }}
                        />
                        <Button
                            type="text"
                            size="small"
                            danger
                            icon={<IconTrash size={16} />}
                            onClick={() => onDelete(bill)}
                            style={{ borderRadius: '8px' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Component
const CombinedBillsOverview = ({ style }) => {
    const { loading, bills, displayedMonth, updateBill, deleteBill } = useContext(FinanceContext);
    const [showPaidBills, setShowPaidBills] = useState(false);
    const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'compact'
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const filteredBills = useMemo(() => {
        return showPaidBills ? bills : bills.filter(bill => !bill.isPaid);
    }, [bills, showPaidBills]);

    const stats = useMemo(() => {
        const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
        const paid = bills.filter(b => b.isPaid).reduce((sum, bill) => sum + bill.amount, 0);
        const remaining = total - paid;
        const progress = total > 0 ? Math.round((paid / total) * 100) : 0;
        const overdue = bills.filter(b => !b.isPaid && dayjs(b.dueDate).isBefore(dayjs())).length;
        
        return { total, paid, remaining, progress, overdue };
    }, [bills]);

    const handleTogglePaid = (bill) => {
        updateBill(bill, { isPaid: !bill.isPaid });
    };

    return (
        <Card
            style={{
                ...style,
                borderRadius: '24px',
                border: 'none',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: designTokens.elevation.floating,
                overflow: 'hidden'
            }}
        >
            {/* Header with Glass Morphism */}
            <div
                style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px 20px 0 0',
                    padding: '24px',
                    marginBottom: '20px',
                    position: 'relative'
                }}
            >
                {/* Decorative Elements */}
                <div
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '20px',
                        width: '60px',
                        height: '60px',
                        background: `linear-gradient(45deg, ${designTokens.semantic.info.base}20, ${designTokens.semantic.success.base}20)`,
                        borderRadius: '50%',
                        filter: 'blur(20px)',
                        opacity: 0.6
                    }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <IconCalendarFilled size={24} style={{ color: designTokens.semantic.info.base }} />
                            <Text strong style={{ fontSize: '24px', fontWeight: 700 }}>
                                {displayedMonth.format('MMMM YYYY')}
                            </Text>
                            {stats.overdue > 0 && (
                                <Badge
                                    count={`${stats.overdue} overdue`}
                                    style={{
                                        backgroundColor: designTokens.semantic.danger.base,
                                        animation: 'pulse 2s infinite'
                                    }}
                                />
                            )}
                        </div>
                        <Text type="secondary" style={{ fontSize: '16px' }}>
                            {filteredBills.length} bills • {formatCurrency(stats.remaining)} remaining
                        </Text>
                    </div>

                    {/* Smart Controls */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Tooltip title={showPaidBills ? 'Hide paid bills' : 'Show paid bills'}>
                            <Button
                                type="text"
                                icon={showPaidBills ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                onClick={() => setShowPaidBills(!showPaidBills)}
                                style={{
                                    borderRadius: '12px',
                                    background: showPaidBills ? designTokens.semantic.success.surface : 'transparent'
                                }}
                            />
                        </Tooltip>
                        
                        <Tooltip title="Add new bill">
                            <Button
                                type="primary"
                                icon={<IconPlus size={18} />}
                                style={{
                                    borderRadius: '12px',
                                    background: `linear-gradient(135deg, ${designTokens.semantic.info.base}, ${designTokens.semantic.info.accent})`,
                                    border: 'none',
                                    boxShadow: designTokens.elevation.raised
                                }}
                            >
                                {!isMobile && 'Add Bill'}
                            </Button>
                        </Tooltip>
                    </div>
                </div>

                {/* Progress Visualization */}
                <div
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '16px',
                        boxShadow: designTokens.elevation.surface
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <Text strong>Payment Progress</Text>
                        <Text strong style={{ color: designTokens.semantic.success.base }}>
                            {stats.progress}%
                        </Text>
                    </div>
                    
                    <Progress
                        percent={stats.progress}
                        strokeColor={{
                            '0%': designTokens.semantic.info.base,
                            '100%': designTokens.semantic.success.base,
                        }}
                        trailColor={designTokens.semantic.neutral.surface}
                        strokeWidth={8}
                        style={{ marginBottom: '12px' }}
                    />
                    
                    <Row gutter={16}>
                        <Col span={8}>
                            <Statistic
                                title="Paid"
                                value={formatCurrency(stats.paid)}
                                valueStyle={{ color: designTokens.semantic.success.base, fontSize: '16px' }}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Remaining"
                                value={formatCurrency(stats.remaining)}
                                valueStyle={{ color: designTokens.semantic.warning.base, fontSize: '16px' }}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Total"
                                value={formatCurrency(stats.total)}
                                valueStyle={{ fontSize: '16px' }}
                            />
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Bills List */}
            <div style={{ padding: '0 24px 24px' }}>
                {filteredBills.length === 0 ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: designTokens.semantic.neutral.surface,
                            borderRadius: '16px'
                        }}
                    >
                        <IconSparkles size={48} style={{ color: designTokens.semantic.info.base, marginBottom: '16px' }} />
                        <Text strong style={{ display: 'block', fontSize: '18px', marginBottom: '8px' }}>
                            {showPaidBills ? 'All caught up!' : 'No pending bills'}
                        </Text>
                        <Text type="secondary">
                            {showPaidBills ? 'All your bills are paid this month.' : 'Add your first bill to get started.'}
                        </Text>
                    </div>
                ) : (
                    <div>
                        {filteredBills.map(bill => (
                            <SmartBillCard
                                key={bill.id}
                                bill={bill}
                                onEdit={() => console.log('Edit', bill)}
                                onDelete={() => console.log('Delete', bill)}
                                onTogglePaid={handleTogglePaid}
                                compact={isMobile}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                @keyframes glow {
                    0% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
                
                /* Smooth scroll behavior */
                * {
                    scroll-behavior: smooth;
                }
                
                /* Enhanced touch targets for mobile */
                @media (max-width: 768px) {
                    button {
                        min-height: 44px;
                        min-width: 44px;
                    }
                }
            `}</style>
        </Card>
    );
};

export default CombinedBillsOverview;