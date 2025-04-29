// src/components/shared/CardLayout.jsx
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
  // Improved collapse button for better mobile experience
  const collapseButton = (
    <Tooltip title={isCollapsed ? 'Expand' : 'Minimize'}>
      <Button
        type="default"  
        className="card-collapse-button"
        icon={isCollapsed ? <IconChevronDown size={16} /> : <IconMinus size={16} />}
        onClick={toggleCollapse}
        style={{ 
          color: iconColor,
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          backgroundColor: 'var(--neutral-50)',
          border: '1px solid var(--neutral-200)',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
        }}
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
          width: '100%', 
          height: 'auto',
          minHeight: isCollapsed ? 'auto' : '240px',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 'none',
          boxShadow: 'var(--shadow-md) !important',
          border: '1px solid var(--neutral-200) !important'
        }}
        bodyStyle={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: isCollapsed ? '16px' : '16px',
          width: '100%',
          overflow: 'hidden'
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
              width: '100%',
              overflow: 'hidden'
            }}
          >
            {children}
          </div>
        )}
      </Card>
      
      {/* Additional CSS for mobile responsiveness */}
      <style jsx>{`
        @media (max-width: 768px) {
          /* Make card collapse buttons more touch-friendly */
          .card-collapse-button {
            width: 32px !important;
            height: 32px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 16px !important;
            background-color: var(--neutral-50) !important;
            border: 1px solid var(--neutral-200) !important;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
          }
          
          /* Icon sizing for collapse buttons */
          .card-collapse-button .tabler-icon {
            font-size: 16px !important;
          }
          
          /* Card spacing */
          .ant-card {
            margin-bottom: 12px !important;
          }
          
          /* Card header padding */
          .ant-card-head {
            min-height: auto !important;
            padding: 12px 16px !important;
          }
          
          .ant-card-head-title {
            padding: 8px 0 !important;
            font-size: 0.95rem !important;
          }
          
          .ant-card-extra {
            padding: 8px 0 !important;
          }
          
          /* Card body padding */
          .ant-card-body {
            padding: 12px !important;
          }
        }
      `}</style>
    </Spin>
  );
};

export default CardLayout;