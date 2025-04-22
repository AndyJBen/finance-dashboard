// src/components/Navigation/BottomNavBar.jsx
import React from 'react';
import { Button, Tooltip } from 'antd';
import {
    IconLayoutDashboard,
    IconReceipt,
    IconChartBar,
    IconUserCircle,
    IconPlus
} from '@tabler/icons-react';

// Define the style for the bottom navigation bar
const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '60px', // Standard height for bottom nav
    backgroundColor: 'var(--neutral-0, #ffffff)', // Use CSS variables or direct color
    borderTop: '1px solid var(--neutral-200, #e5e7eb)',
    display: 'flex',
    justifyContent: 'space-around', // Distribute items evenly
    alignItems: 'center',
    padding: '0 10px', // Add some horizontal padding
    zIndex: 1000, // Ensure it's above other content
    boxShadow: '0 -2px 5px rgba(0,0,0,0.05)' // Subtle shadow
};

// Style for the navigation buttons/icons
const itemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    padding: '5px',
    height: '100%',
    fontSize: '10px', // Smaller text for labels
    color: 'var(--neutral-500)', // Default color
    flex: 1, // Make items share space equally
    maxWidth: '20%', // Ensure items don't get too wide
};

// Style for the active navigation button/icon
const activeItemStyle = {
    ...itemStyle,
    color: 'var(--primary-600)', // Active color from your theme
    fontWeight: 600,
};

// Style for the central Add button
const centerButtonStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-600)', // Primary color
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    // Position it slightly elevated if desired (optional)
    // transform: 'translateY(-15px)',
    zIndex: 1001, // Above the nav bar itself
};

const BottomNavBar = ({ selectedKey, onSelect }) => {

    // Placeholder function for the Add button click
    const handleAddClick = () => {
        console.log("Add button clicked - implement modal opening logic here");
        // Example: Open a specific modal
        // openAddTransactionModal();
    };

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: <IconLayoutDashboard size={24} /> },
        { key: 'bills', label: 'Bills', icon: <IconReceipt size={24} /> },
        { key: 'add', label: 'Add', icon: <IconPlus size={28} />, isCenter: true }, // Special item
        { key: 'reports', label: 'Reports', icon: <IconChartBar size={24} /> },
        { key: 'account', label: 'Account', icon: <IconUserCircle size={24} /> }, // Assuming 'Account' maps to 'settings' or a new key
    ];

    return (
        <div style={navStyle}>
            {menuItems.map(item => {
                if (item.isCenter) {
                    // Render the central Add button
                    return (
                        <Tooltip title="Add Transaction" key={item.key}>
                             <Button
                                style={centerButtonStyle}
                                icon={item.icon}
                                onClick={handleAddClick}
                                aria-label="Add Transaction"
                             />
                        </Tooltip>
                    );
                } else {
                    // Render regular navigation items
                    const isActive = selectedKey === item.key;
                    return (
                        <Button
                            key={item.key}
                            type="text" // Use text button for icon + label look
                            style={isActive ? activeItemStyle : itemStyle}
                            onClick={() => onSelect({ key: item.key })} // Pass key object like Menu
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