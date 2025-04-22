// src/components/FinancialSummary/MonthlyProgressSummary.jsx
import React from 'react';
import {
    Button, Tooltip, Progress, Typography, Row, Col, Statistic
} from 'antd';
import {
    IconCalendarFilled, IconChevronLeft, IconChevronRight
} from '@tabler/icons-react';
import dayjs from 'dayjs'; // Ensure dayjs is available

// Use Typography components directly
const { Text, Title, Paragraph } = Typography;

const MonthlyProgressSummary = ({
    loading, // To potentially show loading state here if needed, though parent handles main spin
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

    const monthText = dayjs(displayedMonth).isValid() ? dayjs(displayedMonth).format("MMMM") : "Invalid";
    const yearText = dayjs(displayedMonth).isValid() ? dayjs(displayedMonth).format("YYYY") : "Date";

    return (
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
    );
};

export default MonthlyProgressSummary;
