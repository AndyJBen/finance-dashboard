// src/main.jsx
import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import { FinanceProvider } from './contexts/FinanceContext';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import MyApp from './App';
import './index.css';
import './assets/styles/global.css';

// Theme provider wrapper to access context 
const ThemeAwareApp = () => {
  const { darkMode } = useContext(ThemeContext);
  
  const customTheme = {
    algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: darkMode ? '#5C85FF' : '#0066FF',
      colorSuccess: darkMode ? '#2EE08B' : '#26C67B',
      colorWarning: darkMode ? '#FFA54D' : '#FF9233',
      colorError: darkMode ? '#FF5B81' : '#F1476F',
      colorInfo: darkMode ? '#4D76FF' : '#3388FF',
      colorTextBase: darkMode ? '#CED3DE' : '#2D4159',
      colorBgLayout: darkMode ? '#151E35' : '#F5F7FA',
      colorBgContainer: darkMode ? '#1A2440' : '#FFFFFF',
      colorBorder: darkMode ? '#2A344F' : '#DDE3ED',
      colorBorderSecondary: darkMode ? '#1E263D' : '#EDF1F7',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
      borderRadius: 16,
      borderRadiusLG: 16,
      borderRadiusSM: 8,
      wireframe: false,
    },
    components: {
      Card: { paddingLG: 20 },
      Button: { borderRadius: 12, borderRadiusSM: 8 },
      // any other overrides…
    },
  };

  return (
    <ConfigProvider theme={customTheme}>
      <FinanceProvider>
        <MyApp />
      </FinanceProvider>
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemeAwareApp />
    </ThemeProvider>
  </React.StrictMode>
);