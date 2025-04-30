// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { FinanceProvider } from './contexts/FinanceContext';
import MyApp from './App';           // your root component
import './assets/styles/global.css';

const customTheme = {
  token: {
    colorPrimary: '#0066FF',
    colorSuccess: '#26C67B',
    colorWarning: '#FF9233',
    colorError:   '#F1476F',
    colorInfo:    '#3388FF',
    colorTextBase:     '#2D4159',
    colorBgLayout:     '#F5F7FA',
    colorBgContainer:  '#FFFFFF',
    colorBorder:       '#DDE3ED',
    colorBorderSecondary: '#EDF1F7',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    borderRadius:    16,
    borderRadiusLG:  16,
    borderRadiusSM:   8,
    wireframe:     false,
  },
  components: {
    Card:   { paddingLG: 20 },
    Button: { borderRadius: 12, borderRadiusSM: 8 },
    // any other overrides…
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={customTheme}>
      <FinanceProvider>
        <MyApp />
      </FinanceProvider>
    </ConfigProvider>
  </React.StrictMode>
);
if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
  document.documentElement.classList.add('ios');
}