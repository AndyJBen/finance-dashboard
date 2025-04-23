// src/App.jsx
// Adjusted spacing and alignment in the dashboard view.

import React, { useState, useContext } from 'react';
import { Layout, Row, Col, Typography, Space, Grid } from 'antd'; // Space might be removed from left col
import { FinanceContext } from './contexts/FinanceContext';

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
import BottomNavBar         from './components/Navigation/BottomNavBar';
import EditBillModal        from './components/BillsList/EditBillModal';


const { Content } = Layout;
const { Title }   = Typography;
const { useBreakpoint } = Grid;

function MyApp() {
  const [selectedMenuKey, setSelected] = useState('dashboard');
  const screens = useBreakpoint();
  const isMobileView = !screens.md;

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  const financeContext = useContext(FinanceContext);
  const addBill = financeContext ? financeContext.addBill : () => console.error("FinanceContext not available for addBill");
  const updateBill = financeContext ? financeContext.updateBill : () => console.error("FinanceContext not available for updateBill");

  const handleOpenAddBillModal = () => { /* ... */ };
  const handleOpenEditBillModal = (billRecord) => { /* ... */ };
  const handleModalClose = () => { /* ... */ };
  const handleModalSubmit = async (values) => { /* ... */ };

  const SIDEBAR_WIDTH = 240;
  const marginLeft = isMobileView ? 0 : SIDEBAR_WIDTH;

  const handleSelect = ({ key }) => { /* ... */ };


  const renderContent = () => {
    switch (selectedMenuKey) {
      case 'dashboard':
        return (
          // Use standard gutter for spacing between columns AND rows
          <Row gutter={[24, 24]}>
            {/* --- Left Column --- */}
            <Col xs={24} lg={17}>
              {/* Removed Space component for better top alignment */}
              {/* Apply margin bottom directly to control spacing */}
              <FinancialOverviewCards style={{ marginBottom: '24px' }} />
              <CombinedBillsOverview style={{ height: '100%' }} onEditBill={handleOpenEditBillModal} onAddBill={handleOpenAddBillModal} />
            </Col>

            {/* --- Right Column --- */}
            <Col xs={24} lg={7}>
              {/* Keep Space here for consistent vertical spacing within this column */}
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
        return <BillsList onEditBill={handleOpenEditBillModal} onAddBill={handleOpenAddBillModal} />;
      case 'reports':
        return <ChartsPage />;
      case 'settings':
        return <Title level={3}>Account/Settings (Placeholder)</Title>;
      default:
        return <Title level={3}>Not Found</Title>;
    }
  };

  const contentStyle = { /* ... */ };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobileView && (
          <Sidebar /* ... props ... */ />
      )}

      <Layout style={{ marginLeft, /* ... other styles ... */ }}>
        <Content style={contentStyle}>
          {renderContent()}
        </Content>
        <AppFooter />
      </Layout>

      {isMobileView && (
          <BottomNavBar /* ... props ... */ />
      )}

      {isEditModalVisible && (
          <EditBillModal /* ... props ... */ />
      )}
    </Layout>
  );
}

// Implement the modal handlers if they were simplified above
MyApp.prototype.handleOpenAddBillModal = function() {
    this.setState({ editingBill: null, isEditModalVisible: true });
};
MyApp.prototype.handleOpenEditBillModal = function(billRecord) {
    this.setState({ editingBill: billRecord, isEditModalVisible: true });
};
MyApp.prototype.handleModalClose = function() {
    this.setState({ isEditModalVisible: false, editingBill: null });
};
MyApp.prototype.handleModalSubmit = async function(values) {
    const { editingBill } = this.state;
    const { addBill, updateBill } = this.context; // Assuming context is correctly setup
    let success = false;
    try {
        if (editingBill) {
            if (updateBill) success = await updateBill(editingBill, values);
        } else {
            if (addBill) success = await addBill(values);
        }
        if (success) {
            this.handleModalClose();
        } else {
            console.error("Failed to submit bill via modal.");
            // Add user feedback like message.error() here
        }
    } catch (error) {
        console.error("Error submitting bill modal:", error);
        // Add user feedback like message.error() here
    }
};


export default MyApp;
