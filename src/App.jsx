// src/App.jsx
// Updated with Finance Feed tab replacing Bills tab
// And Dashboard right column hidden on mobile view
// Added conditional bottom margin for CombinedBillsOverview on mobile when expanded
// Corrected import path for FinanceContext
// Increased conditional margin for expanded list on mobile
// Integrated SettingsPage component

import React, { useState, useContext, useEffect } from 'react';
import { Layout, Row, Col, Typography, Grid } from 'antd';
// --- CORRECTED IMPORT PATH ---
import { FinanceContext } from './contexts/FinanceContext'; // Correct path from src/App.jsx
// --- END CORRECTION ---

// Core pages/components
import FinancialOverviewCards from './components/FinancialSummary/FinancialOverviewCards';
import BillsList              from './components/BillsList/BillsList';
import FinanceFeed            from './components/FinanceFeed/FinanceFeed';
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
import SettingsPage           from './components/Settings/SettingsPage'; // Import SettingsPage


const { Content } = Layout;
const { Title }   = Typography;
const { useBreakpoint } = Grid;

function MyApp() {
  // State for selected menu item
  const [selectedMenuKey, setSelected] = useState('dashboard');
  // Screen size detection
  const screens = useBreakpoint();
  // Determine if the view is mobile (medium breakpoint and below)
  const isMobileView = !screens.md;

  // State for Edit/Add Bill Modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState(null); // Holds the bill data when editing

  // State for CombinedBillsOverview Expansion
  // Default to true because the list starts expanded (isTableCollapsed starts false in CombinedBillsOverview)
  const [isBillsListExpanded, setIsBillsListExpanded] = useState(true);

  // Finance Context - Access data and functions from the provider
  const financeContext = useContext(FinanceContext);
  // Provide fallback functions to prevent errors if context is not yet available during initial render
  const addBill = financeContext ? financeContext.addBill : () => console.error("FinanceContext not available for addBill");
  const updateBill = financeContext ? financeContext.updateBill : () => console.error("FinanceContext not available for updateBill");


  // --- Modal Handlers ---

  // Opens the modal in 'Add' mode
  const handleOpenAddBillModal = () => {
    setEditingBill(null); // Ensure no bill data is pre-filled
    setIsEditModalVisible(true);
  };

  // Opens the modal in 'Edit' mode with the selected bill's data
  const handleOpenEditBillModal = (billRecord) => {
    setEditingBill(billRecord); // Pre-fill modal with the bill to edit
    setIsEditModalVisible(true);
  };

  // Closes the modal and resets the editing state
  const handleModalClose = () => {
    setIsEditModalVisible(false);
    setEditingBill(null);
  };

  // Handles form submission from the EditBillModal
  const handleModalSubmit = async (values) => {
    let success = false;
    try {
        // If editingBill has data, we are in 'Edit' mode
        if (editingBill) {
          if (updateBill) { // Check if updateBill function exists
              // Pass the bill ID and the updated values
              success = await updateBill(editingBill.id, values);
          }
        // Otherwise, we are in 'Add' mode
        } else {
          if (addBill) { // Check if addBill function exists
              // Pass the new bill values
              success = await addBill(values);
          }
        }
        // If the add/update operation was successful, close the modal
        if (success) {
          handleModalClose();
        } else {
            // Log an error if the operation failed (context function might return false)
            console.error("Failed to submit bill via modal.");
        }
    } catch (error) {
        // Log any errors during the async operation
        console.error("Error submitting bill modal:", error);
    }
  };

  // --- Layout Configuration ---
  const SIDEBAR_WIDTH = 240; // Width of the sidebar for desktop view
  // Adjust left margin for main content based on whether the sidebar is visible (desktop only)
  const marginLeft = isMobileView ? 0 : SIDEBAR_WIDTH;

  // --- Navigation Handler ---
  // Updates the selected menu key based on sidebar/bottom nav clicks
  const handleSelect = ({ key }) => {
    // Ignore clicks on 'add' or the 'action' button key (center button on mobile)
    if (key !== 'add' && key !== 'action') {
        // Map 'account' key (from bottom nav) to 'settings' if needed, otherwise use the key directly
        setSelected(key === 'account' ? 'settings' : key);
    }
  };

  // --- Handler for Bills List Expansion State Change ---
  // This function will be passed down to CombinedBillsOverview via props
  // It updates the state in App.jsx when the list expands/collapses
  const handleBillsExpansionChange = (isExpanded) => {
      setIsBillsListExpanded(isExpanded);
  };


  // --- Content Rendering Logic ---
  // Determines which main component/page to render based on the selectedMenuKey
  const renderContent = () => {
    switch (selectedMenuKey) {
      case 'dashboard':
        return (
          <Row gutter={isMobileView ? [8, 16] : [24, 24]}>
            {/* Left Column (Financial Overview & Combined Bills) */}
            <Col xs={24} lg={17}>
              <FinancialOverviewCards />
              {/* Wrapper Div for Conditional Margin */}
              {/* This div adds space below CombinedBillsOverview ONLY on mobile when the list is expanded */}
              <div style={{
                  // *** INCREASED MARGIN BOTTOM ***
                  // Apply margin bottom ONLY when on mobile AND the list is expanded
                  marginBottom: (isMobileView && isBillsListExpanded) ? '40px' : '0px', // Increased from 20px
                  // Optional: Add a smooth transition for the margin change
                  transition: 'margin-bottom 0.2s ease-in-out'
              }}>
                {/* Inner div for consistent top margin */}
                <div style={{ marginTop: isMobileView ? 5 : 24 }}>
                  <CombinedBillsOverview
                    style={{ height: '100%' }}
                    // Pass modal handlers down
                    onEditBill={handleOpenEditBillModal}
                    onAddBill={handleOpenAddBillModal}
                    // Pass the expansion change handler down
                    onExpansionChange={handleBillsExpansionChange}
                  />
                </div>
              </div>
              {/* End Wrapper Div */}
            </Col>

            {/* Right Column (Feed Cards) - Conditionally rendered: ONLY ON DESKTOP */}
            {!isMobileView && ( // Only render this column if isMobileView is false
              <Col xs={24} lg={7} style={{ width: '100%' }}>
                {/* Container div for the right-column cards */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24, // Use fixed gap for desktop view
                    width: '100%'
                  }}
                >
                  {/* These components will now ONLY render when !isMobileView */}
                  <BillPrepCard style={{ width: '100%', height: 'auto' }} />
                  <PastDuePayments style={{ width: '100%', height: 'auto' }} />
                  <NonRecurringTransactions style={{ width: '100%', height: 'auto' }} />
                  <UpcomingPayments style={{ width: '100%', height: 'auto' }} />
                  <ActivityFeed style={{ width: '100%', height: 'auto' }} />
                </div>
              </Col>
            )}
          </Row>
        );

      case 'finance-feed': // Renders the FinanceFeed component
        return <FinanceFeed
          isMobileView={isMobileView} // Pass mobile view status
          // Pass modal handlers
          onEditBill={handleOpenEditBillModal}
          onAddBill={handleOpenAddBillModal}
        />;

      case 'reports': // Renders the ChartsPage component
        return <ChartsPage />;

      case 'settings': // Renders the SettingsPage component
        return <SettingsPage isMobileView={isMobileView} />; // Pass mobile view status

      default: // Fallback for unknown routes
        return <Title level={3}>Not Found</Title>;
    }
  };

  // --- Main Content Area Styling ---
  const contentStyle = {
    padding: isMobileView ? 'var(--space-4) var(--space-12)' : 'var(--space-24)', // Responsive padding (top, left, right)
    margin: 0,
    flexGrow: 1, // Allow content to fill available space
    width: '100%',
    maxWidth: '100%',
    // Use original mobile padding - extra space is now handled by the conditional margin above
    paddingBottom: isMobileView ? '80px' : 'var(--space-24)'
  };

  // --- Component Return JSX ---
  return (
    <Layout style={{ minHeight: '100vh', maxWidth: '100vw', overflow: 'hidden' }}>
      {/* Sidebar: Render only if not in mobile view */}
      {!isMobileView && (
          <Sidebar
            selectedKey={selectedMenuKey}
            onSelect={handleSelect}
            width={SIDEBAR_WIDTH}
            // Pass modal handlers if Sidebar needs to trigger them (optional)
            // onAddBill={handleOpenAddBillModal}
            // onEditBill={handleOpenEditBillModal}
          />
      )}

      {/* Main Layout Area (Content + Footer) */}
      <Layout
        style={{
          marginLeft, // Apply left margin for sidebar space on desktop
          transition: 'margin-left 0.2s', // Smooth transition for margin changes
          minHeight: '100vh',
          overflowY: 'auto', // Allow vertical scrolling for content
          overflowX: 'hidden', // Prevent horizontal scrolling
          overscrollBehaviorY: 'contain', // Prevent scrolling parent elements when content scrolls
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--neutral-100)', // Background color for content area
          width: '100%',
          maxWidth: '100%',
          padding: 0,
        }}
      >
        {/* Content Area */}
        <Content style={contentStyle}>
          {renderContent()} {/* Render the selected page content */}
        </Content>
        {/* Footer */}
        <AppFooter />
      </Layout>

      {/* Bottom Navigation Bar: Render only if in mobile view */}
      {isMobileView && (
          <BottomNavBar
              selectedKey={selectedMenuKey}
              onSelect={handleSelect}
              onAddClick={handleOpenAddBillModal} // Pass add handler to the center button action
              // Pass other action handlers if needed, e.g., for editing balance
              // onEditBalanceClick={handleOpenEditBalanceModal}
          />
      )}

      {/* Edit/Add Bill Modal: Render conditionally based on isEditModalVisible state */}
      {isEditModalVisible && (
          <EditBillModal
              open={isEditModalVisible} // Control visibility
              onCancel={handleModalClose} // Handler for closing the modal
              onSubmit={handleModalSubmit} // Handler for form submission
              initialData={editingBill} // Pass data for editing, or null for adding
          />
      )}
    </Layout>
  );
}

export default MyApp; // Export the main application component
