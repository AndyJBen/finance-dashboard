// src/components/Settings/SettingsPage.jsx
import React from 'react';
import { Layout } from 'antd';
import Settings from './Settings';
import DesktopSettings from './DesktopSettings';

const { Content } = Layout;

const SettingsPage = ({ isMobileView = true }) => {
  return (
    <Content 
      style={{ 
        padding: isMobileView ? '0' : 'var(--space-24)',
        margin: 0,
        flexGrow: 1,
        width: '100%',
        maxWidth: '100%',
        paddingBottom: isMobileView ? '80px' : 'var(--space-24)'
      }}
    >
      {isMobileView ? (
        <Settings isMobile={true} />
      ) : (
        <DesktopSettings />
      )}
    </Content>
  );
};

export default SettingsPage;