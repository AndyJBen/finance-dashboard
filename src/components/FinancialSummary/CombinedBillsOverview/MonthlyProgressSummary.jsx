// src/components/FinancialSummary/CombinedBillsOverview/MonthlyProgressSummary.jsx

import React from 'react';
import {
    Button, Tooltip, Progress, Typography, Row, Col, Statistic, Grid
} from 'antd';
import {
    IconCalendarFilled, IconChevronLeft, IconChevronRight
} from '@tabler/icons-react';
import dayjs from 'dayjs';

// Use Typography components directly
const { Text, Title, Paragraph } = Typography;
const { useBreakpoint } = Grid; // Import the hook

const MonthlyProgressSummary = ({
    loading,
    displayedMonth,
    goToPreviousMonth,
    goToNextMonth,
    totalBillsInDisplayedMonth,
    paidBillsInDisplayedMonth,
    totalAmountForAllBillsInDisplayedMonth,
    percentAmountPaid,
    totalExpensesInDisplayedMonth,
    totalAmountDueInDisplayedMonth
}) => {

    const screens = useBreakpoint(); // Get breakpoint status

    // Determine if we are on a small screen (xs or sm)
    // We'll use this to conditionally render different layouts
    const isSmallScreen = screens.xs || screens.sm;

    const monthText = dayjs(displayedMonth).isValid() ? dayjs(displayedMonth).format("MMMM") : "Invalid";
    const yearText = dayjs(displayedMonth).isValid() ? dayjs(displayedMonth).format("YYYY") : "Date";

    // Define titles based on screen size
    const paidTitle = isSmallScreen ? "Paid" : "Paid This Month";
    const totalTitle = isSmallScreen ? "Total" : "Total Bills";
    const remainingTitle = isSmallScreen ? "Remaining" : "Remaining This Month";

    return (
        <div style={{ marginBottom: 'var(--space-24)' }}>
            {/* DESKTOP VERSION - Hidden on mobile */}
            <div className="desktop-header">
                {/* Title and Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <IconCalendarFilled
                            size={25}
                            style={{
                                marginRight: 'var(--space-8)',
                                color: 'var(--primary-600)',
                                flexShrink: 0,
                                transform: 'translateY(-2px)'
                            }}
                        />
                        <Text strong style={{ fontSize: '1rem', lineHeight: '1.2' }}>
                            Monthly Bills Progress
                            {totalBillsInDisplayedMonth > 0 && (
                                <Text type="secondary" style={{ fontSize: '0.875rem', marginLeft: '8px' }}>
                                    ({paidBillsInDisplayedMonth}/{totalBillsInDisplayedMonth})
                                </Text>
                            )}
                        </Text>
                    </div>
                    {totalAmountForAllBillsInDisplayedMonth > 0 && (
                        <Text style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-600)', backgroundColor: 'var(--primary-100)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', marginLeft: 'var(--space-8)' }}>
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
            </div>

            {/* MOBILE VERSION - Only shown on mobile */}
            <div className="mobile-header">
                {/* Month Navigation - Now at top for better spacing */}
                <div className="month-navigation">
                    <Tooltip title="Previous Month">
                        <Button 
                            shape="circle" 
                            icon={<IconChevronLeft size={16} />} 
                            onClick={goToPreviousMonth} 
                            className="nav-button"
                        />
                    </Tooltip>
                    <div className="month-display">
                        <Text strong className="month-text">{monthText}</Text>
                        <Text className="year-text">{yearText}</Text>
                    </div>
                    <Tooltip title="Next Month">
                        <Button 
                            shape="circle" 
                            icon={<IconChevronRight size={16} />} 
                            onClick={goToNextMonth} 
                            className="nav-button"
                        />
                    </Tooltip>
                </div>

                {/* Title and Progress Row */}
                <div className="title-progress-row">
                    <div className="title-container">
                        <IconCalendarFilled
                            size={20}
                            className="calendar-icon"
                        />
                        <div className="title-text">
                            <Text strong className="main-title">Monthly Bills</Text>
                            {totalBillsInDisplayedMonth > 0 && (
                                <Text type="secondary" className="bills-count">
                                    ({paidBillsInDisplayedMonth}/{totalBillsInDisplayedMonth})
                                </Text>
                            )}
                        </div>
                    </div>
                    
                    {/* Progress Badge */}
                    {percentAmountPaid > 0 && (
                        <div className="progress-badge">
                            {percentAmountPaid}% Paid
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            {totalAmountForAllBillsInDisplayedMonth > 0 && (
                <div style={{ width: '90%', margin: '0 auto', marginBottom: 'var(--space-5)' }}>
                    <Progress percent={percentAmountPaid} strokeColor="var(--success-500)" trailColor="var(--neutral-200)" showInfo={false} size={['100%', 12]} />
                </div>
            )}

            {/* Stats Row */}
            <Row gutter={[8, 16]} justify="space-around" align="middle" style={{ marginBottom: 'var(--space-16)' }}>
                <Col xs={8} sm={8} style={{ textAlign: 'center' }}>
                    <Statistic
                        title={<Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 500 }}>{paidTitle}</Text>}
                        value={totalExpensesInDisplayedMonth}
                        precision={2}
                        prefix="$"
                        valueStyle={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--success-500)' }}
                    />
                </Col>
                <Col xs={8} sm={8} style={{ textAlign: 'center' }}>
                    <Statistic
                        title={<Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 500 }}>{totalTitle}</Text>}
                        value={totalAmountForAllBillsInDisplayedMonth}
                        precision={2}
                        prefix="$"
                        valueStyle={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--neutral-900)' }}
                    />
                </Col>
                <Col xs={8} sm={8} style={{ textAlign: 'center' }}>
                    <Statistic
                        title={<Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 500 }}>{remainingTitle}</Text>}
                        value={totalAmountDueInDisplayedMonth}
                        precision={2}
                        prefix="$"
                        valueStyle={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--danger-500)' }}
                    />
                </Col>
            </Row>

            {/* No Bills Message */}
            {totalBillsInDisplayedMonth === 0 && !loading && (
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 'var(--space-16)' }}>
                    No bills due this month.
                </Text>
            )}

            {/* CSS for desktop/mobile switching and mobile styles */}
            <style jsx>{`
                /* Default display settings */
                .desktop-header {
                    display: block;
                }
                .mobile-header {
                    display: none;
                }

                /* Media query for mobile devices */
                @media (max-width: 768px) {
                    .desktop-header {
                        display: none;
                    }
                    .mobile-header {
                        display: block;
                        margin-bottom: 12px;
                    }

                    /* Mobile styles */
                    .month-navigation {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin-bottom: 14px;
                    }

                    .nav-button {
                        margin: 0 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .month-display {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        min-width: 80px;
                    }

                    .month-text {
                        font-size: 1.1rem;
                        line-height: 1.2;
                        margin: 0;
                        color: var(--neutral-800);
                    }

                    .year-text {
                        font-size: 0.8rem;
                        line-height: 1.1;
                        color: var(--neutral-600);
                        margin: 0;
                    }

                    .title-progress-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0 4px;
                    }

                    .title-container {
                        display: flex;
                        align-items: center;
                    }

                    .calendar-icon {
                        color: var(--primary-600);
                        margin-right: 8px;
                    }

                    .title-text {
                        display: flex;
                        flex-wrap: wrap;
                        align-items: baseline;
                    }

                    .main-title {
                        font-size: 0.95rem;
                        line-height: 1.2;
                        margin-right: 6px;
                    }

                    .bills-count {
                        font-size: 0.8rem;
                        opacity: 0.7;
                        font-weight: 600;
                    }

                    .progress-badge {
                        font-size: 0.75rem;
                        font-weight: 600;
                        color: var(--primary-600);
                        background-color: var(--primary-100);
                        padding: 4px 8px;
                        border-radius: 12px;
                        white-space: nowrap;
                    }
                }

                /* Very small screens */
                @media (max-width: 480px) {
                    .main-title {
                        font-size: 0.9rem;
                    }
                    
                    .nav-button {
                        margin: 0 8px;
                    }
                    
                    .progress-badge {
                        font-size: 0.7rem;
                        padding: 3px 6px;
                    }
                }
            `}</style>
        </div>
    );
};

export default MonthlyProgressSummary;