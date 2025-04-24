// src/components/RecentActivity/ActivityFeed.jsx
// COMPLETE FILE CODE WITH FIXES

import React, { useContext, useState } from 'react';
import { Timeline, Card, Spin, Alert, Typography, Empty, Button, Tooltip } from 'antd';
import { 
    IconHistory, 
    IconCircleCheckFilled, 
    IconClock, 
    IconMinus, 
    IconTimeDuration15,
    IconChevronDown 
} from '@tabler/icons-react';
import { FinanceContext } from '../../contexts/FinanceContext'; // Ensure path is correct
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'; // Import plugin

dayjs.extend(relativeTime); // Extend dayjs with relativeTime plugin

const { Text, Title } = Typography;

// Helper function to format activity details (remains the same)
const getActivityDetails = (item) => {
    if (item.isPaid) { return `${item.name}`; }
    return item.name || 'Unknown Activity';
};

// Helper function to format subtitle (remains the same)
const getActivitySubtitle = (item) => {
     if (item.isPaid) { return `$${Number(item.amount).toFixed(2)} • ${item.category || 'Bill Payment'}`; }
     return `$${Number(item.amount).toFixed(2)}`;
}

const INITIAL_ACTIVITY_LIMIT = 5;

const ActivityFeed = ({ style }) => {
  const { loading, error, bills } = useContext(FinanceContext);
  const [showAllActivities, setShowAllActivities] = useState(false);
  // State for collapse - default to expanded (false)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Toggle function
  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  // Filter and sort paid bills (remains the same)
  const validBills = Array.isArray(bills) ? bills : [];
  const paidActivitiesInView = validBills
      .filter(bill => bill.isPaid)
      .sort((a, b) => dayjs(b.dueDate).valueOf() - dayjs(a.dueDate).valueOf());

   const timelineItems = paidActivitiesInView.map((item, index) => ({
       key: item.id || index,
       color: 'green',
       dot: <IconCircleCheckFilled size={16} style={{ color: 'var(--success-500)' }} />,
       style: { paddingBottom: 'var(--space-16)'},
       children: (
         <div className="activity-content" style={{ padding: '8px 0' }}>
             <Text strong style={{ display: 'block', fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
                 {getActivityDetails(item)}
             </Text>
             <Text type="secondary" style={{ display: 'block', fontSize: '0.75rem', marginBottom: 'var(--space-4)' }}>
                 {getActivitySubtitle(item)}
             </Text>
             <Text type="secondary" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                 <IconClock size={14} style={{ marginRight: 'var(--space-4)' }} />
                 {dayjs(item.dueDate).isValid() ? dayjs(item.dueDate).fromNow() : 'Recent'}
             </Text>
         </div>
       ),
   }));

   const displayedTimelineItems = showAllActivities
        ? timelineItems
        : timelineItems.slice(0, INITIAL_ACTIVITY_LIMIT);

  // Display error message if loading failed
  if (error && !loading) {
    return <Alert message="Error loading recent activity" type="warning" showIcon style={style} />;
  }

  // Collapse button using text style with Tabler icons
  const collapseButton = (
    <Tooltip title={isCollapsed ? 'Expand' : 'Minimize'}>
        <Button
            type="text"
            icon={isCollapsed ? <IconChevronDown size={16} /> : <IconMinus size={16} />}
            onClick={toggleCollapse}
            style={{ color: 'var(--neutral-600)' }} // Explicit color
        />
    </Tooltip>
  );

  // Render the component
  return (
    <Spin spinning={loading} size="small">
      <Card
        style={{
          ...style,
          height: '100%',
          minHeight: '350px', // FIX: Set minimum height
          display: 'flex',
          flexDirection: 'column'
        }}
        bodyStyle={{ 
          flexGrow: 1,
          padding: isCollapsed ? '16px' : '8px 16px 16px 16px', 
          display: 'flex',
          flexDirection: 'column'
        }}
        title={
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <IconTimeDuration15 size={26} style={{ marginRight: 'var(--space-8)', color: 'var(--primary-600)' }} />
                Recent Activity
            </Title>
        }
        // Added extra prop for the button
        extra={collapseButton}
      >
        {/* Conditionally render content based on isCollapsed */}
        {!isCollapsed && (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Show Empty state if no items and not loading */}
                {timelineItems.length === 0 && !loading ? (
                    <Empty 
                      description="No recent activity" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE} 
                      style={{ 
                        padding: 'var(--space-32) 0',
                        margin: 'auto',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}
                    />
                ) : (
                <> {/* Use Fragment to wrap Timeline and Button */}
                    <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px 8px 8px 8px' }}>
                      <Timeline
                        items={displayedTimelineItems}
                      />
                    </div>
                    {/* Conditionally render the "Display All" / "Show Less" button */}
                    {timelineItems.length > INITIAL_ACTIVITY_LIMIT && (
                        <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
                            <Button
                                type="link"
                                onClick={() => setShowAllActivities(prev => !prev)}
                            >
                                {showAllActivities ? 'Show Less' : 'Display All'}
                            </Button>
                        </div>
                    )}
                </>
                )}
            </div>
        )}
      </Card>
    </Spin>
  );
};

export default ActivityFeed;