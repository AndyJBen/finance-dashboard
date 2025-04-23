// src/components/Navigation/BottomNavBar.jsx
import React, { useContext } from 'react';
import { Button, Tooltip } from 'antd';
import {
  IconLayoutDashboard,
  IconReceipt,
  IconChartBar,
  IconUserCircle,
  IconPlus,
  IconMoon,
  IconSun
} from '@tabler/icons-react';
import { ThemeContext } from '../../contexts/ThemeContext';

// Styles remain the same...
const navStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '60px',
  backgroundColor: 'var(--bg-secondary, #ffffff)',
  borderTop: '1px solid var(--border-light, #e5e7eb)',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: '0 10px',
  zIndex: 1000,
  boxShadow: 'var(--shadow-md)',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
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
  color: 'var(--text-tertiary)',
  flex: 1,
  maxWidth: '20%',
  backgroundColor: 'transparent',
  transition: 'all 0.3s ease'
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
  boxShadow: 'var(--shadow-md)',
  zIndex: 1001,
  transition: 'all 0.3s ease'
};

// Accept onAddClick prop
const BottomNavBar = ({ selectedKey, onSelect, onAddClick }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  // Use the passed-in handler for the Add button click
  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick(); // Call the function passed from App.jsx
    } else {
      console.error("onAddClick handler not provided to BottomNavBar");
    }
  };

  // Handle theme toggle action
  const handleThemeToggle = () => {
    toggleTheme();
  };

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <IconLayoutDashboard size={24} /> },
    { key: 'bills', label: 'Bills', icon: <IconReceipt size={24} /> },
    { key: 'add', label: 'Add', icon: <IconPlus size={28} />, isCenter: true },
    { key: 'reports', label: 'Reports', icon: <IconChartBar size={24} /> },
    // Replace Account with Theme toggle
    { 
      key: 'theme', 
      label: darkMode ? 'Light' : 'Dark', 
      icon: darkMode ? <IconSun size={24} /> : <IconMoon size={24} />,
      isThemeToggle: true 
    },
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
                onClick={handleAddClick}
                aria-label="Add Bill"
              />
            </Tooltip>
          );
        } else if (item.isThemeToggle) {
          return (
            <Button
              key={item.key}
              type="text"
              style={itemStyle}
              onClick={handleThemeToggle}
              aria-label={item.label}
            >
              {item.icon}
              <span style={{ marginTop: '2px' }}>{item.label}</span>
            </Button>
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