// src/App.jsx
// Lifted state for EditBillModal, added handlers, and context access.

import React, { useState, useContext } from 'react'; // Added useContext
import { Layout, Row, Col, Typography, Space, Grid } from 'antd';
import { FinanceContext } from './contexts/FinanceContext'; // Import context

// Core pages/components
import FinancialOverviewCards from './components/FinancialSummary/FinancialOverviewCards/index.jsx';
import BillsList              from './components/BillsList/BillsList';
import UpcomingPayments       from './components/RecentActivity/UpcomingPayments';
import ActivityFeed           from './components/RecentActivity/ActivityFeed';
import Sidebar                from './components/Sidebar/Sidebar';
import CombinedBillsOverview  from './components/FinancialSummary/CombinedBillsOverview/CombinedBillsOverview';
import BillPrepCard           from './components/FinancialSummary/BillPrepCard';
import PastDuePayments        from './components/RecentActivity/PastDuePayments';
import AppFooter              from './components/Footer/Footer';
import ChartsPage             from './components/ChartsPage/ChartsPage';
import BottomNavBar           from './components/Navigation/BottomNavBar';
// Import the modal component itself
import EditBillModal          from './components/BillsList/EditBillModal';


const { Content } = Layout;
const { Title }   = Typography;
const { useBreakpoint } = Grid;

function MyApp() {
  const [selectedMenuKey, setSelected] = useState('dashboard');
  const screens = useBreakpoint();
  const isMobileView = !screens.md;

  // --- State Lifted Up for EditBillModal ---
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState(null); // null for Add, bill object for Edit

  // --- Get Context Functions for Modal Submit ---
  // Ensure FinanceProvider wraps this component in main.jsx or index.js
  const financeContext = useContext(FinanceContext);
   // Add checks to ensure context is loaded before destructuring
   const addBill = financeContext ? financeContext.addBill : () => console.error("FinanceContext not available for addBill");
   const updateBill = financeContext ? financeContext.updateBill : () => console.error("FinanceContext not available for updateBill");


  // --- Modal Handlers ---
  const handleOpenAddBillModal = () => {
    setEditingBill(null); // Ensure it's in 'Add' mode
    setIsEditModalVisible(true);
  };

  const handleOpenEditBillModal = (billRecord) => {
    setEditingBill(billRecord); // Set the bill to edit
    setIsEditModalVisible(true);
  };

  const handleModalClose = () => {
    setIsEditModalVisible(false);
    setEditingBill(null); // Reset editing state on close
  };

  const handleModalSubmit = async (values) => {
    let success = false;
    try {
        if (editingBill) {
          // Update existing bill
          if (updateBill) {
              success = await updateBill(editingBill, values); // Pass editingBill object
          }
        } else {
          // Add new bill
          if (addBill) {
              success = await addBill(values);
          }
        }

        if (success) {
          handleModalClose(); // Close modal on successful add/update
        } else {
            // Optional: Add specific error message if add/update function returns false/error
            console.error("Failed to submit bill via modal.");
            // Consider showing an Ant Design message.error here
        }
    } catch (error) {
        console.error("Error submitting bill modal:", error);
        // Show error message to user
        // message.error("An error occurred while saving the bill.");
    }
    // Error handling/messaging is likely within addBill/updateBill in context
  };
  // --- End Modal Handlers ---


  const SIDEBAR_WIDTH = 240;
  const marginLeft = isMobileView ? 0 : SIDEBAR_WIDTH;

  const handleSelect = ({ key }) => {
    if (key !== 'add') {
        setSelected(key === 'account' ? 'settings' : key);
    }
    // The 'add' button click is handled directly by handleOpenAddBillModal passed to BottomNavBar
  };


  const renderContent = () => {
    switch (selectedMenuKey) {
      case 'dashboard':
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={17}>
              {/* Use the imported (now single) component */}
              <FinancialOverviewCards />
              <div style={{ marginTop: 24 }}>
                <CombinedBillsOverview
                  style={{ height: '100%' }}
                  onEditBill={handleOpenEditBillModal} // Pass handler for editing
                  onAddBill={handleOpenAddBillModal} // Pass handler for adding via dropdown
                />
              </div>
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
        // BillsList might also need onEditBill and onAddBill if it has edit/add buttons
        return <BillsList onEditBill={handleOpenEditBillModal} onAddBill={handleOpenAddBillModal} />;

      case 'reports':
        return <ChartsPage />;

      case 'settings': // Corresponds to 'account' key
        return <Title level={3}>Account/Settings (Placeholder)</Title>;

      default:
        return <Title level={3}>Not Found</Title>;
    }
  };

  const contentStyle = {
      padding: 'var(--space-24)',
      margin: 0,
      flexGrow: 1,
      paddingBottom: isMobileView ? '80px' : 'var(--space-24)' // Add space for bottom nav
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
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
        }}
      >
        <Content style={contentStyle}>
          {renderContent()}
        </Content>
        {/* Footer might be visually hidden by BottomNavBar on mobile */}
        {/* Consider conditionally rendering Footer or adjusting layout further */}
        <AppFooter />
      </Layout>

      {isMobileView && (
          <BottomNavBar
              selectedKey={selectedMenuKey}
              onSelect={handleSelect}
              // Pass the specific handler for the add button
              onAddClick={handleOpenAddBillModal}
          />
      )}

      {/* Render EditBillModal globally, controlled by App state */}
      {/* Ensure EditBillModal is correctly imported */}
      {isEditModalVisible && (
          <EditBillModal
              open={isEditModalVisible}
              onCancel={handleModalClose}
              onSubmit={handleModalSubmit}
              initialData={editingBill} // Pass null for Add, bill object for Edit
          />
      )}
    </Layout>
  );
}

export default MyApp;