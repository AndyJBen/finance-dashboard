// src/components/RecentActivity/ActivityFeed.jsx
// Updated to use CardLayout as per Step 3

import React, { useContext, useState } from 'react';
import { Timeline, Alert, Typography, Empty, Button } from 'antd'; // Removed Card, Spin, Tooltip
import {
    IconCircleCheckFilled,
    IconClock,
    IconTimeDuration15,
    // IconMinus, IconChevronDown are now handled by CardLayout
} from '@tabler/icons-react';
import CardLayout from '../shared/CardLayout'; // 🟩 Added import
import { FinanceContext } from '../../contexts/FinanceContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Title } = Typography; // 🟩 Ensure Title is imported

// Helper functions (getActivityDetails, getActivitySubtitle) remain the same
const getActivityDetails = (item) => {
    if (item.isPaid) { return `${item.name}`; }
    return item.name || 'Unknown Activity';
};
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

  // Filter and sort logic remains the same
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

  // 🟩 Custom title component as requested
  const titleComponent = (
    <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
      <IconTimeDuration15 size={26} style={{ marginRight: 'var(--space-8)', color: 'var(--primary-600)' }} />
      Recent Activity
    </Title>
  );

  // 🟥 Removed original return with Card/Spin
  // 🟩 Replace the return statement with CardLayout
  return (
    <CardLayout
      title={titleComponent}
      style={style} // Pass style prop
      loading={loading}
      isCollapsed={isCollapsed}
      toggleCollapse={toggleCollapse}
      error={error} // Pass error state
      errorMessage="Error loading recent activity" // Custom error message
    >
      {/* Children passed to CardLayout */}
      {timelineItems.length === 0 ? (
        <Empty
           description="No recent activity"
           image={Empty.PRESENTED_IMAGE_SIMPLE}
           style={{
             padding: 'var(--space-32) 0',
             margin: 'auto', // Center Empty component
             flexGrow: 1, // Allow Empty to take available space
             display: 'flex',
             flexDirection: 'column',
             justifyContent: 'center'
           }}
        />
      ) : (
        <>
          {/* Ensure this div takes full width and allows scrolling */}
          <div style={{
             flexGrow: 1, // Takes available vertical space
             overflowY: 'auto', // Allows scrolling if content exceeds height
             padding: '16px 8px 8px 8px', // Internal padding for timeline
             width: '100%' // Ensure it uses full width
          }}>
            <Timeline
              items={displayedTimelineItems}
              style={{ width: '100%' }} // Ensure Timeline itself takes full width
            />
          </div>
          {/* "Display All" button logic remains */}
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
