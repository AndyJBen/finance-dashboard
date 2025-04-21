import React from 'react';
import ReactDOM from 'react-dom/client';
import MyApp from './App'; // Renamed your App component to avoid naming conflict
import { FinanceProvider } from './contexts/FinanceContext';
// Import App from antd AS WELL AS ConfigProvider
import { ConfigProvider, App as AntdApp } from 'antd';
import './assets/styles/global.css';

// Define theme tokens based on mockup CSS variables (customTheme object remains the same)
const customTheme = {
  token: {
    // Colors
    colorPrimary: '#0066FF', // --primary-600
    colorSuccess: '#26C67B', // --success-500
    colorWarning: '#FF9233', // --warning-500
    colorError: '#F1476F', // --danger-500
    colorInfo: '#3388FF', // --primary-500 (Used for links etc.)
    colorTextBase: '#2D4159', // --neutral-800
    colorBgLayout: '#F5F7FA', // --neutral-100 (Layout background)
    colorBgContainer: '#FFFFFF', // Card/Container background
    colorBorder: '#DDE3ED', // --neutral-300 (Default border)
    colorBorderSecondary: '#EDF1F7', // --neutral-200 (Lighter border)

    // Font
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",

    // Radius
    borderRadius: 16, // --radius-xl
    borderRadiusLG: 16,
    borderRadiusSM: 8, // --radius-md

    // Wireframe / Bordered variant
    wireframe: false,
  },
  components: {
    // Component specific overrides if needed
    Card: {
      paddingLG: 20,
    },
    Button: {
        borderRadius: 12, // --radius-lg
        borderRadiusSM: 8,
    },
    Menu: {},
    Table: {}
  }
};


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ConfigProvider remains the outermost AntD component */}
    <ConfigProvider theme={customTheme}>
      {/* Wrap FinanceProvider and your App with AntdApp */}
      {/* This allows static methods like message, notification, Modal to access context */}
      <AntdApp>
        <FinanceProvider>
          {/* Ensure you have renamed your App component (e.g., to MyApp) */}
          {/* and updated the import at the top of this file */}
          <MyApp /> {/* Render your application component */}
        </FinanceProvider>
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>
);
