// src/components/Settings/DesktopSettings.jsx
import React, { useState, useContext } from 'react';
import {
    Layout, Card, List, Switch, Avatar, Typography, Divider,
    Radio, Segmented, Space, Button, Row, Col, Menu
    // Removed unused: Badge, Drawer, Tabs, TabPane, message
} from 'antd';
import {
    IconUser, IconMoonStars, IconSun, IconBrightnessHalf,
    IconLogout, IconChevronRight, IconChartBar,
    IconCreditCard, IconMail, IconNotification, IconLock,
    IconFileDots, IconCloudUpload, IconHelpCircle,
    IconPalette, IconGraph, IconEye, IconEyeOff,
    IconDashboard, IconShieldLock, IconInfoCircle, IconDeviceDesktop
    // Removed unused: IconSettings, IconArrowLeft, IconAlertTriangle
} from '@tabler/icons-react';
import { FinanceContext } from '../../contexts/FinanceContext';
import './Settings.css'; // Ensure this CSS file exists and is correctly styled

const { Title, Text } = Typography;
const { Content, Sider } = Layout;
// Removed unused: TabPane

const DesktopSettings = () => {
    // Get settings from context with fallbacks
    const financeContext = useContext(FinanceContext);
    const { settings, updateSettings } = financeContext || {};

    // Provide default settings if context or settings object is unavailable
    // Add defaults for *all* settings used in this component
    const currentSettings = settings || {
        theme: 'auto',
        showPaidBills: false,
        showCreditCards: true,
        defaultChartType: 'pie',
        defaultLandingPage: 'dashboard', // Added default
        chartColorScheme: 'default',    // Added default
        twoFactorEnabled: false,       // Added default
        appLockEnabled: false,         // Added default
    };

    // Local state for UI
    const [activeTab, setActiveTab] = useState('app'); // Default to 'app' tab

    // --- Event Handlers ---

    const handleSettingUpdate = (update) => {
        if (updateSettings) {
            updateSettings(update);
        } else {
            console.warn("updateSettings function is not available from FinanceContext");
            // Handle error appropriately - maybe disable controls or show a message
        }
    };

    const handleThemeChange = (value) => {
        handleSettingUpdate({ theme: value });
    };

    const handleTogglePaidBills = (checked) => {
        handleSettingUpdate({ showPaidBills: checked });
    };

    const handleToggleCreditCards = (checked) => {
        handleSettingUpdate({ showCreditCards: checked });
    };

    const handleChartTypeChange = (value) => {
        handleSettingUpdate({ defaultChartType: value });
    };

    const handleLandingPageChange = (e) => {
        handleSettingUpdate({ defaultLandingPage: e.target.value });
    };

    // Added handler for Chart Color Scheme
    const handleChartColorSchemeChange = (e) => {
        handleSettingUpdate({ chartColorScheme: e.target.value });
    };

    // Added handler for Two-Factor Auth Toggle
    const handleToggleTwoFactor = (checked) => {
        handleSettingUpdate({ twoFactorEnabled: checked });
        // Add logic to actually initiate 2FA setup if enabled
        console.log("2FA Toggled:", checked);
    };

    // Added handler for App Lock Toggle
    const handleToggleAppLock = (checked) => {
        handleSettingUpdate({ appLockEnabled: checked });
        // Add logic for app lock setup/state
        console.log("App Lock Toggled:", checked);
    };

    // Handle menu item clicks for the sidebar
    const handleMenuClick = (e) => {
        setActiveTab(e.key);
    };

    // --- Placeholder Handlers for Actions ---
    const handleGenericItemClick = (itemTitle) => {
        console.log(`Clicked on settings item: ${itemTitle}`);
        // Implement navigation or modal opening logic here
        // e.g., navigate(`/settings/${itemTitle.toLowerCase().replace(/ /g, '-')}`);
    };

    const handleEditProfile = () => {
        console.log("Edit Profile clicked");
        // Implement logic to open profile editing modal/page
    };

    const handleLogout = () => {
        console.log("Logout clicked");
        // Implement actual logout logic
    };


    // --- Sidebar Menu ---
    const menuItems = [
        { key: 'app', icon: <IconDeviceDesktop size={18} />, label: 'App Preferences' },
        { key: 'display', icon: <IconPalette size={18} />, label: 'Display & Theme' },
        { key: 'charts', icon: <IconGraph size={18} />, label: 'Chart Preferences' },
        { key: 'account', icon: <IconUser size={18} />, label: 'Account' },
        { key: 'security', icon: <IconShieldLock size={18} />, label: 'Security & Privacy' },
        { key: 'about', icon: <IconInfoCircle size={18} />, label: 'About' }
    ];

    // --- Content Rendering ---
    const renderContent = () => {
        switch (activeTab) {
            case 'app':
                return (
                    <>
                        <Title level={4} style={{ marginBottom: 20 }}>App Preferences</Title>
                        <Card bordered={false} className="settings-content-card">
                            <List itemLayout="horizontal" className="settings-list">
                                <List.Item
                                    actions={[
                                        <Switch
                                            key="paid-bills-switch"
                                            checked={currentSettings.showPaidBills}
                                            onChange={handleTogglePaidBills}
                                            aria-label="Toggle showing paid bills"
                                        />
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={currentSettings.showPaidBills ?
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
                                            checked={currentSettings.showCreditCards}
                                            onChange={handleToggleCreditCards}
                                            aria-label="Toggle showing credit cards in sidebar"
                                        />
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<IconCreditCard size={22} style={{ color: currentSettings.showCreditCards ? 'var(--primary-600)' : 'var(--neutral-500)' }} />}
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
                        <Title level={4} style={{ marginBottom: 20 }}>Display & Theme</Title>
                        <Card bordered={false} className="settings-content-card">
                            <List itemLayout="horizontal" className="settings-list">
                                <List.Item
                                    actions={[
                                        <Segmented
                                            key="theme-segmented"
                                            value={currentSettings.theme}
                                            onChange={handleThemeChange}
                                            options={[
                                                { value: 'light', icon: <IconSun size={16} />, label: 'Light' },
                                                { value: 'auto', icon: <IconBrightnessHalf size={16} />, label: 'Auto' },
                                                { value: 'dark', icon: <IconMoonStars size={16} />, label: 'Dark' }
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
                                <List.Item
                                  actions={[
                                    <Radio.Group
                                      value={currentSettings.defaultLandingPage}
                                      onChange={handleLandingPageChange}
                                    >
                                      <Radio value="dashboard">Dashboard</Radio>
                                      <Radio value="finance-feed">Finance Feed</Radio>
                                      <Radio value="reports">Reports</Radio>
                                    </Radio.Group>
                                  ]}
                                >
                                    <List.Item.Meta
                                        avatar={<IconDashboard size={22} style={{ color: 'var(--primary-600)' }} />}
                                        title="Default Landing Page"
                                        description="Set which screen appears when you open the app"
                                    />

                                </List.Item>
                            </List>
                        </Card>
                    </>
                );

            case 'charts':
                return (
                    <>
                        <Title level={4} style={{ marginBottom: 20 }}>Chart Preferences</Title>
                        <Card bordered={false} className="settings-content-card">
                            <List itemLayout="horizontal" className="settings-list">
                                <List.Item
                                    actions={[
                                        <Radio.Group
                                            key="chart-type-radio"
                                            value={currentSettings.defaultChartType}
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
                                <List.Item
                                    actions={[ // Added actions wrapper
                                        // Connected value and onChange
                                        <Radio.Group
                                            key="chart-color-scheme-radio"
                                            value={currentSettings.chartColorScheme}
                                            onChange={handleChartColorSchemeChange}
                                            optionType="button" // Make consistent
                                            buttonStyle="solid" // Make consistent
                                        >
                                            <Radio.Button value="default">Default</Radio.Button>
                                            <Radio.Button value="pastel">Pastel</Radio.Button>
                                            <Radio.Button value="vibrant">Vibrant</Radio.Button>
                                        </Radio.Group>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<IconChartBar size={22} style={{ color: 'var(--primary-600)' }} />}
                                        title="Chart Color Scheme"
                                        description="Select color palette for your charts and reports"
                                    />
                                </List.Item>
                            </List>
                        </Card>
                    </>
                );

            case 'account':
                return (
                    <>
                        <Title level={4} style={{ marginBottom: 20 }}>Account Settings</Title>
                        <Card bordered={false} className="settings-content-card account-settings-card">
                            {/* TODO: Replace hardcoded user data with dynamic data from context/props */}
                            <div className="account-profile-section" style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                                <Avatar size={80} src="https://placehold.co/80x80/E0E0E0/BDBDBD?text=JD" onError={(e) => e.target.src='https://placehold.co/80x80/E0E0E0/BDBDBD?text=Err'} style={{ marginRight: 20 }} />
                                <div className="account-info">
                                    <Title level={5} style={{ margin: 0 }}>John Doe</Title>
                                    <Text type="secondary">john.doe@example.com</Text>
                                    <Button type="primary" size="small" style={{ marginTop: 12 }} onClick={handleEditProfile}>
                                        Edit Profile
                                    </Button>
                                </div>
                            </div>
                            <Divider />
                            <List itemLayout="horizontal" className="settings-list">
                                {/* Added onClick handlers */}
                                <List.Item className="clickable-list-item" onClick={() => handleGenericItemClick('Personal Information')}>
                                    <List.Item.Meta avatar={<IconUser size={22} />} title="Personal Information" description="Name, email, profile photo" />
                                    <IconChevronRight size={18} />
                                </List.Item>
                                <List.Item className="clickable-list-item" onClick={() => handleGenericItemClick('Notifications')}>
                                    <List.Item.Meta avatar={<IconNotification size={22} />} title="Notifications" description="Configure bill reminders and alerts" />
                                    <IconChevronRight size={18} />
                                </List.Item>
                                <List.Item className="clickable-list-item" onClick={() => handleGenericItemClick('Communication Preferences')}>
                                    <List.Item.Meta avatar={<IconMail size={22} />} title="Communication Preferences" description="Email preferences and newsletter settings" />
                                    <IconChevronRight size={18} />
                                </List.Item>
                                <List.Item className="clickable-list-item" onClick={() => handleGenericItemClick('Backup & Sync')}>
                                    <List.Item.Meta avatar={<IconCloudUpload size={22} />} title="Backup & Sync" description="Manage cloud storage and data backup" />
                                    <IconChevronRight size={18} />
                                </List.Item>
                                <List.Item className="clickable-list-item" onClick={() => handleGenericItemClick('Export Data')}>
                                    <List.Item.Meta avatar={<IconFileDots size={22} />} title="Export Data" description="Download your financial records" />
                                    <IconChevronRight size={18} />
                                </List.Item>
                            </List>
                            <Divider />
                            {/* Added onClick handler */}
                            <Button danger type="primary" icon={<IconLogout size={16} />} style={{ marginTop: 12 }} onClick={handleLogout}>
                                Log Out
                            </Button>
                        </Card>
                    </>
                );

            case 'security':
                return (
                    <>
                        <Title level={4} style={{ marginBottom: 20 }}>Security & Privacy</Title>
                        <Card bordered={false} className="settings-content-card">
                            <List itemLayout="horizontal" className="settings-list">
                                {/* Added onClick handlers */}
                                <List.Item className="clickable-list-item" onClick={() => handleGenericItemClick('Change Password')}>
                                    <List.Item.Meta avatar={<IconShieldLock size={22} />} title="Change Password" description="Update your account password" />
                                    <IconChevronRight size={18} />
                                </List.Item>
                                <List.Item
                                    // Removed clickable class if action is the switch
                                    actions={[
                                        // Connected checked and onChange
                                        <Switch
                                            key="two-factor-switch"
                                            checked={currentSettings.twoFactorEnabled}
                                            onChange={handleToggleTwoFactor}
                                            aria-label="Toggle Two-Factor Authentication"
                                        />
                                    ]}
                                >
                                    <List.Item.Meta avatar={<IconLock size={22} />} title="Two-Factor Authentication" description="Add an extra layer of security" />
                                </List.Item>
                                <List.Item className="clickable-list-item" onClick={() => handleGenericItemClick('Privacy Settings')}>
                                    <List.Item.Meta avatar={<IconShieldLock size={22} />} title="Privacy Settings" description="Manage data collection and usage" />
                                    <IconChevronRight size={18} />
                                </List.Item>
                                <List.Item
                                    // Removed clickable class if action is the switch
                                    actions={[
                                        // Connected checked and onChange
                                        <Switch
                                            key="app-lock-switch"
                                            checked={currentSettings.appLockEnabled}
                                            onChange={handleToggleAppLock}
                                            aria-label="Toggle App Lock"
                                        />
                                    ]}
                                >
                                    <List.Item.Meta avatar={<IconLock size={22} />} title="App Lock" description="Require authentication to open app" />
                                </List.Item>
                            </List>
                        </Card>
                    </>
                );

            case 'about':
                return (
                    <>
                        <Title level={4} style={{ marginBottom: 20 }}>About</Title>
                        <Card bordered={false} className="settings-content-card">
                            <List itemLayout="horizontal" className="settings-list">
                                {/* TODO: Consider making version dynamic */}
                                <List.Item>
                                    <List.Item.Meta title="Version" description="1.0.0 (Build 1234)" />
                                </List.Item>
                                {/* Added onClick handlers */}
                                <List.Item className="clickable-list-item" onClick={() => handleGenericItemClick('Terms of Service')}>
                                    <List.Item.Meta title="Terms of Service" description="Review our terms of service" />
                                    <IconChevronRight size={18} />
                                </List.Item>
                                <List.Item className="clickable-list-item" onClick={() => handleGenericItemClick('Privacy Policy')}>
                                    <List.Item.Meta title="Privacy Policy" description="Review our privacy policy" />
                                    <IconChevronRight size={18} />
                                </List.Item>
                                <List.Item className="clickable-list-item" onClick={() => handleGenericItemClick('Licenses')}>
                                    <List.Item.Meta title="Licenses" description="Third-party licenses" />
                                    <IconChevronRight size={18} />
                                </List.Item>
                                <List.Item className="clickable-list-item" onClick={() => handleGenericItemClick('Help & Support')}>
                                    <List.Item.Meta avatar={<IconHelpCircle size={22}/>} title="Help & Support" description="Get help with the app" />
                                    <IconChevronRight size={18} />
                                </List.Item>
                            </List>
                            {/* TODO: Replace placeholder logo */}
                            <div style={{ marginTop: 24, textAlign: 'center', opacity: 0.7 }}>
                                <img
                                    src="https://placehold.co/100x100/E0E0E0/BDBDBD?text=Logo"
                                    onError={(e) => e.target.src='https://placehold.co/100x100/E0E0E0/BDBDBD?text=Err'}
                                    alt="App Logo"
                                    style={{ width: 100, height: 100, marginBottom: 16, borderRadius: '8px' }}
                                />
                                <div><Text strong>Financely</Text></div>
                                <Text type="secondary">© 2025 Financely. All rights reserved.</Text>
                            </div>
                        </Card>
                    </>
                );

            default:
                return (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <Title level={4}>Select a category</Title>
                        <Text type="secondary">Please select a settings category from the menu on the left.</Text>
                    </div>
                );
        }
    };

    // --- Main Component Layout ---
    return (
        <Layout className="desktop-settings-layout" style={{ height: '100vh', background: 'var(--neutral-100)' }}> {/* Ensure layout takes height */}
            <Sider
                width={240}
                theme="light" // Or 'dark' depending on your base theme
                className="settings-sidebar"
                style={{
                    background: 'var(--neutral-0)', // Use CSS variables
                    borderRight: '1px solid var(--neutral-200)',
                    height: '100vh', // Make sidebar full height
                    overflowY: 'auto', // Allow scrolling if menu is long
                    position: 'fixed', // Fix sidebar position
                    left: 0,
                    top: 0,
                    bottom: 0,
                    paddingTop: '20px' // Add some padding at the top
                }}
            >
                <div className="settings-sidebar-header" style={{ padding: '0 16px 16px 24px' }}>
                    <Text strong style={{ fontSize: '1.1rem' }}>Settings</Text>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[activeTab]}
                    onClick={handleMenuClick}
                    items={menuItems}
                    style={{ borderRight: 0, background: 'transparent' }} // Remove menu border and background
                />
            </Sider>
            {/* Add marginLeft to Content to account for fixed Sider */}
            <Layout style={{ marginLeft: 240, background: 'var(--neutral-100)' }}>
                <Content className="settings-content" style={{ padding: '24px', overflowY: 'auto', height: '100vh' }}>
                    <div className="settings-content-container" style={{ maxWidth: '800px', margin: '0 auto' }}> {/* Limit content width */}
                        {renderContent()}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

// Single default export
export default DesktopSettings;
