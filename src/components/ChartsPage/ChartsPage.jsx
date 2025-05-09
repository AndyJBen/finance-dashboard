// src/components/ChartsPage/ChartsPage.jsx
// Added robust error handling and data validation for chart data fetching
// Added defensive checks for bill.amount in processing functions

import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Spin, Select, Typography, Space } from 'antd';
import dayjs from 'dayjs';

// Chart components
import ExpenseBreakdownChart from './ExpenseBreakdownChart';
import BillTimelineChart from './BillTimelineChart';
import SpendingTrendsChart from './SpendingTrendsChart';
import BudgetComparisonChart from './BudgetComparisonChart';
import CreditUtilizationGauge from './CreditUtilizationGauge';
import ExpenseTypeChart from './ExpenseTypeChart';

import { fetchBills } from '../../services/api'; // Assuming fetchBills is correctly implemented
import { FinanceContext } from '../../contexts/FinanceContext';

const { Title }  = Typography;
const { Option } = Select;

// --- Data Processing Helpers (Made more defensive) ---

const processBreakdownData = (bills = []) => {
  // Ensure input is an array
  const validBills = Array.isArray(bills) ? bills : [];
  const categoryTotals = validBills.reduce((acc, bill) => {
    // Ensure bill.amount is treated as a number (default to 0 if invalid)
    const amount = typeof bill?.amount === 'number' && !isNaN(bill.amount) ? bill.amount : 0;
    const category = bill?.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  return Object.entries(categoryTotals).map(([category, total]) => ({
    id: category,
    label: category,
    value: parseFloat(total.toFixed(2)), // total should now always be a valid number
  })).filter(d => d.value > 0); // Filter out zero-value categories
};

const processExpenseTypeData = (bills = []) => {
  // Ensure input is an array
  const validBills = Array.isArray(bills) ? bills : [];
  const typeTotals = validBills.reduce((acc, bill) => {
    // Ensure bill.amount is treated as a number (default to 0 if invalid)
    const amount = typeof bill?.amount === 'number' && !isNaN(bill.amount) ? bill.amount : 0;
    const type = bill?.isRecurring ? 'Recurring' : 'One-Time';
    acc[type] = (acc[type] || 0) + amount;
    return acc;
  }, { Recurring: 0, 'One-Time': 0 });

  return Object.entries(typeTotals).map(([type, total]) => ({
    id: type,
    label: type,
    value: parseFloat(total.toFixed(2)), // total should now always be a valid number
  })).filter(d => d.value > 0);
};

const processTimelineData = (bills = [], year) => {
  // Ensure input is an array
  const validBills = Array.isArray(bills) ? bills : [];
  return validBills
    .filter(bill => bill && dayjs(bill.dueDate).isValid() && dayjs(bill.dueDate).year() === year) // Add check for valid date
    .map(bill => {
       // Ensure bill.amount is treated as a number (default to 0 if invalid)
       const amount = typeof bill?.amount === 'number' && !isNaN(bill.amount) ? bill.amount : 0;
       return {
         value: amount,
         day: bill.dueDate, // Nivo Calendar expects 'YYYY-MM-DD'
       };
    }).filter(d => d.value > 0); // Optionally filter out zero-value days
};


// --- ChartsPage Component ---

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
        // Fetch bills for the selected month
        const currentMonthBillsResult = await fetchBills(selectedMonth, true);
        const currentMonthBills = Array.isArray(currentMonthBillsResult) ? currentMonthBillsResult : [];
        setBills(currentMonthBills); // Set state with a guaranteed array

        // Process data using the more defensive helper functions
        setBreakdownData(processBreakdownData(currentMonthBills));
        setExpenseTypeData(processExpenseTypeData(currentMonthBills));

        // Fetch bills for the selected year (adjust API call if possible)
        const yearBillsResult = await fetchBills(`${selectedYear}-01`, true); // Placeholder: fetches Jan only
        const yearBills = Array.isArray(yearBillsResult) ? yearBillsResult : [];

        // Process timeline data using the more defensive helper function
        setTimelineData(processTimelineData(yearBills, selectedYear));

      } catch (error) {
        console.error("Error fetching or processing chart data:", error);
        // Explicitly reset states to empty arrays on error
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

  const placeholderTrendData = [
    { id: 'Spending', color: '#1890ff', data: [ { x: 'Jan', y: 0 }, { x: 'Feb', y: 0 } ] }
  ];
  const placeholderBudgetData = [ { category: 'Example', budget: 100, actual: 0 } ];

  const safeCreditCards = Array.isArray(creditCards) ? creditCards : [];
  const placeholderUtilizationData = safeCreditCards.map(card => {
    const limit = card?.limit || 1000; // Default limit if missing/invalid
    const balance = typeof card?.balance === 'number' ? card.balance : 0; // Default balance if missing/invalid
    const utilization = limit > 0 ? Math.round((balance / limit) * 100) : 0;

    return {
      id: card?.name || 'Unknown Card', // Default name
      limit: limit,
      balance: balance,
      data: [{ x: 'Util.', y: utilization }]
    };
  });

  // --- Handlers for dropdown changes ---
  const handleMonthChange = (value) => {
    setSelectedMonth(value);
  };
  const handleYearChange = (value) => {
    setSelectedYear(value);
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
        {/* Year Selector */}
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
              {/* Ensure data is an array before passing */}
              <ExpenseBreakdownChart data={Array.isArray(breakdownData) ? breakdownData : []} />
            </Card>
          </Col>

          {/* Recurring vs One-Time Chart */}
          <Col xs={24} md={12} lg={8}>
            <Card title={`Recurring vs One-Time (${dayjs(selectedMonth).format('MMMM YYYY')})`}>
               {/* Ensure data is an array before passing */}
              <ExpenseTypeChart data={Array.isArray(expenseTypeData) ? expenseTypeData : []} />
            </Card>
          </Col>

          {/* Budget vs Actual Chart */}
          <Col xs={24} md={12} lg={8}>
            <Card title="Budget vs Actual (Placeholder)">
              <BudgetComparisonChart data={placeholderBudgetData} />
            </Card>
          </Col>

          {/* Bill Timeline Chart */}
          <Col xs={24}>
            <Card title={`Bill Timeline (${selectedYear})`}>
               {/* Ensure data is an array before passing */}
              <BillTimelineChart data={Array.isArray(timelineData) ? timelineData : []} year={selectedYear} />
            </Card>
          </Col>

          {/* Spending Trends Chart */}
          <Col xs={24} md={12}>
            <Card title="Spending Trends (Placeholder)">
              <SpendingTrendsChart data={placeholderTrendData} />
            </Card>
          </Col>

          {/* Credit Utilization Gauges */}
          <Col xs={24} md={12}>
            <Card title="Credit Card Utilization (Placeholder Limits)">
              {placeholderUtilizationData.length > 0 ? (
                <Row gutter={[8, 8]} justify="center" align="middle">
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
