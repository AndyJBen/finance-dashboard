// src/components/Footer/Footer.jsx
// COMPLETE FILE CODE
// This is a new component for the application footer.

import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { IconCopyright, IconPhone, IconMail, IconMapPin } from '@tabler/icons-react'; // Using Tabler icons
import './Footer.css'; // Import custom CSS for the footer

const { Footer: AntFooter } = Layout; // Alias Ant Design's Footer
const { Text, Link } = Typography;

const AppFooter = () => {
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

        {/* Right Side: Placeholder Contact Info */}
      </Row>
    </AntFooter>
  );
};

export default AppFooter;