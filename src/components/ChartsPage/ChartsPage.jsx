// src/components/ChartsPage/ChartsPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Spin, Select, Typography, Space } from 'antd';
import dayjs from 'dayjs';

// Chart components
import ExpenseBreakdownChart, { processBreakdownData } from './ExpenseBreakdownChart';
import BillTimelineChart,       { processTimelineData }  from './BillTimelineChart';
import SpendingTrendsChart      from './SpendingTrendsChart';
import BudgetComparisonChart    from './BudgetComparisonChart';
import CreditUtilizationGauge   from './CreditUtilizationGauge';
import ExpenseTypeChart,        { processExpenseTypeData } from './ExpenseTypeChart';

// <-- Updated import -->
import { fetchBills } from '../../services/api';
import { FinanceContext } from '../../contexts/FinanceContext';

const { Title }  = Typography;
const { Option } = Select;

const ChartsPage = () => {
  const [bills, setBills]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [selectedYear, setSelectedYear]   = useState(dayjs().year());
  const { creditCards }                   = useContext(FinanceContext);

  // Data for each chart
  const [breakdownData, setBreakdownData]       = useState([]);
  const [timelineData, setTimelineData]         = useState([]);
  const [expenseTypeData, setExpenseTypeData]   = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        // 1. Fetch bills for the current month (including overdue)
        const currentMonthBills = await fetchBills(selectedMonth, true);
        setBills(currentMonthBills);
        setBreakdownData(processBreakdownData(currentMonthBills));
        setExpenseTypeData(processExpenseTypeData(currentMonthBills));

        // 2. Fetch bills for the start of the year for the timeline
        //    (Ideally you'd fetch all months; this is a placeholder)
        const yearStart = `${selectedYear}-01`;
        const yearBills  = await fetchBills(yearStart, true);
        setTimelineData(processTimelineData(yearBills, selectedYear));

      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedMonth, selectedYear]);

  // Placeholder data for as‑yet‑unimplemented charts
  const placeholderTrendData = [
    { id: 'Spending', color: '#1890ff', data: [ { x: 'Jan', y: 0 }, { x: 'Feb', y: 0 } ] }
  ];
  const placeholderBudgetData = [ { category: 'Example', budget: 100, actual: 0 } ];
  const placeholderUtilizationData = creditCards.map(card => ({
    id: card.name,
    limit: 1000,
    balance: card.balance,
    data: [{ x: 'Util.', y: card.balance > 0 ? Math.round((card.balance / 1000) * 100) : 0 }]
  }));

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
    setSelectedYear(dayjs(value).year());
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  // Build dropdown options
  const monthOptions = Array.from({ length: 24 }, (_, i) => {
    const date = dayjs().subtract(i, 'month');
    return { label: date.format('MMMM YYYY'), value: date.format('YYYY-MM') };
  });
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = dayjs().year() - i;
    return { label: year, value: year };
  });

  return (
    <div>
      <Title level={2}>Financial Charts</Title>
      <Space wrap style={{ marginBottom: 20 }}>
        <Select
          value={selectedMonth}
          style={{ width: 200 }}
          onChange={handleMonthChange}
          options={monthOptions}
        />
        <Select
          value={selectedYear}
          style={{ width: 120 }}
          onChange={handleYearChange}
          options={yearOptions}
        />
      </Space>

      {loading ? (
        <Spin size="large" style={{ marginTop: 50, display: 'block' }} />
      ) : (
        <Row gutter={[16,16]}>
          {/* Expense Breakdown */}
          <Col xs={24} md={12} lg={8}>
            <Card title={`Expense Breakdown (${dayjs(selectedMonth).format('MMMM YYYY')})`}>
              <ExpenseBreakdownChart data={breakdownData} />
            </Card>
          </Col>

          {/* Recurring vs One‑Time */}
          <Col xs={24} md={12} lg={8}>
            <Card title={`Recurring vs One-Time (${dayjs(selectedMonth).format('MMMM YYYY')})`}>
              <ExpenseTypeChart data={expenseTypeData} />
            </Card>
          </Col>

          {/* Budget vs Actual */}
          <Col xs={24} md={12} lg={8}>
            <Card title="Budget vs Actual (Placeholder)">
              <BudgetComparisonChart data={placeholderBudgetData} />
            </Card>
          </Col>

          {/* Bill Timeline */}
          <Col xs={24}>
            <Card title={`Bill Timeline (${selectedYear})`}>
              <BillTimelineChart data={timelineData} year={selectedYear} />
            </Card>
          </Col>

          {/* Spending Trends */}
          <Col xs={24} md={12}>
            <Card title="Spending Trends (Placeholder)">
              <SpendingTrendsChart data={placeholderTrendData} />
            </Card>
          </Col>

          {/* Credit Utilization */}
          <Col xs={24} md={12}>
            <Card title="Credit Card Utilization (Placeholder Limits)">
              <Row gutter={[8,8]} justify="center">
                {placeholderUtilizationData.map(card => (
                  <Col key={card.id}>
                    <CreditUtilizationGauge cardData={card} />
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ChartsPage;
