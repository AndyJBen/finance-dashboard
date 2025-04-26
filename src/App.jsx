// src/App.jsx
// Updated with Finance Feed tab replacing Bills tab

import React, { useState, useContext } from 'react';
import { Layout, Row, Col, Typography, Grid } from 'antd';
import { FinanceContext } from './contexts/FinanceContext';

// Core pages/components
import FinancialOverviewCards from './components/FinancialSummary/FinancialOverviewCards';
import BillsList              from './components/BillsList/BillsList';
import UpcomingPayments       from './components/RecentActivity/UpcomingPayments';
import ActivityFeed           from './components/RecentActivity/ActivityFeed';
import NonRecurringTransactions from './components/RecentActivity/NonRecurringTransactions';
import Sidebar                from './components/Sidebar/Sidebar';
import CombinedBillsOverview  from './components/FinancialSummary/CombinedBillsOverview/CombinedBillsOverview';
import BillPrepCard           from './components/FinancialSummary/BillPrepCard';
import PastDuePayments        from './components/RecentActivity/PastDuePayments';
import AppFooter              from './components/Footer/Footer';
import ChartsPage             from './components/ChartsPage/ChartsPage';
import BottomNavBar           from './components/Navigation/BottomNavBar';
import EditBillModal          from './components/BillsList/EditBillModal';
import FinanceFeed            from './components/FinanceFeed/FinanceFeed';


const { Content } = Layout;
const { Title }   = Typography;
const { useBreakpoint } = Grid;

function MyApp() {
  const [selectedMenuKey, setSelected] = useState('dashboard');
  const screens = useBreakpoint();
  const isMobileView = !screens.md;

  // State Lifted Up for EditBillModal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  // Get Context Functions for Modal Submit
  const financeContext = useContext(FinanceContext);
  const addBill = financeContext ? financeContext.addBill : () => console.error("FinanceContext not available for addBill");
  const updateBill = financeContext ? financeContext.updateBill : () => console.error("FinanceContext not available for updateBill");


  // Modal Handlers
  const handleOpenAddBillModal = () => {
    setEditingBill(null);
    setIsEditModalVisible(true);
  };

  const handleOpenEditBillModal = (billRecord) => {
    setEditingBill(billRecord);
    setIsEditModalVisible(true);
  };

  const handleModalClose = () => {
    setIsEditModalVisible(false);
    setEditingBill(null);
  };

  const handleModalSubmit = async (values) => {
    let success = false;
    try {
        if (editingBill) {
          if (updateBill) {
              success = await updateBill(editingBill, values);
          }
        } else {
          if (addBill) {
              success = await addBill(values);
          }
        }
        if (success) {
          handleModalClose();
        } else {
            console.error("Failed to submit bill via modal.");
        }
    } catch (error) {
        console.error("Error submitting bill modal:", error);
    }
  };


  const SIDEBAR_WIDTH = 240;
  const marginLeft = isMobileView ? 0 : SIDEBAR_WIDTH;

  const handleSelect = ({ key }) => {
    if (key !== 'add') {
        setSelected(key === 'account' ? 'settings' : key);
    }
  };


  const renderContent = () => {
    switch (selectedMenuKey) {
      case 'dashboard':
        return (
          <Row gutter={isMobileView ? [8, 16] : [24, 24]}>
            <Col xs={24} lg={17}>
              {/* Use the imported (now single) component */}
              <FinancialOverviewCards />
              <div style={{ marginTop: isMobileView ? 5 : 24 }}>
                <CombinedBillsOverview
                  style={{ height: '100%' }}
                  onEditBill={handleOpenEditBillModal} 
                  onAddBill={handleOpenAddBillModal} 
                />
              </div>
            </Col>
            <Col xs={24} lg={7} style={{ width: '100%' }}> 
              {/* Change from Space to div with flexDirection column */}
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: isMobileView ? 16 : 24, 
                  width: '100%' 
                }}
              >
                <BillPrepCard style={{ width: '100%', height: 'auto' }} />
                <PastDuePayments style={{ width: '100%', height: 'auto' }} />
                <NonRecurringTransactions style={{ width: '100%', height: 'auto' }} />
                <UpcomingPayments style={{ width: '100%', height: 'auto' }} />
                <ActivityFeed style={{ width: '100%', height: 'auto' }} />
              </div>
            </Col>
          </Row>
        );

      case 'finance-feed': // New Finance Feed tab (replacing 'bills')
        return <FinanceFeed 
          isMobileView={isMobileView} 
          onEditBill={handleOpenEditBillModal} 
          onAddBill={handleOpenAddBillModal} 
        />;

      // Keeping the hidden bills tab code in case you need it later
      // case 'bills': 
      //   return <BillsList onEditBill={handleOpenEditBillModal} onAddBill={handleOpenAddBillModal} />;

      case 'reports':
        return <ChartsPage />;

      case 'settings':
        return <Title level={3}>Account/Settings (Placeholder)</Title>;

      default:
        return <Title level={3}>Not Found</Title>;
    }
  };

  const contentStyle = {
    padding: isMobileView ? 'var(--space-4) var(--space-12)' : 'var(--space-24)',
    margin: 0,
    flexGrow: 1,
    width: '100%',
    maxWidth: '100%',
    paddingBottom: isMobileView ? '80px' : 'var(--space-24)'
  };

  return (
    <Layout style={{ minHeight: '100vh', maxWidth: '100vw', overflow: 'hidden' }}>
      {!isMobileView && (
          <Sidebar
            selectedKey={selectedMenuKey}
            onSelect={handleSelect}
            width={SIDEBAR_WIDTH}
          />
      )}

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
          width: '100%',
          maxWidth: '100%',
          padding: 0,
        }}
      >
        <Content style={contentStyle}>
          {renderContent()}
        </Content>
        <AppFooter />
      </Layout>

      {isMobileView && (
          <BottomNavBar
              selectedKey={selectedMenuKey}
              onSelect={handleSelect}
              onAddClick={handleOpenAddBillModal}
          />
      )}

      {isEditModalVisible && (
          <EditBillModal
              open={isEditModalVisible}
              onCancel={handleModalClose}
              onSubmit={handleModalSubmit}
              initialData={editingBill}
          />
      )}
    </Layout>
  );
}

export default MyApp;