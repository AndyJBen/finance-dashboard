// src/components/ThemeToggle/ThemeToggle.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { Button, Tooltip } from 'antd';
import { IconMoon, IconSun } from '@tabler/icons-react';

const ThemeToggle = ({ collapsed }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <Tooltip 
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} 
      placement={collapsed ? "right" : "top"}
    >
      <Button
        className="sidebar-bottom-button"
        onClick={toggleTheme}
        icon={darkMode ? <IconSun size={20} /> : <IconMoon size={20} />}
      >
        {!collapsed && (darkMode ? 'Light Mode' : 'Dark Mode')}
      </Button>
    </Tooltip>
  );
};

export default ThemeToggle;