// src/components/Navigation/BottomNavBar.jsx
// Added onAddClick prop for the center button

import React from 'react';
import { Button, Tooltip } from 'antd';
import {
    IconLayoutDashboard,
    IconReceipt,
    IconChartBar,
    IconUserCircle,
    IconPlus
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
    zIndex: 1001,
};
// --- End Styles ---

// Accept onAddClick prop
const BottomNavBar = ({ selectedKey, onSelect, onAddClick }) => {

    // Use the passed-in handler for the Add button click
    const handleAddClick = () => {
        if (onAddClick) {
            onAddClick(); // Call the function passed from App.jsx
        } else {
            console.error("onAddClick handler not provided to BottomNavBar");
        }
    };

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: <IconLayoutDashboard size={24} /> },
        { key: 'bills', label: 'Bills', icon: <IconReceipt size={24} /> },
        { key: 'add', label: 'Add', icon: <IconPlus size={28} />, isCenter: true },
        { key: 'reports', label: 'Reports', icon: <IconChartBar size={24} /> },
        { key: 'account', label: 'Account', icon: <IconUserCircle size={24} /> },
    ];

    return (
        <div style={navStyle}>
            {menuItems.map(item => {
                if (item.isCenter) {
                    return (
                        <Tooltip title="Add Bill" key={item.key}>
                             <Button
                                style={centerButtonStyle}
                                icon={item.icon}
                                onClick={handleAddClick} // Use the internal handler that calls the prop
                                aria-label="Add Bill"
                             />
                        </Tooltip>
                    );
                } else {
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
