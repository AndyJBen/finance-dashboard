// src/components/Footer/Footer.jsx
import React from 'react';
import { Layout, Row, Col, Typography, Space, Switch } from 'antd';
import { IconCopyright, IconPhone, IconMail, IconMapPin, IconMoon, IconSun } from '@tabler/icons-react';
import './Footer.css';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const AppFooter = ({ isDarkMode, toggleDarkMode }) => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter className="app-footer">
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        {/* Left Side: Copyright */}
        <Col xs={24} sm={12} md={8} className="footer-copyright">
          <Space align="center" size="small">
            <IconCopyright size={16} />
            <Text type="secondary">{currentYear} Financely. All rights reserved.</Text>
          </Space>
        </Col>

        {/* Right Side: Dark Mode Toggle */}
        <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
          <Space align="center" size="small">
            <IconSun size={18} style={{ opacity: isDarkMode ? 0.5 : 1 }} />
            <Switch
              checked={isDarkMode}
              onChange={toggleDarkMode}
              size="small"
            />
            <IconMoon size={18} style={{ opacity: isDarkMode ? 1 : 0.5 }} />
            <Text type="secondary" style={{ marginLeft: 8 }}>
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </Space>
        </Col>
      </Row>
    </AntFooter>
  );
};

export default AppFooter;