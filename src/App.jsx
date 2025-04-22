// src/App.jsx

import React, { useState } from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';

// Core pages/components
import BillsList              from './components/BillsList/BillsList';
import UpcomingPayments       from './components/RecentActivity/UpcomingPayments';
import ActivityFeed           from './components/RecentActivity/ActivityFeed';
import Sidebar                from './components/Sidebar/Sidebar';
import FinancialOverviewCards from './components/FinancialSummary/FinancialOverviewCards';
import CombinedBillsOverview  from './components/FinancialSummary/CombinedBillsOverview';
import BillPrepCard           from './components/FinancialSummary/BillPrepCard';
import PastDuePayments        from './components/RecentActivity/PastDuePayments';
import AppFooter              from './components/Footer/Footer';

// **NEW** ChartsPage must live at src/components/ChartsPage.jsx
import ChartsPage             from './components/ChartsPage';

const { Content } = Layout;
const { Title }   = Typography;

function MyApp() {
  const [collapsed, setCollapsed]      = useState(false);
  const [selectedMenuKey, setSelected] = useState('dashboard');

  const SIDEBAR_WIDTH       = 240;
  const SIDEBAR_COLLAPSED_W = 80;
  const marginLeft          = collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_WIDTH;

  const renderContent = () => {
    switch (selectedMenuKey) {
      case 'dashboard':
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={17}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <FinancialOverviewCards />
                <CombinedBillsOverview style={{ height: '100%' }} />
              </Space>
            </Col>
            <Col xs={24} lg={7}>
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <BillPrepCard style={{ height: '100%' }} />
                <PastDuePayments style={{ height: '100%' }} />
                <UpcomingPayments style={{ height: '100%' }} />
                <ActivityFeed style={{ height: '100%' }} />
              </Space>
            </Col>
          </Row>
        );

      case 'bills':
        return <BillsList />;

      case 'reports':
        // now renders your real ChartsPage
        return <ChartsPage />;

      case 'settings':
        return <Title level={3}>Settings (Placeholder)</Title>;

      default:
        return <Title level={3}>Not Found</Title>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        selectedKey={selectedMenuKey}
        onSelect={({ key }) => setSelected(key)}
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_W}
      />

      <Layout
        style={{
          marginLeft,
          transition: 'margin-left 0.2s',
          minHeight: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehaviorY: 'contain',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--neutral-100)',
        }}
      >
        <Content style={{ padding: 'var(--space-24)', margin: 0, flexGrow: 1 }}>
          {renderContent()}
        </Content>
        <AppFooter />
      </Layout>
    </Layout>
  );
}

export default MyApp;
