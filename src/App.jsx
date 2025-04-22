// src/App.jsx
// Highlight: Added ChartsPage import and routing case in renderContent.
// Highlight: Added overscrollBehaviorY: 'contain' to the main content Layout style.

import React, { useState } from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';

// --- Import Components ---
// Standard components
import BillsList from './components/BillsList/BillsList';
import UpcomingPayments from './components/RecentActivity/UpcomingPayments';
import ActivityFeed from './components/RecentActivity/ActivityFeed';
import Sidebar from './components/Sidebar/Sidebar';
import FinancialOverviewCards from './components/FinancialSummary/FinancialOverviewCards';
import CombinedBillsOverview from './components/FinancialSummary/CombinedBillsOverview';
import PastDuePayments from './components/RecentActivity/PastDuePayments';
import BillPrepCard from './components/FinancialSummary/BillPrepCard';
import AppFooter from './components/Footer/Footer';
// Import the new Charts Page component
import ChartsPage from './components/ChartsPage/ChartsPage'; // <-- ADDED IMPORT

const { Content } = Layout;
const { Title } = Typography;

function MyApp() {
  const [collapsed, setCollapsed] = useState(false);
  // Default to 'dashboard', ensure your Sidebar reflects this default
  const [selectedMenuKey, setSelectedMenuKey] = useState('dashboard');

  const SIDEBAR_WIDTH = 240;
  const SIDEBAR_COLLAPSED_WIDTH = 80;

  const currentMarginLeft = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  // --- Content Rendering based on selectedMenuKey ---
  const renderContent = () => {
    switch (selectedMenuKey) {
      case 'dashboard':
        return (
          <Row gutter={[24, 24]}>
            {/* Left Column: Adjusted to lg=17 */}
            <Col xs={24} lg={17}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <FinancialOverviewCards />
                <CombinedBillsOverview style={{ height: '100%' }}/>
              </Space>
            </Col>
            {/* Right Column: Adjusted to lg=7 */}
            <Col xs={24} lg={7}>
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                  <BillPrepCard style={{ height: '100%' }}/>
                  <PastDuePayments style={{ height: '100%' }}/>
                  <UpcomingPayments style={{ height: '100%' }}/>
                  <ActivityFeed style={{ height: '100%' }}/>
              </Space>
            </Col>
          </Row>
        );
      case 'bills':
        return <BillsList />;
      case 'charts': // <-- ADDED CASE FOR CHARTS PAGE
        return <ChartsPage />;
      case 'reports': // Assuming this key exists or will be added in Sidebar
        return <Title level={3}>Reports (Placeholder)</Title>;
      case 'settings': // Assuming this key exists or will be added in Sidebar
          return <Title level={3}>Settings (Placeholder)</Title>;
      default:
        // Defaulting to dashboard view
        return (
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={17}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <FinancialOverviewCards />
                  <CombinedBillsOverview style={{ height: '100%' }}/>
                </Space>
              </Col>
              <Col xs={24} lg={7}>
                <Space direction="vertical" size={24} style={{ width: '100%' }}>
                  <BillPrepCard style={{ height: '100%' }}/>
                  <PastDuePayments style={{ height: '100%' }}/>
                  <UpcomingPayments style={{ height: '100%' }}/>
                  <ActivityFeed style={{ height: '100%' }}/>
                </Space>
              </Col>
            </Row>
        );
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        selectedKey={selectedMenuKey}
        onSelect={({ key }) => setSelectedMenuKey(key)} // Update state on menu selection
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
      />
      {/* --- Main Content Layout --- */}
      <Layout style={{
          marginLeft: currentMarginLeft,
          transition: 'margin-left 0.2s',
          minHeight: '100vh',
          overflowY: 'auto', // Keep vertical scroll
          overflowX: 'hidden', // Keep horizontal hidden
          overscrollBehaviorY: 'contain', // Prevent scrolling body when modal/scrollable content reaches boundary
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--neutral-100)' // Use your CSS variable
        }}>

        {/* Header Removed */}

        <Content style={{
            padding: 'var(--space-24)', // Use your CSS variable
            margin: 0,
            flexGrow: 1, // Allow content to grow and push footer down
        }}>
          {renderContent()} {/* Render content based on state */}
        </Content>
        <AppFooter />
      </Layout>
    </Layout>
  );
}

export default MyApp;