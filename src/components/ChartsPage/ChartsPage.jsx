// src/components/ChartsPage/ChartsPage.jsx
// Added robust error handling and data validation for chart data fetching

import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Spin, Select, Typography, Space } from 'antd';
import dayjs from 'dayjs';

// Chart components and their data processing helpers
import ExpenseBreakdownChart, { processBreakdownData } from './ExpenseBreakdownChart';
import BillTimelineChart,       { processTimelineData }  from './BillTimelineChart';
import SpendingTrendsChart      from './SpendingTrendsChart';
import BudgetComparisonChart    from './BudgetComparisonChart';
import CreditUtilizationGauge   from './CreditUtilizationGauge';
import ExpenseTypeChart,        { processExpenseTypeData } from './ExpenseTypeChart';

import { fetchBills } from '../../services/api'; // Assuming fetchBills is correctly implemented
import { FinanceContext } from '../../contexts/FinanceContext';

const { Title }  = Typography;
const { Option } = Select;

const ChartsPage = () => {
  // State for raw bills data fetched from API
  const [bills, setBills] = useState([]);
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State for selected month/year filters
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  // Get credit card data from context
  const { creditCards } = useContext(FinanceContext);

  // State specifically for processed data passed to each chart
  const [breakdownData, setBreakdownData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [expenseTypeData, setExpenseTypeData] = useState([]);

  // Effect hook to fetch and process data when month/year changes
  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      // Reset data states at the beginning of each fetch attempt
      setBills([]);
      setBreakdownData([]);
      setTimelineData([]);
      setExpenseTypeData([]);
      try {
        // --- Fetch bills for the selected month ---
        const currentMonthBillsResult = await fetchBills(selectedMonth, true);
        // Ensure the result is treated as an array, default to empty array if not
        const currentMonthBills = Array.isArray(currentMonthBillsResult) ? currentMonthBillsResult : [];
        setBills(currentMonthBills); // Set state with a guaranteed array

        // --- Process data only if we have a valid array ---
        setBreakdownData(processBreakdownData(currentMonthBills));
        setExpenseTypeData(processExpenseTypeData(currentMonthBills));

        // --- Fetch bills for the selected year (adjust API call if possible) ---
        // Note: Fetching just the first month might not be ideal for a full year timeline.
        // Ideally, fetchBills could accept a year or fetch all relevant bills.
        const yearBillsResult = await fetchBills(`${selectedYear}-01`, true); // Placeholder: fetches Jan only
        // Ensure the result is treated as an array
        const yearBills = Array.isArray(yearBillsResult) ? yearBillsResult : [];

        // --- Process timeline data only if we have a valid array ---
        setTimelineData(processTimelineData(yearBills, selectedYear));

      } catch (error) {
        console.error("Error fetching chart data:", error);
        // *** Explicitly reset states to empty arrays on error ***
        setBills([]);
        setBreakdownData([]);
        setTimelineData([]);
        setExpenseTypeData([]);
      } finally {
        setLoading(false); // Ensure loading is set to false regardless of success/error
      }
    };

    fetchChartData();
  }, [selectedMonth, selectedYear]); // Re-run effect when month or year changes

  // --- Safely prepare placeholder data ---

  // Placeholder for Spending Trends (replace with actual data processing later)
  const placeholderTrendData = [
    { id: 'Spending', color: '#1890ff', data: [ { x: 'Jan', y: 0 }, { x: 'Feb', y: 0 } ] }
  ];

  // Placeholder for Budget Comparison (replace with actual data processing later)
  const placeholderBudgetData = [ { category: 'Example', budget: 100, actual: 0 } ];

  // Safely create Credit Utilization placeholder data
  // Ensure creditCards from context is an array before mapping
  const safeCreditCards = Array.isArray(creditCards) ? creditCards : [];
  const placeholderUtilizationData = safeCreditCards.map(card => {
    // ** IMPORTANT: Assumes 'limit' property exists on card object.
    //    Add default values if properties might be missing. **
    const limit = card.limit || 1000; // Default limit if missing
    const balance = card.balance || 0; // Default balance if missing
    const utilization = limit > 0 ? Math.round((balance / limit) * 100) : 0;

    return {
      id: card.name || 'Unknown Card', // Default name
      limit: limit,
      balance: balance,
      data: [{ x: 'Util.', y: utilization }]
    };
  });

  // --- Handlers for dropdown changes ---
  const handleMonthChange = (value) => {
    setSelectedMonth(value);
    // Optionally update selected year if the month change crosses a year boundary
    // setSelectedYear(dayjs(value).year());
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
    // Optionally update selected month if you want it to default to Jan of the new year
    // setSelectedMonth(`${value}-01`);
  };

  // --- Build dropdown options ---
  const monthOptions = Array.from({ length: 24 }, (_, i) => {
    const date = dayjs().subtract(i, 'month');
    return { label: date.format('MMMM YYYY'), value: date.format('YYYY-MM') };
  });
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = dayjs().year() - i;
    return { label: String(year), value: year };
  });

  // --- Render JSX ---
  return (
    <div>
      <Title level={2} style={{ marginBottom: 'var(--space-20)' }}>Financial Charts</Title>
      <Space wrap style={{ marginBottom: 'var(--space-20)' }}>
        {/* Month Selector */}
        <Select
          value={selectedMonth}
          style={{ width: 200 }}
          onChange={handleMonthChange}
          options={monthOptions}
          aria-label="Select Month for Charts"
        />
        {/* Year Selector (Potentially for timeline or annual charts) */}
        <Select
          value={selectedYear}
          style={{ width: 120 }}
          onChange={handleYearChange}
          options={yearOptions}
          aria-label="Select Year for Charts"
        />
      </Space>

      {/* Display loading spinner while data is being fetched */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        // Render charts once loading is complete
        <Row gutter={[16, 16]}>
          {/* Expense Breakdown Chart */}
          <Col xs={24} md={12} lg={8}>
            <Card title={`Expense Breakdown (${dayjs(selectedMonth).format('MMMM YYYY')})`}>
              {/* Pass the processed breakdownData state */}
              <ExpenseBreakdownChart data={breakdownData} />
            </Card>
          </Col>

          {/* Recurring vs One-Time Chart */}
          <Col xs={24} md={12} lg={8}>
            <Card title={`Recurring vs One-Time (${dayjs(selectedMonth).format('MMMM YYYY')})`}>
              {/* Pass the processed expenseTypeData state */}
              <ExpenseTypeChart data={expenseTypeData} />
            </Card>
          </Col>

          {/* Budget vs Actual Chart */}
          <Col xs={24} md={12} lg={8}>
            <Card title="Budget vs Actual (Placeholder)">
              {/* Pass placeholder data for now */}
              <BudgetComparisonChart data={placeholderBudgetData} />
            </Card>
          </Col>

          {/* Bill Timeline Chart */}
          <Col xs={24}>
            <Card title={`Bill Timeline (${selectedYear})`}>
              {/* Pass the processed timelineData state and selected year */}
              <BillTimelineChart data={timelineData} year={selectedYear} />
            </Card>
          </Col>

          {/* Spending Trends Chart */}
          <Col xs={24} md={12}>
            <Card title="Spending Trends (Placeholder)">
              {/* Pass placeholder data for now */}
              <SpendingTrendsChart data={placeholderTrendData} />
            </Card>
          </Col>

          {/* Credit Utilization Gauges */}
          <Col xs={24} md={12}>
            <Card title="Credit Card Utilization (Placeholder Limits)">
              {/* Check if placeholder data exists before mapping */}
              {placeholderUtilizationData.length > 0 ? (
                <Row gutter={[8, 8]} justify="center" align="middle">
                  {/* Map over the safely created placeholder data */}
                  {placeholderUtilizationData.map(card => (
                    <Col key={card.id}>
                      <CreditUtilizationGauge cardData={card} />
                    </Col>
                  ))}
                </Row>
              ) : (
                <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: '20px' }}>
                  No credit card data available.
                </Typography.Text>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ChartsPage;
