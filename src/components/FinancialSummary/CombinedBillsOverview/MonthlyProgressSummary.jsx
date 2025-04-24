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
    const isSmallScreen = screens.xs || screens.sm;

    const monthText = dayjs(displayedMonth).isValid() ? dayjs(displayedMonth).format("MMMM") : "Invalid";
    const yearText = dayjs(displayedMonth).isValid() ? dayjs(displayedMonth).format("YYYY") : "Date";

    // Define titles based on screen size
    const paidTitle = isSmallScreen ? "Paid" : "Paid This Month";
    const totalTitle = isSmallScreen ? "Total" : "Total Bills";
    const remainingTitle = isSmallScreen ? "Remaining" : "Remaining This Month";

    return (
        <div style={{ marginBottom: 'var(--space-24)' }}>
            {/* ===== REDESIGNED HEADER SECTION ===== */}
            <div className="bills-header-container">
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
                <div className="progress-bar-container">
                    <Progress 
                        percent={percentAmountPaid} 
                        strokeColor="var(--success-500)" 
                        trailColor="var(--neutral-200)" 
                        showInfo={false} 
                        size={['100%', 10]} // Made slightly thinner
                    />
                </div>
            )}

            {/* Stats Row */}
            <Row gutter={[8, 16]} justify="space-around" align="middle" className="stats-row">
                <Col xs={8} sm={8} className="stat-column">
                    <Statistic
                        title={<Text type="secondary" className="stat-title">{paidTitle}</Text>}
                        value={totalExpensesInDisplayedMonth}
                        precision={2}
                        prefix="$"
                        valueStyle={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--success-500)' }}
                        className="stat-value paid"
                    />
                </Col>
                <Col xs={8} sm={8} className="stat-column">
                    <Statistic
                        title={<Text type="secondary" className="stat-title">{totalTitle}</Text>}
                        value={totalAmountForAllBillsInDisplayedMonth}
                        precision={2}
                        prefix="$"
                        valueStyle={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--neutral-900)' }}
                        className="stat-value"
                    />
                </Col>
                <Col xs={8} sm={8} className="stat-column">
                    <Statistic
                        title={<Text type="secondary" className="stat-title">{remainingTitle}</Text>}
                        value={totalAmountDueInDisplayedMonth}
                        precision={2}
                        prefix="$"
                        valueStyle={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--danger-500)' }}
                        className="stat-value remaining"
                    />
                </Col>
            </Row>

            {/* No Bills Message */}
            {totalBillsInDisplayedMonth === 0 && !loading && (
                <Text type="secondary" className="no-bills-message">
                    No bills due this month.
                </Text>
            )}

            {/* Add the CSS for the redesign */}
            <style jsx>{`
                .bills-header-container {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 12px;
                }

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
                    transition: all 0.15s ease;
                }

                .nav-button:hover {
                    background-color: var(--primary-50);
                    transform: translateY(-1px);
                }

                .nav-button:active {
                    transform: translateY(0px);
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

                .progress-bar-container {
                    width: 90%;
                    margin: 0 auto;
                    margin-bottom: var(--space-16);
                }

                .stats-row {
                    margin-bottom: var(--space-16);
                }

                .stat-column {
                    text-align: center;
                }

                .stat-title {
                    font-size: 0.75rem;
                    text-transform: capitalize;
                    font-weight: 500;
                    color: var(--neutral-600);
                }

                .no-bills-message {
                    display: block;
                    text-align: center;
                    margin-top: var(--space-16);
                    color: var(--neutral-500);
                }

                /* Mobile specific optimizations */
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

                    .month-text {
                        font-size: 1rem;
                    }

                    .year-text {
                        font-size: 0.75rem;
                    }

                    .progress-bar-container {
                        width: 96%;
                        margin-bottom: var(--space-12);
                    }
                }
            `}</style>
        </div>
    );
};

export default MonthlyProgressSummary;