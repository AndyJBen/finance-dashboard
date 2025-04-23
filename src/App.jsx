// src/App.jsx
import React, { useState, useContext, useEffect } from 'react'; // Added useEffect
import { Layout, Row, Col, Typography, Space, Grid, ConfigProvider, theme } from 'antd'; // Added ConfigProvider and theme
import { FinanceContext } from './contexts/FinanceContext';

// Core pages/components imports remain the same
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
const { darkAlgorithm, defaultAlgorithm } = theme;

function MyApp() {
  const [selectedMenuKey, setSelected] = useState('dashboard');
  const screens = useBreakpoint();
  const isMobileView = !screens.md;
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || false
  );
  
  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode);
    
    // Optional: update CSS variables or body class for components that don't use Ant Design theme
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // --- State Lifted Up for EditBillModal ---
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  // --- Get Context Functions for Modal Submit ---
  const financeContext = useContext(FinanceContext);
  const addBill = financeContext ? financeContext.addBill : () => console.error("FinanceContext not available for addBill");
  const updateBill = financeContext ? financeContext.updateBill : () => console.error("FinanceContext not available for updateBill");

  // Toggle dark mode handler
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // --- Modal Handlers --- (Unchanged)
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

  // Create Ant Design theme with proper color algorithm
  const antTheme = {
    algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
    token: {
      colorPrimary: '#52c41a', // Your primary green color
      borderRadius: 6,
    },
    components: {
      Card: {
        colorBgContainer: isDarkMode ? '#1f1f1f' : '#ffffff',
      },
      Layout: {
        colorBgBody: isDarkMode ? '#141414' : 'var(--neutral-100)',
      },
    },
  };

  const renderContent = () => {
    switch (selectedMenuKey) {
      case 'dashboard':
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={17}>
              <FinancialOverviewCards />
              <div style={{ marginTop: 24 }}>
                <CombinedBillsOverview
                  style={{ height: '100%' }}
                  onEditBill={handleOpenEditBillModal}
                  onAddBill={handleOpenAddBillModal}
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
        return <BillsList onEditBill={handleOpenEditBillModal} onAddBill={handleOpenAddBillModal} />;

      case 'reports':
        return <ChartsPage />;

      case 'settings':
        return <Title level={3}>Account/Settings (Placeholder)</Title>;

      default:
        return <Title level={3}>Not Found</Title>;
    }
  };

  const contentStyle = {
      padding: 'var(--space-24)',
      margin: 0,
      flexGrow: 1,
      paddingBottom: isMobileView ? '80px' : 'var(--space-24)'
  };

  return (
    <ConfigProvider theme={antTheme}>
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
          }}
        >
          <Content style={contentStyle}>
            {renderContent()}
          </Content>
          <AppFooter isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
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
    </ConfigProvider>
  );
}

export default MyApp;