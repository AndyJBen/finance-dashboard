// src/components/Settings/Settings.jsx
import React, { useState, useContext } from 'react';
import {
    Layout, Card, List, Switch, Avatar, Typography, Divider,
    Radio, Segmented, Space, Button, Drawer, Row, Col
    // Removed unused 'Badge' and 'message'
} from 'antd';
import {
    IconUser, IconMoonStars, IconSun, IconBrightnessHalf,
    IconLogout, IconChevronRight, IconCreditCard, IconMail, IconNotification, IconLock,
    IconArrowLeft, IconFileDots, IconCloudUpload, IconHelpCircle,
    IconPalette, IconGraph, IconEye, IconEyeOff
    // Removed unused 'IconSettings', 'IconChartBar', 'IconAlertTriangle'
} from '@tabler/icons-react';
import { FinanceContext } from '../../contexts/FinanceContext';
import './Settings.css'; // Make sure this CSS file exists and is correctly styled

// Destructure Typography components once
const { Title, Text } = Typography;

// Define the Settings component once
const Settings = ({ isMobile = true }) => {
    // Get settings and update function from context
    const financeContext = useContext(FinanceContext);

    // Ensure context provides the expected values, add fallback if necessary
    const { settings, updateSettings } = financeContext || {};
    const currentSettings = settings || { // Provide default settings if context is unavailable or settings are undefined
        theme: 'auto',
        showPaidBills: false,
        showCreditCards: true,
        defaultChartType: 'pie',
    };

    // Local state for UI elements like the drawer
    const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);

    // --- Event Handlers ---

    // Handle theme change - update context
    const handleThemeChange = (value) => {
        if (updateSettings) {
            updateSettings({ theme: value });
        } else {
            console.warn("updateSettings function is not available from FinanceContext");
            // Optionally handle locally or show an error
        }
    };

    // Toggle showing paid bills - update context
    const handleTogglePaidBills = (checked) => {
        if (updateSettings) {
            updateSettings({ showPaidBills: checked });
        } else {
            console.warn("updateSettings function is not available from FinanceContext");
        }
    };

    // Toggle showing credit cards - update context
    const handleToggleCreditCards = (checked) => {
        if (updateSettings) {
            updateSettings({ showCreditCards: checked });
        } else {
            console.warn("updateSettings function is not available from FinanceContext");
        }
    };

    // Change chart type - update context
    const handleChartTypeChange = (value) => {
        if (updateSettings) {
            updateSettings({ defaultChartType: value });
        } else {
            console.warn("updateSettings function is not available from FinanceContext");
        }
    };

    // --- Account Drawer ---

    const showAccountDrawer = () => {
        setAccountDrawerOpen(true);
    };

    const closeAccountDrawer = () => {
        setAccountDrawerOpen(false);
    };

    // TODO: Implement actual navigation or actions for these drawer items
    const handleAccountItemClick = (item) => {
        console.log(`Clicked on: ${item}`);
        // Example: navigate('/settings/personal-info') or open another modal/drawer
        // closeAccountDrawer(); // Optionally close drawer after click
    };

    const handleLogout = () => {
        console.log("Logout action triggered");
        // Implement actual logout logic here (e.g., clear auth token, redirect)
        closeAccountDrawer();
    };

    const renderAccountDrawer = () => (
        <Drawer
            title={
                <Space>
                    <Button
                        type="text"
                        icon={<IconArrowLeft size={18} />}
                        onClick={closeAccountDrawer}
                        style={{ marginRight: 8 }}
                        aria-label="Close account settings"
                    />
                    <span>Account Settings</span>
                </Space>
            }
            placement="right"
            onClose={closeAccountDrawer}
            open={accountDrawerOpen}
            width={isMobile ? '100%' : 400}
            styles={{ body: { padding: 0 } }} // Use 'styles' prop for antd v5+
            // 'style' prop might be needed for older versions or specific overrides
        >
            <List
                itemLayout="horizontal"
                className="settings-list account-settings-list"
            >
                {/* TODO: Replace hardcoded user data with data from context or props */}
                <List.Item>
                    <List.Item.Meta
                        avatar={<Avatar src="https://placehold.co/40x40/E0E0E0/BDBDBD?text=JD" onError={(e) => e.target.src='https://placehold.co/40x40/E0E0E0/BDBDBD?text=Err'} />} // Added placeholder/fallback
                        title="John Doe"
                        description="john.doe@example.com"
                    />
                </List.Item>

                {/* Added onClick handlers to make these items functional */}
                <List.Item className="clickable-list-item" onClick={() => handleAccountItemClick('Personal Information')}>
                    <List.Item.Meta
                        avatar={<IconUser size={22} />}
                        title="Personal Information"
                    />
                    <IconChevronRight size={18} />
                </List.Item>

                <List.Item className="clickable-list-item" onClick={() => handleAccountItemClick('Security & Privacy')}>
                    <List.Item.Meta
                        avatar={<IconLock size={22} />}
                        title="Security & Privacy"
                    />
                    <IconChevronRight size={18} />
                </List.Item>

                <List.Item className="clickable-list-item" onClick={() => handleAccountItemClick('Notifications')}>
                    <List.Item.Meta
                        avatar={<IconNotification size={22} />}
                        title="Notifications"
                    />
                    <IconChevronRight size={18} />
                </List.Item>

                <List.Item className="clickable-list-item" onClick={() => handleAccountItemClick('Communication Preferences')}>
                    <List.Item.Meta
                        avatar={<IconMail size={22} />}
                        title="Communication Preferences"
                    />
                    <IconChevronRight size={18} />
                </List.Item>

                <Divider style={{ margin: '8px 0' }} />

                <List.Item className="clickable-list-item" onClick={() => handleAccountItemClick('Backup & Sync')}>
                    <List.Item.Meta
                        avatar={<IconCloudUpload size={22} style={{ color: 'var(--primary-600)' }} />}
                        title="Backup & Sync"
                    />
                    <IconChevronRight size={18} />
                </List.Item>

                <List.Item className="clickable-list-item" onClick={() => handleAccountItemClick('Export Data')}>
                    <List.Item.Meta
                        avatar={<IconFileDots size={22} />}
                        title="Export Data"
                    />
                    <IconChevronRight size={18} />
                </List.Item>

                <Divider style={{ margin: '8px 0' }} />

                <List.Item className="clickable-list-item" onClick={() => handleAccountItemClick('Help & Support')}>
                    <List.Item.Meta
                        avatar={<IconHelpCircle size={22} />}
                        title="Help & Support"
                    />
                    <IconChevronRight size={18} />
                </List.Item>

                {/* Added onClick handler for Logout */}
                <List.Item className="clickable-list-item danger-item" onClick={handleLogout}>
                    <List.Item.Meta
                        avatar={<IconLogout size={22} style={{ color: 'var(--danger-500)' }} />}
                        title={<span style={{ color: 'var(--danger-500)' }}>Log Out</span>}
                    />
                    {/* No chevron needed for logout */}
                </List.Item>
            </List>
        </Drawer>
    );

    // --- Main Settings Component Render ---
    return (
        <Layout style={{
            height: '100%',
            background: 'var(--neutral-100)', // Ensure CSS variables are defined
            padding: isMobile ? '0 0 80px 0' : '24px' // Adjust padding as needed
        }}>
            {/* Mobile header */}
            {isMobile && (
                <div className="settings-mobile-header" style={{ padding: '16px', borderBottom: '1px solid var(--neutral-200)', background: 'var(--neutral-0)' }}>
                    {/* Added some basic styling for visibility */}
                    <Title level={4} style={{ margin: 0, textAlign: 'center' }}>Settings</Title>
                </div>
            )}

            {/* Desktop header */}
            {!isMobile && (
                <div className="settings-desktop-header" style={{ marginBottom: 24 }}>
                    <Row align="middle" justify="space-between">
                        <Col>
                            <Title level={3} style={{ margin: 0 }}>Settings</Title>
                        </Col>
                        {/* Add any desktop-specific header actions here if needed */}
                    </Row>
                </div>
            )}

            {/* Settings Content Area */}
            <div className="settings-container" style={{ overflowY: 'auto', height: '100%' }}>
                {/* Account Section */}
                <Card
                    className="settings-card account-card"
                    bordered={false}
                    title={
                        <Text strong style={{ fontSize: '1rem' }}>Account</Text>
                    }
                    style={{ marginBottom: '16px' }} // Added spacing between cards
                >
                    {/* TODO: Replace hardcoded user data */}
                    <div className="account-info-container" onClick={showAccountDrawer} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <div className="account-avatar" style={{ marginRight: '16px' }}>
                            {/* Added placeholder/fallback */}
                            <Avatar size={50} src="https://placehold.co/50x50/E0E0E0/BDBDBD?text=JD" onError={(e) => e.target.src='https://placehold.co/50x50/E0E0E0/BDBDBD?text=Err'} />
                        </div>
                        <div className="account-details" style={{ flexGrow: 1 }}>
                            <Text strong>John Doe</Text> <br /> {/* Use <br/> or Typography components for spacing */}
                            <Text type="secondary">john.doe@example.com</Text>
                        </div>
                        <div className="account-arrow">
                            <IconChevronRight size={18} />
                        </div>
                    </div>
                </Card>

                {/* App Preferences Section */}
                <Card
                    className="settings-card"
                    bordered={false}
                    title={
                        <Text strong style={{ fontSize: '1rem' }}>App Preferences</Text>
                    }
                    style={{ marginBottom: '16px' }} // Added spacing
                >
                    <List
                        itemLayout="horizontal"
                        className="settings-list"
                    >
                        <List.Item
                            actions={[
                                <Segmented
                                    key="theme-segmented"
                                    value={currentSettings.theme} // Use currentSettings from context/defaults
                                    onChange={handleThemeChange}
                                    options={[
                                        { value: 'light', icon: <IconSun size={16} /> },
                                        { value: 'auto', icon: <IconBrightnessHalf size={16} /> },
                                        { value: 'dark', icon: <IconMoonStars size={16} /> }
                                    ]}
                                />
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<IconPalette size={22} style={{ color: 'var(--primary-600)' }} />}
                                title="Appearance"
                            />
                        </List.Item>

                        <List.Item
                            actions={[
                                <Switch
                                    key="paid-bills-switch"
                                    checked={currentSettings.showPaidBills} // Use currentSettings
                                    onChange={handleTogglePaidBills}
                                    aria-label="Toggle showing paid bills"
                                />
                            ]}
                        >
                            <List.Item.Meta
                                avatar={currentSettings.showPaidBills ? // Use currentSettings
                                    <IconEye size={22} style={{ color: 'var(--primary-600)' }} /> :
                                    <IconEyeOff size={22} style={{ color: 'var(--neutral-500)' }} />
                                }
                                title="Show Paid Bills"
                                description="Display bills that have already been paid"
                            />
                        </List.Item>

                        <List.Item
                            actions={[
                                <Switch
                                    key="credit-cards-switch"
                                    checked={currentSettings.showCreditCards} // Use currentSettings
                                    onChange={handleToggleCreditCards}
                                    aria-label="Toggle showing credit cards in sidebar"
                                />
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<IconCreditCard size={22} style={{ color: currentSettings.showCreditCards ? 'var(--primary-600)' : 'var(--neutral-500)' }} />}
                                title="Show Credit Cards"
                                description="Display credit cards in the sidebar"
                            />
                        </List.Item>
                    </List>
                </Card>

                {/* Chart Preferences Section */}
                <Card
                    className="settings-card"
                    bordered={false}
                    title={
                        <Text strong style={{ fontSize: '1rem' }}>Chart Preferences</Text>
                    }
                    style={{ marginBottom: '16px' }} // Added spacing
                >
                    <List
                        itemLayout="horizontal"
                        className="settings-list"
                    >
                        <List.Item
                            actions={[
                                <Radio.Group
                                    key="chart-type-radio"
                                    value={currentSettings.defaultChartType} // Use currentSettings
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
                                description="Set your preferred chart visualization"
                            />
                        </List.Item>
                    </List>
                </Card>

                {/* About Section */}
                <Card
                    className="settings-card"
                    bordered={false}
                    title={
                        <Text strong style={{ fontSize: '1rem' }}>About</Text>
                    }
                    // No bottom margin needed for the last card unless followed by other elements
                >
                    <List
                        itemLayout="horizontal"
                        className="settings-list"
                    >
                        {/* TODO: Consider pulling version from package.json or build env */}
                        <List.Item>
                            <List.Item.Meta
                                title="Version"
                                description="1.0.0 (Build 1234)"
                            />
                        </List.Item>

                        {/* TODO: Add onClick handlers to navigate to these pages/modals */}
                        <List.Item className="clickable-list-item" onClick={() => handleAccountItemClick('Terms of Service')}>
                            <List.Item.Meta title="Terms of Service" />
                            <IconChevronRight size={18} />
                        </List.Item>

                        <List.Item className="clickable-list-item" onClick={() => handleAccountItemClick('Privacy Policy')}>
                            <List.Item.Meta title="Privacy Policy" />
                            <IconChevronRight size={18} />
                        </List.Item>

                        <List.Item className="clickable-list-item" onClick={() => handleAccountItemClick('Licenses')}>
                            <List.Item.Meta title="Licenses" />
                            <IconChevronRight size={18} />
                        </List.Item>
                    </List>
                </Card>
            </div>

            {/* Account Settings Drawer */}
            {renderAccountDrawer()}
        </Layout>
    );
};

// Export the Settings component as the default export ONCE
export default Settings;
