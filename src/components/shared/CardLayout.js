// src/components/shared/CardLayout.js
import React from 'react';
import { Card, Spin, Button, Tooltip, Alert } from 'antd';
import { IconMinus, IconChevronDown } from '@tabler/icons-react';

/**
 * Shared component wrapper for activity cards to ensure consistent styling
 */
const CardLayout = ({ 
  title, 
  style, 
  loading, 
  isCollapsed, 
  toggleCollapse, 
  children,
  iconColor = 'var(--neutral-600)',
  error,
  errorMessage = "Error loading data"
}) => {
  // Collapse button using text style with Tabler icons
  const collapseButton = (
    <Tooltip title={isCollapsed ? 'Expand' : 'Minimize'}>
      <Button
        type="text"
        icon={isCollapsed ? <IconChevronDown size={16} /> : <IconMinus size={16} />}
        onClick={toggleCollapse}
        style={{ color: iconColor }}
      />
    </Tooltip>
  );

  // Handle error states
  if (error && !loading) {
    return <Alert message={errorMessage} type="warning" showIcon style={style} />;
  }

  return (
    <Spin spinning={loading} size="small">
      <Card
        style={{
          ...style,
          width: '100%', // Ensure full width 
          height: 'auto',
          minHeight: isCollapsed ? 'auto' : '240px', // Adjusted min-height
          display: 'flex',
          flexDirection: 'column',
          // Remove any max-width constraints
          maxWidth: 'none',
          // Apply existing app styles based on global.css
          boxShadow: 'var(--shadow-md) !important',
          border: '1px solid var(--neutral-200) !important'
        }}
        bodyStyle={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: isCollapsed ? '16px' : '16px',
          width: '100%', // Ensure body takes full width
          overflow: 'hidden' // Prevent overflow
        }}
        title={title}
        extra={collapseButton}
      >
        {!isCollapsed && (
          <div 
            style={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column',
              width: '100%', // Ensure content takes full width
              overflow: 'hidden' // Prevent overflow
            }}
          >
            {children}
          </div>
        )}
      </Card>
    </Spin>
  );
};

export default CardLayout;