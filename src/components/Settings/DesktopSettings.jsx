// src/components/Settings/DesktopSettings.jsx
import React, { useState, useContext } from 'react';
import { 
  Layout, Card, List, Switch, Avatar, Typography, Divider, 
  Radio, Segmented, Badge, Space, Button, Drawer, Row, Col, 
  message, Tabs, Menu
} from 'antd';
import { 
  IconUser, IconMoonStars, IconSun, IconBrightnessHalf, 
  IconSettings, IconLogout, IconChevronRight, IconChartBar, 
  IconCreditCard, IconMail, IconNotification, IconLock,
  IconArrowLeft, IconFileDots, IconCloudUpload, IconHelpCircle,
  IconPalette, IconAlertTriangle, IconGraph, IconEye, IconEyeOff,
  IconDashboard, IconShieldLock, IconInfoCircle, IconDeviceDesktop
} from '@tabler/icons-react';
import { FinanceContext } from '../../contexts/FinanceContext';
import './Settings.css';

const { Title, Text } = Typography;
const { Content, Sider } = Layout;
const { TabPane } = Tabs;

const DesktopSettings = () => {
  // State management
  const [theme, setTheme] = useState('light');
  const [showPaidBills, setShowPaidBills] = useState(false);
  const [showCreditCards, setShowCreditCards] = useState(true);
  const [chartType, setChartType] = useState('pie');
  const [activeTab, setActiveTab] = useState('app');
  
  // Get context data for any settings that should persist
  const financeContext = useContext(FinanceContext);
  
  // Handle theme change
  const handleThemeChange = (value) => {
    setTheme(value);
    // You would implement actual theme changing logic here
    message.success(`Theme switched to ${value} mode`);
  };
  
  // Toggle showing paid bills
  const handleTogglePaidBills = (checked) => {
    setShowPaidBills(checked);
    message.success(`${checked ? 'Showing' : 'Hiding'} paid bills`);
    // Implement actual state change in your app
  };
  
  // Toggle showing credit cards
  const handleToggleCreditCards = (checked) => {
    setShowCreditCards(checked);
    message.success(`${checked ? 'Showing' : 'Hiding'} credit cards`);
    // Implement actual state change in your app
  };
  
  // Change chart type
  const handleChartTypeChange = (value) => {
    setChartType(value);
    message.success(`Chart type set to ${value}`);
    // Implement actual chart type change
  };
  
  // Handle menu item clicks for the sidebar
  const handleMenuClick = (e) => {
    setActiveTab(e.key);
  };
  
  // Define sidebar menu items
  const menuItems = [
    {
      key: 'app',
      icon: <IconDeviceDesktop size={18} />,
      label: 'App Preferences'
    },
    {
      key: 'display',
      icon: <IconPalette size={18} />,
      label: 'Display & Theme'
    },
    {
      key: 'charts',
      icon: <IconGraph size={18} />,
      label: 'Chart Preferences'
    },
    {
      key: 'account',
      icon: <IconUser size={18} />,
      label: 'Account'
    },
    {
      key: 'security',
      icon: <IconShieldLock size={18} />,
      label: 'Security & Privacy'
    },
    {
      key: 'about',
      icon: <IconInfoCircle size={18} />,
      label: 'About'
    }
  ];
  
  // Render content based on the active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'app':
        return (
          <>
            <Title level={4}>App Preferences</Title>
            <Card bordered={false} className="settings-content-card">
              <List
                itemLayout="horizontal"
                className="settings-list"
              >
                <List.Item
                  actions={[
                    <Switch 
                      key="paid-bills-switch"
                      checked={showPaidBills}
                      onChange={handleTogglePaidBills}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={showPaidBills ? 
                      <IconEye size={22} style={{ color: 'var(--primary-600)' }} /> : 
                      <IconEyeOff size={22} style={{ color: 'var(--neutral-500)' }} />
                    }
                    title="Show Paid Bills"
                    description="Display bills that have already been paid in bill lists"
                  />
                </List.Item>
                
                <List.Item
                  actions={[
                    <Switch 
                      key="credit-cards-switch"
                      checked={showCreditCards}
                      onChange={handleToggleCreditCards}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={<IconCreditCard size={22} style={{ color: showCreditCards ? 'var(--primary-600)' : 'var(--neutral-500)' }} />}
                    title="Show Credit Cards"
                    description="Display credit cards in the sidebar navigation"
                  />
                </List.Item>
              </List>
            </Card>
          </>
        );
      
      case 'display':
        return (
          <>
            <Title level={4}>Display & Theme</Title>
            <Card bordered={false} className="settings-content-card">
              <List
                itemLayout="horizontal"
                className="settings-list"
              >
                <List.Item
                  actions={[
                    <Segmented
                      key="theme-segmented"
                      value={theme}
                      onChange={handleThemeChange}
                      options={[
                        {
                          value: 'light',
                          icon: <IconSun size={16} />,
                          label: 'Light'
                        },
                        {
                          value: 'auto',
                          icon: <IconBrightnessHalf size={16} />,
                          label: 'Auto'
                        },
                        {
                          value: 'dark',
                          icon: <IconMoonStars size={16} />,
                          label: 'Dark'
                        }
                      ]}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={<IconPalette size={22} style={{ color: 'var(--primary-600)' }} />}
                    title="Theme Mode"
                    description="Choose your preferred application theme"
                  />
                </List.Item>
                
                <List.Item>
                  <List.Item.Meta
                    avatar={<IconDashboard size={22} style={{ color: 'var(--primary-600)' }} />}
                    title="Default Landing Page"
                    description="Set which screen appears when you open the app"
                  />
                  <Radio.Group defaultValue="dashboard">
                    <Radio value="dashboard">Dashboard</Radio>
                    <Radio value="finance-feed">Finance Feed</Radio>
                    <Radio value="reports">Reports</Radio>
                  </Radio.Group>
                </List.Item>
              </List>
            </Card>
          </>
        );
        
      case 'charts':
        return (
          <>
            <Title level={4}>Chart Preferences</Title>
            <Card bordered={false} className="settings-content-card">
              <List
                itemLayout="horizontal"
                className="settings-list"
              >
                <List.Item
                  actions={[
                    <Radio.Group
                      key="chart-type-radio"
                      value={chartType}
                      onChange={(e) => handleChartTypeChange(e.target.value)}
                      optionType="button"
                      buttonStyle="solid"
                    >
                      <Radio.Button value="pie">Pie</Radio.Button>
                      <Radio.Button value="bar">Bar</Radio.Button>
                      <Radio.Button value="line">Line</Radio.Button>
                    </Radio.Group>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<IconGraph size={22} style={{ color: 'var(--primary-600)' }} />}
                    title="Default Chart Type"
                    description="Set your preferred chart visualization for reports"
                  />
                </List.Item>
                
                <List.Item>
                  <List.Item.Meta
                    avatar={<IconChartBar size={22} style={{ color: 'var(--primary-600)' }} />}
                    title="Chart Color Scheme"
                    description="Select color palette for your charts and reports"
                  />
                  <Radio.Group defaultValue="default">
                    <Radio.Button value="default">Default</Radio.Button>
                    <Radio.Button value="pastel">Pastel</Radio.Button>
                    <Radio.Button value="vibrant">Vibrant</Radio.Button>
                  </Radio.Group>
                </List.Item>
              </List>
            </Card>
          </>
        );
        
      case 'account':
        return (
          <>
            <Title level={4}>Account Settings</Title>
            <Card bordered={false} className="settings-content-card account-settings-card">
              <div className="account-profile-section">
                <Avatar size={80} src="https://via.placeholder.com/80" />
                <div className="account-info">
                  <Title level={4} style={{ margin: 0 }}>John Doe</Title>
                  <Text type="secondary">john.doe@example.com</Text>
                  <Button type="primary" size="small" style={{ marginTop: 12 }}>
                    Edit Profile
                  </Button>
                </div>
              </div>
              
              <Divider />
              
              <List
                itemLayout="horizontal"
                className="settings-list"
              >
                <List.Item className="clickable-list-item">
                  <List.Item.Meta
                    avatar={<IconUser size={22} />}
                    title="Personal Information"
                    description="Name, email, profile photo"
                  />
                  <IconChevronRight size={18} />
                </List.Item>
                
                <List.Item className="clickable-list-item">
                  <List.Item.Meta
                    avatar={<IconNotification size={22} />}
                    title="Notifications"
                    description="Configure bill reminders and alerts"
                  />
                  <IconChevronRight size={18} />
                </List.Item>
                
                <List.Item className="clickable-list-item">
                  <List.Item.Meta
                    avatar={<IconMail size={22} />}
                    title="Communication Preferences"
                    description="Email preferences and newsletter settings"
                  />
                  <IconChevronRight size={18} />
                </List.Item>
                
                <List.Item className="clickable-list-item">
                  <List.Item.Meta
                    avatar={<IconCloudUpload size={22} />}
                    title="Backup & Sync"
                    description="Manage cloud storage and data backup"
                  />
                  <IconChevronRight size={18} />
                </List.Item>
                
                <List.Item className="clickable-list-item">
                  <List.Item.Meta
                    avatar={<IconFileDots size={22} />}
                    title="Export Data"
                    description="Download your financial records"
                  />
                  <IconChevronRight size={18} />
                </List.Item>
              </List>
              
              <Divider />
              
              <Button 
                danger 
                type="primary" 
                icon={<IconLogout size={16} />}
                style={{ marginTop: 12 }}
              >
                Log Out
              </Button>
            </Card>
          </>
        );
        
      case 'security':
        return (
          <>
            <Title level={4}>Security & Privacy</Title>
            <Card bordered={false} className="settings-content-card">
              <List
                itemLayout="horizontal"
                className="settings-list"
              >
                <List.Item className="clickable-list-item">
                  <List.Item.Meta
                    avatar={<IconShieldLock size={22} />}
                    title="Change Password"
                    description="Update your account password"
                  />
                  <IconChevronRight size={18} />
                </List.Item>
                
                <List.Item className="clickable-list-item">
                  <List.Item.Meta
                    avatar={<IconLock size={22} />}
                    title="Two-Factor Authentication"
                    description="Add an extra layer of security"
                  />
                  <Switch defaultChecked />
                </List.Item>
                
                <List.Item className="clickable-list-item">
                  <List.Item.Meta
                    avatar={<IconShieldLock size={22} />}
                    title="Privacy Settings"
                    description="Manage data collection and usage"
                  />
                  <IconChevronRight size={18} />
                </List.Item>
                
                <List.Item className="clickable-list-item">
                  <List.Item.Meta
                    avatar={<IconLock size={22} />}
                    title="App Lock"
                    description="Require authentication to open app"
                  />
                  <Switch />
                </List.Item>
              </List>
            </Card>
          </>
        );
        
      case 'about':
        return (
          <>
            <Title level={4}>About</Title>
            <Card bordered={false} className="settings-content-card">
              <List
                itemLayout="horizontal"
                className="settings-list"
              >
                <List.Item>
                  <List.Item.Meta
                    title="Version"
                    description="1.0.0 (Build 1234)"
                  />
                </List.Item>
                
                <List.Item className="clickable-list-item">
                  <List.Item.Meta
                    title="Terms of Service"
                    description="Review our terms of service"
                  />
                  <IconChevronRight size={18} />
                </List.Item>
                
                <List.Item className="clickable-list-item">
                  <List.Item.Meta
                    title="Privacy Policy"
                    description="Review our privacy policy"
                  />
                  <IconChevronRight size={18} />
                </List.Item>
                
                <List.Item className="clickable-list-item">
                  <List.Item.Meta
                    title="Licenses"
                    description="Third-party licenses"
                  />
                  <IconChevronRight size={18} />
                </List.Item>
                
                <List.Item className="clickable-list-item">
                  <List.Item.Meta
                    title="Help & Support"
                    description="Get help with the app"
                  />
                  <IconChevronRight size={18} />
                </List.Item>
              </List>
              
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <img 
                  src="https://via.placeholder.com/120" 
                  alt="App Logo" 
                  style={{ width: 120, height: 120, marginBottom: 16 }}
                />
                <div>
                  <Text strong>Financely</Text>
                </div>
                <Text type="secondary">© 2025 Financely. All rights reserved.</Text>
              </div>
            </Card>
          </>
        );
        
      default:
        return (
          <div>
            <Title level={4}>Select a category</Title>
            <Text>Please select a settings category from the menu on the left.</Text>
          </div>
        );
    }
  };
  
  return (
    <Layout className="desktop-settings-layout">
      <Sider
        width={240}
        theme="light"
        className="settings-sidebar"
        style={{
          borderRight: '1px solid var(--neutral-200)',
          height: '100%',
          overflow: 'auto'
        }}
      >
        <div className="settings-sidebar-header">
          <Text strong style={{ fontSize: '1rem' }}>Settings</Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Content className="settings-content">
        <div className="settings-content-container">
          {renderContent()}
        </div>
      </Content>
    </Layout>
  );
};

export default DesktopSettings;