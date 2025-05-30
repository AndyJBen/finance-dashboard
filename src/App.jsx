import React, { useState, useContext, useEffect } from 'react';
import { Layout, Row, Col, Typography, Grid } from 'antd';
import { FinanceContext } from './contexts/FinanceContext';
import FinancialOverviewCards from './components/FinancialSummary/FinancialOverviewCards';
import FinanceFeed from './components/FinanceFeed/FinanceFeed';
import Sidebar from './components/Sidebar/Sidebar';
import CombinedBillsOverview from './components/FinancialSummary/CombinedBillsOverview/CombinedBillsOverview';
import AppFooter from './components/Footer/Footer';
import ChartsPage from './components/ChartsPage/ChartsPage';
import BottomNavBar from './components/Navigation/BottomNavBar/BottomNavBar';
import EditBillModal from './components/PopUpModals/EditBillModal';
import SettingsPage from './components/Settings/SettingsPage';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import MultiBillModal from './components/PopUpModals/MultiBillModal';
import BankBalanceEditModal from './components/PopUpModals/BankBalanceEditModal';

const { Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

function MyApp() {
  const [selectedMenuKey, setSelected] = useState('dashboard');
  const screens = useBreakpoint();
  const isMobileView = !screens.md;

  useEffect(() => {
    if (isMobileView) {
      window.scrollTo(0, 0);
    }
  }, [isMobileView]);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [isMultiBillModalVisible, setIsMultiBillModalVisible] = useState(false);
  const [isBillsListExpanded, setIsBillsListExpanded] = useState(true);

  const financeContext = useContext(FinanceContext);
  const addBill = financeContext ? financeContext.addBill : () => console.error("FinanceContext not available for addBill");
  const updateBill = financeContext ? financeContext.updateBill : () => console.error("FinanceContext not available for updateBill");
  const toggleBankBalanceEdit = financeContext ? financeContext.toggleBankBalanceEdit : () => console.error("FinanceContext not available for toggleBankBalanceEdit");
  const isEditingBankBalance = financeContext ? financeContext.isEditingBankBalance : false;

  const handleOpenAddBillModal = () => {
    setIsMultiBillModalVisible(true);
  };

  const handleOpenEditBillModal = (billRecord) => {
    setEditingBill(billRecord);
    setIsEditModalVisible(true);
  };

  const handleModalClose = () => {
    setIsEditModalVisible(false);
    setEditingBill(null);
  };

  const handleCloseMultiBillModal = () => {
    setIsMultiBillModalVisible(false);
  };

  const handleModalSubmit = async (values) => {
    let success = false;
    try {
      if (editingBill) {
        if (updateBill) {
          success = await updateBill(editingBill.id, values);
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

  const handleOpenEditBalanceModal = () => {
    if (toggleBankBalanceEdit) {
      toggleBankBalanceEdit(true);
    }
  };

  const SIDEBAR_WIDTH = 240;
  const marginLeft = isMobileView ? 0 : SIDEBAR_WIDTH;

  const handleSelect = ({ key }) => {
    if (key !== 'add' && key !== 'action') {
      setSelected(key === 'account' ? 'settings' : key);
    }
  };

  const handleBillsExpansionChange = (isExpanded) => {
    setIsBillsListExpanded(isExpanded);
  };

  const renderContent = () => {
    switch (selectedMenuKey) {
      case 'dashboard':
        return (
          <Row gutter={isMobileView ? [8, 16] : [24, 24]}>
            <Col xs={24} lg={17}>
              <FinancialOverviewCards />
              <div style={{
                marginBottom: (isMobileView && isBillsListExpanded) ? '60px' : '0px',
                transition: 'margin-bottom 0.2s ease-in-out'
              }}>
                <div style={{ marginTop: isMobileView ? 0 : 24 }}>
                  <CombinedBillsOverview
                    style={{ height: '100%' }}
                    onEditBill={handleOpenEditBillModal}
                    onAddBill={handleOpenAddBillModal}
                    onExpansionChange={handleBillsExpansionChange}
                  />
                </div>
              </div>
            </Col>

            {!isMobileView && (
              <Col xs={24} lg={7} style={{ width: '100%' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                    width: '100%'
                  }}
                >
                  {}
                </div>
              </Col>
            )}
          </Row>
        );

      case 'finance-feed':
        return <FinanceFeed
          isMobileView={isMobileView}
          onEditBill={handleOpenEditBillModal}
          onAddBill={handleOpenAddBillModal}
        />;

      case 'reports':
        return <ChartsPage />;

      case 'settings':
        return <SettingsPage isMobileView={isMobileView} />;

      default:
        return <Title level={3}>Not Found</Title>;
    }
  };

  const contentStyle = {
    padding: isMobileView ? '0 var(--space-12)' : 'var(--space-24)',
    margin: 0,
    flexGrow: 1,
    width: '100%',
    maxWidth: '100%',
    paddingBottom: isMobileView ? (isBillsListExpanded ? '100px' : '80px') : 'var(--space-24)'
  };

  return (
    <ErrorBoundary>
      <Layout style={{ minHeight: '100vh', maxWidth: '100vw', overflow: 'hidden' }}>
        {!isMobileView && (
          <Sidebar
            selectedKey={selectedMenuKey}
            onSelect={handleSelect}
            width={SIDEBAR_WIDTH}
            onEditBalance={handleOpenEditBalanceModal}
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
          className={isBillsListExpanded ? 'expanded-bills-list' : 'collapsed-bills-list'}
        >
          <Content style={contentStyle}>
            <div key={selectedMenuKey}
              className={isMobileView ? 'page-transition' : undefined}>
              {renderContent()}
            </div>
          </Content>
          <AppFooter />
        </Layout>

        {isMobileView && (
          <BottomNavBar
            selectedKey={selectedMenuKey}
            onSelect={handleSelect}
            onAddClick={handleOpenAddBillModal}
            onEditBalanceClick={handleOpenEditBalanceModal}
          />
        )}

        {isEditModalVisible && (
          <EditBillModal
            open={isEditModalVisible}
            onCancel={handleModalClose}
            onSubmit={handleModalSubmit}
            bill={editingBill}
          />
        )}

        <MultiBillModal
          open={isMultiBillModalVisible}
          onClose={handleCloseMultiBillModal}
        />

        <BankBalanceEditModal
          open={isEditingBankBalance}
          onClose={() => toggleBankBalanceEdit(false)}
        />
      </Layout>

      <style jsx global>{`
        @media (max-width: 768px) {
          .ant-layout-content {
            padding-bottom: env(safe-area-inset-bottom, 20px) !important;
          }
          .expanded-bills-list .ant-layout-content {
            padding-bottom: calc(env(safe-area-inset-bottom, 20px) + 80px) !important;
          }
          .collapsed-bills-list .ant-layout-content {
            padding-bottom: calc(env(safe-area-inset-bottom, 20px) + 60px) !important;
          }
          .bottom-navbar {
            z-index: 1001 !important;
            bottom: env(safe-area-inset-bottom, 0px) !important;
          }
        }
      `}</style>
    </ErrorBoundary>
  );
}

export default MyApp;
