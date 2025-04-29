// src/components/Navigation/BottomNavBar.jsx
import React, { useState } from 'react';
import { Button, Tooltip, Popover } from 'antd';
import {
    IconLayoutDashboard,
    IconActivityHeartbeat,
    IconChartBar,
    IconSettings,
    IconPlus,
    IconPencil,
    IconEdit // Keep IconEdit for the menu item
} from '@tabler/icons-react';

// Styles remain the same...
const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '60px',
    backgroundColor: 'var(--neutral-0, #ffffff)',
    borderTop: '1px solid var(--neutral-200, #e5e7eb)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0 10px',
    zIndex: 1000,
    boxShadow: '0 -2px 5px rgba(0,0,0,0.05)'
};

const itemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    padding: '5px',
    height: '100%',
    fontSize: '10px',
    color: 'var(--neutral-500)',
    flex: 1,
    maxWidth: '20%',
    backgroundColor: 'transparent', // Ensure background is transparent for text buttons
};

const activeItemStyle = {
    ...itemStyle,
    color: 'var(--primary-600)',
    fontWeight: 600,
};

const centerButtonStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-600)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    zIndex: 1001, // Ensure it's above the nav bar itself
    transform: 'translateY(-10px)' // Lift the button slightly
};

// IMPROVED ACTION MENU STYLES
const actionMenuStyle = {
    borderRadius: '16px',
    padding: '6px',
    backgroundColor: 'white',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
};

const actionItemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 16px',
    color: 'var(--neutral-800)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderRadius: '12px',
    margin: '2px 0',
};

const lastActionItemStyle = {
    ...actionItemStyle,
    margin: '2px 0 0 0',
};

const iconContainerStyle = {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
};

const actionItemTextStyle = {
    fontWeight: '500',
    fontSize: '15px',
};

const actionItemHoverStyle = {
    backgroundColor: 'var(--neutral-50)',
};

// Accept onAddClick and onEditBalanceClick props
const BottomNavBar = ({ selectedKey, onSelect, onAddClick, onEditBalanceClick }) => {
    const [hoverItem, setHoverItem] = useState(null);
    const [popoverVisible, setPopoverVisible] = useState(false); // State to control popover visibility

    // Function to close the popover
    const closePopover = () => setPopoverVisible(false);

    // Improved action menu content
    const actionMenu = (
        <div style={actionMenuStyle}>
            {/* Add a Bill Action */}
            <div
                style={{
                    ...actionItemStyle,
                    ...(hoverItem === 'addBill' ? actionItemHoverStyle : {})
                }}
                onClick={() => {
                    if (onAddClick) onAddClick();
                    closePopover(); // Close popover after action
                }}
                onMouseEnter={() => setHoverItem('addBill')}
                onMouseLeave={() => setHoverItem(null)}
            >
                <div style={iconContainerStyle}>
                    <IconPlus size={20} style={{ color: 'var(--primary-600)' }} />
                </div>
                <span style={actionItemTextStyle}>Add a Bill</span>
            </div>
            {/* Edit Bank Balance Action */}
            <div
                style={{
                    ...lastActionItemStyle,
                    ...(hoverItem === 'editBalance' ? actionItemHoverStyle : {})
                }}
                onClick={() => {
                    // Call the passed onEditBalanceClick handler
                    if (onEditBalanceClick) onEditBalanceClick();
                    closePopover(); // Close popover after action
                }}
                onMouseEnter={() => setHoverItem('editBalance')}
                onMouseLeave={() => setHoverItem(null)}
            >
                <div style={iconContainerStyle}>
                    <IconEdit size={20} style={{ color: 'var(--primary-600)' }} />
                </div>
                <span style={actionItemTextStyle}>Edit Bank Balance</span>
            </div>
        </div>
    );

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: <IconLayoutDashboard size={24} /> },
        { key: 'finance-feed', label: 'Finance Feed', icon: <IconActivityHeartbeat size={24} /> },
        { key: 'action', label: 'Actions', icon: <IconPlus size={28} />, isCenter: true }, // Changed icon to Plus
        { key: 'reports', label: 'Reports', icon: <IconChartBar size={24} /> },
        { key: 'settings', label: 'Settings', icon: <IconSettings size={24} /> },
    ];

    return (
        <div style={navStyle}>
            {menuItems.map(item => {
                // Center Action Button (Popover Trigger)
                if (item.isCenter) {
                    return (
                        <Popover
                            key={item.key}
                            content={actionMenu}
                            trigger="click"
                            placement="top"
                            arrow={{ pointAtCenter: true }}
                            overlayStyle={{ width: '250px', paddingBottom: '10px' }} // Add padding to lift menu above button
                            open={popoverVisible} // Control visibility with state
                            onOpenChange={setPopoverVisible} // Update state on visibility change
                        >
                            <Button
                                style={centerButtonStyle}
                                icon={item.icon}
                                aria-label="Actions Menu"
                            />
                        </Popover>
                    );
                } else {
                    // Regular Navigation Buttons
                    const isActive = selectedKey === item.key;
                    return (
                        <Button
                            key={item.key}
                            type="text"
                            style={isActive ? activeItemStyle : itemStyle}
                            onClick={() => onSelect({ key: item.key })}
                            aria-label={item.label}
                        >
                            {item.icon}
                            <span style={{ marginTop: '2px' }}>{item.label}</span>
                        </Button>
                    );
                }
            })}
        </div>
    );
};

export default BottomNavBar;
