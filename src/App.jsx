// src/App.jsx
// Implemented Bottom Navigation for smaller screens

import React, { useState } from 'react';
// Added Grid for breakpoint detection
import { Layout, Row, Col, Typography, Space, Grid } from 'antd';

// Core pages/components
import BillsList            from './components/BillsList/BillsList';
import UpcomingPayments     from './components/RecentActivity/UpcomingPayments';
import ActivityFeed         from './components/RecentActivity/ActivityFeed';
import Sidebar              from './components/Sidebar/Sidebar';
import FinancialOverviewCards from './components/FinancialSummary/FinancialOverviewCards';
import CombinedBillsOverview  from './components/FinancialSummary/CombinedBillsOverview/CombinedBillsOverview';
import BillPrepCard         from './components/FinancialSummary/BillPrepCard';
import PastDuePayments      from './components/RecentActivity/PastDuePayments';
import AppFooter            from './components/Footer/Footer';
import ChartsPage           from './components/ChartsPage/ChartsPage';
// Import the new BottomNavBar
import BottomNavBar         from './components/Navigation/BottomNavBar';

const { Content } = Layout;
const { Title }   = Typography;
const { useBreakpoint } = Grid; // Hook to get breakpoint status

function MyApp() {
  // Removed collapsed state, sidebar will handle its own collapse on larger screens if needed
  // const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuKey, setSelected] = useState('dashboard');
  const screens = useBreakpoint(); // Get current breakpoint status {xs: bool, sm: bool, md: bool, lg: bool, ...}

  // Determine if we should show the mobile bottom nav (md breakpoint and below)
  // `md` is true if screen width is >= 768px. So we want the nav when md is FALSE.
  const isMobileView = !screens.md;

  const SIDEBAR_WIDTH = 240;
  // No collapsed width needed here if sidebar is hidden on mobile
  // const SIDEBAR_COLLAPSED_W = 80;

  // Adjust margin based on whether sidebar is shown (only on non-mobile)
  const marginLeft = isMobileView ? 0 : SIDEBAR_WIDTH; // Use fixed width when sidebar is shown

  // Handle selection from either Sidebar or BottomNavBar
  const handleSelect = ({ key }) => {
    // Prevent selection if 'add' button is clicked (it has its own action)
    if (key !== 'add') {
        // Map 'account' key from bottom nav to 'settings' if needed
        setSelected(key === 'account' ? 'settings' : key);
    }
  };


  const renderContent = () => {
    // Add 'account' case if it's a distinct page
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
        return <ChartsPage />;

      case 'settings': // This corresponds to 'Account' on bottom nav
        return <Title level={3}>Account/Settings (Placeholder)</Title>;

      default:
        return <Title level={3}>Not Found</Title>;
    }
  };

  // Add paddingBottom to content when bottom nav is visible
  const contentStyle = {
      padding: 'var(--space-24)',
      margin: 0,
      flexGrow: 1,
      paddingBottom: isMobileView ? '80px' : 'var(--space-24)' // Add extra padding (nav height + buffer)
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Conditionally render Sidebar only on larger screens */}
      {!isMobileView && (
          <Sidebar
            // collapsed={collapsed} // Sidebar can manage its own collapse internally if needed
            // onCollapse={setCollapsed}
            selectedKey={selectedMenuKey}
            onSelect={handleSelect} // Use unified handler
            width={SIDEBAR_WIDTH}
            // collapsedWidth={SIDEBAR_COLLAPSED_W}
          />
      )}

      <Layout
        style={{
          marginLeft, // Apply dynamic margin
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
        <Content style={contentStyle}> {/* Apply style with bottom padding */}
          {renderContent()}
        </Content>
        <AppFooter /> {/* Footer might need adjustment if overlapping with bottom nav */}
      </Layout>

      {/* Conditionally render BottomNavBar only on smaller screens */}
      {isMobileView && (
          <BottomNavBar
              selectedKey={selectedMenuKey}
              onSelect={handleSelect} // Use unified handler
          />
      )}
    </Layout>
  );
}

export default MyApp;