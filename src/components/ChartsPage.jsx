import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Spin, Select, Typography, Space } from 'antd';
import dayjs from 'dayjs';

// Import Chart Components
import ExpenseBreakdownChart, { processBreakdownData } from './ExpenseBreakdownChart';
import BillTimelineChart, { processTimelineData } from './BillTimelineChart';
import SpendingTrendsChart from './SpendingTrendsChart'; // Uses placeholder
import BudgetComparisonChart from './BudgetComparisonChart'; // Uses placeholder
import CreditUtilizationGauge from './CreditUtilizationGauge'; // Uses placeholder
import ExpenseTypeChart, { processExpenseTypeData } from './ExpenseTypeChart';

// Import your data fetching methods (assuming they exist)
import { getBills } from '../../services/api'; // Example
import { FinanceContext } from '../../contexts/FinanceContext'; // Example if using context

const { Title } = Typography;
const { Option } = Select;

const ChartsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const { creditCards } = useContext(FinanceContext); // Get cards from context

  // Data processed for charts
  const [breakdownData, setBreakdownData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [expenseTypeData, setExpenseTypeData] = useState([]);

  // --- TODO: Fetch Data ---
  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        // Fetch bills for the selected month/year (adjust API call as needed)
        // You might need a broader fetch for the timeline chart (full year)
        // and separate fetches/calculations for trends, budget, utilization later.
        const currentMonthBills = await getBills(selectedMonth); // Adjust based on your API
        const yearBills = await getBills(selectedYear + '-01', 'all_year'); // FAKE: Needs real API support
        setBills(currentMonthBills); // Or combine as needed

        // Process data for charts
        setBreakdownData(processBreakdownData(currentMonthBills));
        setExpenseTypeData(processExpenseTypeData(currentMonthBills));
        setTimelineData(processTimelineData(yearBills || currentMonthBills, selectedYear)); // Use yearly data if fetched

        // Fetch/calculate other data (Trends, Budget, Utilization) when ready

      } catch (error) {
        console.error("Error fetching chart data:", error);
        // Handle error display
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedMonth, selectedYear]); // Refetch when month/year changes
  // --- End Fetch Data ---

  // --- TODO: Placeholder Data for missing features ---
  // You will replace these with actual fetched/processed data later
  const placeholderTrendData = [ { id: 'Spending', color: '#1890ff', data: [ { x: 'Jan', y: 0 }, { x: 'Feb', y: 0 } ] } ];
  const placeholderBudgetData = [ { category: 'Example', budget: 100, actual: 0 } ];
  const placeholderUtilizationData = creditCards.map(card => ({
      id: card.name,
      limit: 1000, // FAKE LIMIT
      balance: card.balance,
      data: [{ x: 'Util.', y: 1000 > 0 ? Math.round((card.balance / 1000) * 100) : 0 }] // FAKE LIMIT
  }));
  // --- End Placeholders ---

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
    setSelectedYear(dayjs(value).year()); // Keep year consistent
  };

  const handleYearChange = (value) => {
      setSelectedYear(value);
      // Optional: Reset month to Jan of the selected year?
      // setSelectedMonth(dayjs().year(value).month(0).format('YYYY-MM'));
  }

  // Generate month options for Select dropdown
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
      <Space wrap style={{ marginBottom: '20px' }}>
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
        <Spin size="large" style={{ display: 'block', marginTop: '50px' }} />
      ) : (
        <Row gutter={[16, 16]}>
          {/* Row 1 */}
          <Col xs={24} md={12} lg={8}>
            <Card title={`Expense Breakdown (${dayjs(selectedMonth).format('MMMM YYYY')})`}>
              <ExpenseBreakdownChart data={breakdownData} />
            </Card>
          </Col>
          <Col xs={24} md={12} lg={8}>
             <Card title={`Recurring vs One-Time (${dayjs(selectedMonth).format('MMMM YYYY')})`}>
              <ExpenseTypeChart data={expenseTypeData} />
            </Card>
          </Col>
           <Col xs={24} md={12} lg={8}>
            <Card title="Budget vs Actual (Placeholder)">
              <BudgetComparisonChart data={placeholderBudgetData} />
            </Card>
          </Col>


          {/* Row 2 */}
          <Col xs={24}>
            <Card title={`Bill Timeline (${selectedYear})`}>
              <BillTimelineChart data={timelineData} year={selectedYear}/>
            </Card>
          </Col>

           {/* Row 3 */}
          <Col xs={24} md={12}>
            <Card title="Spending Trends (Placeholder)">
                <SpendingTrendsChart data={placeholderTrendData}/>
            </Card>
          </Col>
           <Col xs={24} md={12}>
             <Card title="Credit Card Utilization (Placeholder Limits)">
                <Row gutter={[8, 8]} justify="center">
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