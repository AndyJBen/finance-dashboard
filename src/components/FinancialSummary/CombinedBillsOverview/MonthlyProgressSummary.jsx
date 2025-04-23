// src/components/FinancialSummary/CombinedBillsOverview/MonthlyProgressSummary.jsx
// Adjusted Statistic layout and titles for mobile view.
// Added vertical alignment for title row.

import React from 'react';
import {
    Button, Tooltip, Progress, Typography, Row, Col, Statistic, Grid // Added Grid
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
    // Adjust this logic if you want the change at a different breakpoint (e.g., !screens.md)
    const isSmallScreen = screens.xs || screens.sm;

    const monthText = dayjs(displayedMonth).isValid() ? dayjs(displayedMonth).format("MMMM") : "Invalid";
    const yearText = dayjs(displayedMonth).isValid() ? dayjs(displayedMonth).format("YYYY") : "Date";

    // Define titles based on screen size
    const paidTitle = isSmallScreen ? "Paid" : "Paid This Month";
    const totalTitle = isSmallScreen ? "Total" : "Total Bills";
    const remainingTitle = isSmallScreen ? "Remaining" : "Remaining This Month";

    // Helper function to format currency (Consider moving to utils)
    const formatCurrency = (value) => {
        const number = Number(value) || 0;
        return number.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };


    return (
        <div style={{ marginBottom: 'var(--space-24)' }}>
            {/* Title and Badge */}
            {/* 🟩 MODIFIED: Changed alignItems from 'flex-start' to 'center' */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
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
                    <Text style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-600)', backgroundColor: 'var(--primary-100)', padding: '0.25rem 0.625rem', borderRadius: 'var(--border-radius-full)', whiteSpace: 'nowrap' }}>
                        {percentAmountPaid}% Paid
                    </Text>
                )}
            </div>

            {/* Month Navigation */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 'var(--space-20)' }}>
                <Tooltip title="Previous Month">
                    <Button shape="circle" icon={<IconChevronLeft size={16} />} onClick={goToPreviousMonth} style={{ margin: '0 var(--space-16)' }} disabled={loading}/>
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
                    <Button shape="circle" icon={<IconChevronRight size={16} />} onClick={goToNextMonth} style={{ margin: '0 var(--space-16)' }} disabled={loading}/>
                </Tooltip>
            </div>

            {/* Progress Bar */}
            {totalAmountForAllBillsInDisplayedMonth > 0 && (
                <div style={{ width: '90%', margin: '0 auto', marginBottom: 'var(--space-20)' }}>
                    <Progress percent={percentAmountPaid} strokeColor="var(--success-500)" trailColor="var(--neutral-200)" showInfo={false} size={['100%', 12]} />
                </div>
            )}

            {/* Stats - Updated Col spans and titles */}
            <Row gutter={[8, 16]} justify="space-around" align="middle" style={{ marginBottom: 'var(--space-16)' }}>
                {/* Changed xs={24} to xs={8} to make them fit in a row */}
                {/* Reduced horizontal gutter from 16 to 8 */}
                <Col xs={8} sm={8} style={{ textAlign: 'center' }}>
                    <Statistic
                        // Use conditional title
                        title={<Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 500 }}>{paidTitle}</Text>}
                        value={loading ? '-' : totalExpensesInDisplayedMonth}
                        precision={2}
                        formatter={(val) => formatCurrency(val)} // Use helper
                        // prefix="$" // Prefix added by formatter
                        valueStyle={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--success-500)' }}
                    />
                </Col>
                <Col xs={8} sm={8} style={{ textAlign: 'center' }}>
                    <Statistic
                        // Use conditional title
                        title={<Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 500 }}>{totalTitle}</Text>}
                        value={loading ? '-' : totalAmountForAllBillsInDisplayedMonth}
                        precision={2}
                        formatter={(val) => formatCurrency(val)} // Use helper
                        // prefix="$" // Prefix added by formatter
                        valueStyle={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--neutral-900)' }}
                    />
                </Col>
                <Col xs={8} sm={8} style={{ textAlign: 'center' }}>
                        <Statistic
                        // Use conditional title
                        title={<Text type="secondary" style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 500 }}>{remainingTitle}</Text>}
                        value={loading ? '-' : totalAmountDueInDisplayedMonth}
                        precision={2}
                        formatter={(val) => formatCurrency(val)} // Use helper
                        // prefix="$" // Prefix added by formatter
                        valueStyle={{ fontWeight: 600, fontSize: '0.9rem', color: totalAmountDueInDisplayedMonth > 0 ? 'var(--danger-500)' : 'var(--neutral-600)' }} // Adjusted color logic slightly
                        />
                </Col>
            </Row>

            {/* No Bills Message */}
            {totalBillsInDisplayedMonth === 0 && !loading && (
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 'var(--space-16)' }}>
                    No bills due this month.
                </Text>
            )}
        </div>
    );
};

export default MonthlyProgressSummary;
