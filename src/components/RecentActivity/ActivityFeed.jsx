// src/components/RecentActivity/ActivityFeed.jsx
// COMPLETE FILE CODE WITH FIXES

import React, { useContext, useState } from 'react';
import { Timeline, Typography, Empty, Button } from 'antd';
import { 
    IconCircleCheckFilled, 
    IconClock, 
    IconTimeDuration15
} from '@tabler/icons-react';
import { FinanceContext } from '../../contexts/FinanceContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
// Import the shared CardLayout component
import CardLayout from '../shared/CardLayout/CardLayout';
import './ActivityFeed.css';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

// Helper function to format activity details
const getActivityDetails = (item) => {
    if (item.isPaid) { return `${item.name}`; }
    return item.name || 'Unknown Activity';
};

// Helper function to format subtitle
const getActivitySubtitle = (item) => {
     if (item.isPaid) { return `$${Number(item.amount).toFixed(2)} • ${item.category || 'Bill Payment'}`; }
     return `$${Number(item.amount).toFixed(2)}`;
}

const INITIAL_ACTIVITY_LIMIT = 5;

const ActivityFeed = ({ style }) => {
  const { loading, error, bills } = useContext(FinanceContext);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  // Filter and sort paid bills
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
         <div className="activity-content" style={{ padding: '8px 0', width: '100%' }}>
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

  // Custom title component
  const titleComponent = (
    <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
      <IconTimeDuration15 size={26} style={{ marginRight: 'var(--space-8)', color: 'var(--primary-600)' }} />
      Recent Activity
    </Title>
  );

  // Use the shared CardLayout component
  return (
    <CardLayout
      title={titleComponent}
      style={style}
      loading={loading}
      isCollapsed={isCollapsed}
      toggleCollapse={toggleCollapse}
      error={error}
      errorMessage="Error loading recent activity"
    >
      {timelineItems.length === 0 ? (
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
        <>
          <div style={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            padding: '16px 8px 8px 8px',
            width: '100%' // Ensure full width
          }}>
            <Timeline
              items={displayedTimelineItems}
              style={{ width: '100%' }} // Ensure full width
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
    </CardLayout>
  );
};

export default ActivityFeed;