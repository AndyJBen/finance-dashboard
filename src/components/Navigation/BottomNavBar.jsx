// src/components/Navigation/BottomNavBar.jsx
import React, { useState } from 'react';
import { Button, Tooltip, Popover } from 'antd';
import {
    IconLayoutDashboard,
    IconReceipt,
    IconChartBar,
    IconUserCircle,
    IconPlus,
    IconPencil,
    IconEdit
} from '@tabler/icons-react';

// Existing styles...
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
    backgroundColor: 'transparent',
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

// ALTERNATIVE MENU STYLES - FLAT DESIGN WITH HORIZONTAL ICONS
const actionMenuStyle = {
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: 'white',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    padding: '8px',
};

const actionItemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    color: 'var(--neutral-800)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderRadius: '12px',
    marginBottom: '4px',
};

// No margin on last item
const lastActionItemStyle = {
    ...actionItemStyle,
    marginBottom: '0',
};

const iconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
    color: 'var(--primary-600)',
};

const actionItemTextStyle = {
    fontWeight: '500',
    fontSize: '15px',
};

const actionItemHoverStyle = {
    backgroundColor: 'var(--neutral-50)',
};

// Bottom Nav component
const BottomNavBar = ({ selectedKey, onSelect, onAddClick, onEditBalanceClick }) => {
    const [hoverItem, setHoverItem] = useState(null);

    // Improved action menu content
    const actionMenu = (
        <div style={actionMenuStyle}>
            <div 
                style={{
                    ...actionItemStyle,
                    ...(hoverItem === 'addBill' ? actionItemHoverStyle : {})
                }}
                onClick={() => {
                    if (onAddClick) onAddClick();
                }}
                onMouseEnter={() => setHoverItem('addBill')}
                onMouseLeave={() => setHoverItem(null)}
            >
                <div style={iconStyle}>
                    <IconPlus size={20} strokeWidth={2} />
                </div>
                <span style={actionItemTextStyle}>Add a Bill</span>
            </div>
            <div 
                style={{
                    ...lastActionItemStyle,
                    ...(hoverItem === 'editBalance' ? actionItemHoverStyle : {})
                }}
                onClick={() => {
                    if (onEditBalanceClick) onEditBalanceClick();
                }}
                onMouseEnter={() => setHoverItem('editBalance')}
                onMouseLeave={() => setHoverItem(null)}
            >
                <div style={iconStyle}>
                    <IconEdit size={20} strokeWidth={2} />
                </div>
                <span style={actionItemTextStyle}>Edit Bank Balance</span>
            </div>
        </div>
    );

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: <IconLayoutDashboard size={24} /> },
        { key: 'bills', label: 'Bills', icon: <IconReceipt size={24} /> },
        { key: 'action', label: 'Actions', icon: <IconPencil size={28} />, isCenter: true },
        { key: 'reports', label: 'Reports', icon: <IconChartBar size={24} /> },
        { key: 'account', label: 'Account', icon: <IconUserCircle size={24} /> },
    ];

    return (
        <div style={navStyle}>
            {menuItems.map(item => {
                if (item.isCenter) {
                    return (
                        <Popover 
                            key={item.key}
                            content={actionMenu}
                            trigger="click"
                            placement="top"
                            arrow={{ pointAtCenter: true }}
                            overlayStyle={{ width: '250px' }}
                        >
                            <Button
                                style={centerButtonStyle}
                                icon={item.icon}
                                aria-label="Actions Menu"
                            />
                        </Popover>
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