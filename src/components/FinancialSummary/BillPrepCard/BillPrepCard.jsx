import React, { useContext, useState, useMemo } from 'react';
import { List, Card, Spin, Alert, Typography, Empty, Space, Button, Avatar } from 'antd';
import {
    IconClipboardList, // Card Title Icon
    IconHome, IconBolt, IconCreditCard, IconCar, IconShoppingCart, IconHelp, IconCalendar,
    IconCurrencyDollar, IconCertificate, IconMedicineSyrup, IconUser, IconCalendarTime, // Category Icons
    IconMinus, IconChevronDown, IconBoxMultiple // Collapse/Expand Icons, Icon for combined items
} from '@tabler/icons-react';
import { FinanceContext } from '../../../contexts/FinanceContext';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween'; // Needed for date filtering
import './BillPrepCard.css';

dayjs.extend(isBetween);

const { Text, Title } = Typography;

const INITIAL_LIMIT = 5; // How many to show initially

// --- Helper Functions (No changes needed here) ---
const getCategoryIcon = (category) => {
    const lowerCategory = category?.toLowerCase() || '';
    if (lowerCategory.includes('rent') || lowerCategory.includes('mortgage')) return <IconHome size={18} />;
    if (lowerCategory.includes('electric') || lowerCategory.includes('utilit')) return <IconBolt size={18} />;
    if (lowerCategory.includes('card')) return <IconCreditCard size={18} />;
    if (lowerCategory.includes('auto') || lowerCategory.includes('car')) return <IconCar size={18} />;
    if (lowerCategory.includes('grocery')) return <IconShoppingCart size={18} />;
    if (lowerCategory.includes('subscription')) return <IconCalendar size={18} />;
    if (lowerCategory.includes('loan')) return <IconCurrencyDollar size={18} />;
    if (lowerCategory.includes('insurance')) return <IconCertificate size={18} />;
    if (lowerCategory.includes('medical')) return <IconMedicineSyrup size={18} />;
    if (lowerCategory.includes('personal care')) return <IconUser size={18} />;
    if (lowerCategory.includes('bill prep')) return <IconCalendarTime size={18} />;
    return <IconHelp size={18} />;
};

// --- End Helper Functions ---


const BillPrepCard = ({ style }) => {
  const {
      loading, error, bills, displayedMonth,
    } = useContext(FinanceContext);

  const [showAll, setShowAll] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  // --- Filter Logic for UNPAID "Bill Prep" items ---
  const billPrepItems = useMemo(() => {
    const validBills = Array.isArray(bills) ? bills : [];
    const currentMonthStart = displayedMonth.startOf('month');
    const currentMonthEnd = displayedMonth.endOf('month');
    const previousMonthStart = displayedMonth.subtract(1, 'month').startOf('month');
    const previousMonthEnd = displayedMonth.subtract(1, 'month').endOf('month');

    return validBills
      .filter(bill => {
        const isBillPrep = bill.category?.toLowerCase() === 'bill prep';
        if (!isBillPrep) return false;
        const dueDate = dayjs(bill.dueDate);
        if (!dueDate.isValid()) return false;
        const isInCurrentMonth = dueDate.isBetween(currentMonthStart, currentMonthEnd, 'day', '[]');
        const isInPreviousMonth = dueDate.isBetween(previousMonthStart, previousMonthEnd, 'day', '[]');
        if ((isInCurrentMonth || isInPreviousMonth) && !bill.isPaid) {
          return true;
        }
        return false;
      })
      .sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf());
  }, [bills, displayedMonth]);

  // --- Grouping Logic ---
  const groupedBillPrepItems = useMemo(() => {
    if (!billPrepItems || billPrepItems.length === 0) {
        return [];
    }
    const grouped = billPrepItems.reduce((acc, bill) => {
      const name = bill.name;
      if (!acc[name]) {
        acc[name] = {
          id: `group-${name}-${bill.category}`,
          name: name,
          category: bill.category,
          totalAmount: 0,
          bills: [],
          isCombined: false,
        };
      }
      acc[name].totalAmount += Number(bill.amount || 0);
      acc[name].bills.push(bill);
      acc[name].isCombined = acc[name].bills.length > 1;
      return acc;
    }, {});
    return Object.values(grouped);
  }, [billPrepItems]);
  // --- End Grouping Logic ---

  // Prepare data for display
  const displayedItems = showAll
       ? groupedBillPrepItems
       : groupedBillPrepItems.slice(0, INITIAL_LIMIT);

  if (error && !loading) {
    return <Alert message="Error loading bill prep items" type="warning" showIcon style={style} />;
  }

  const collapseButton = (
        <Button
            type="text"
            icon={isCollapsed ? <IconChevronDown size={16} /> : <IconMinus size={16} />}
            onClick={toggleCollapse}
            style={{ color: 'var(--neutral-600)' }}
        />
  );

  const cardTitle = (
      <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', color: 'var(--neutral-800)' }}>
          <IconClipboardList size={24} style={{ marginRight: 'var(--space-8)', color: 'var(--primary-600)' }} />
          Bill Prep
      </Title>
  );

  return (
    <>
      <Spin spinning={loading} size="small">
        <Card
          style={{ ...style, height: '100%' }}
          title={cardTitle}
          extra={collapseButton}
          styles={{ body: { padding: groupedBillPrepItems.length > 0 ? '0 20px 16px 20px' : '20px' } }}
        >
          {!isCollapsed && (
              <>
                  {groupedBillPrepItems.length === 0 && !loading ? (
                      <Empty description="No unpaid 'Bill Prep' items found for this or the previous month." image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 'var(--space-32) 0' }}/>
                  ) : (
                  <>
                      <List
                        size="small"
                        itemLayout="horizontal"
                        dataSource={displayedItems}
                        renderItem={(item) => {
                            const displayAmount = item.isCombined ? item.totalAmount : Number(item.bills[0].amount || 0);
                            const itemCount = item.bills.length;

                            return (
                                <List.Item
                                    style={{
                                        padding: '12px 0',
                                        borderBottom: '1px solid var(--neutral-200)',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {/* Avatar */}
                                    <Avatar
                                        shape="square"
                                        size={36}
                                        style={{
                                            backgroundColor: 'var(--primary-100)',
                                            borderRadius: 'var(--radius-lg)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginRight: 'var(--space-12)',
                                            flexShrink: 0
                                        }}
                                        icon={item.isCombined
                                            ? <IconBoxMultiple size={20} style={{ color: 'var(--primary-600)' }} />
                                            : React.cloneElement(getCategoryIcon(item.category), { style: { color: 'var(--primary-600)', strokeWidth: 1.5 }})
                                        }
                                    />

                                    {/* Main Content Block */}
                                    <div style={{
                                        flex: 1,
                                        minWidth: 0,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        {/* Left Block (Name + Item Count) */}
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            minWidth: 0,
                                            paddingRight: 'var(--space-8)'
                                        }}>
                                            <Text
                                              ellipsis
                                              style={{
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                color: 'var(--neutral-800)',
                                                lineHeight: 1.4
                                              }}
                                            >
                                              {/* Removed item count from here */}
                                              {item.name}
                                            </Text>
                                            {/* Item Count Text */}
                                            <Text
                                                style={{
                                                    color: 'var(--neutral-600)',
                                                    fontSize: '0.75rem',
                                                    marginTop: '4px',
                                                }}
                                            >
                                                {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                                            </Text>
                                        </div>

                                        {/* Right Block (Amount) */}
                                        <Text
                                          strong
                                          style={{
                                            flexShrink: 0,
                                            textAlign: 'right',
                                            color: 'var(--neutral-800)',
                                            fontSize: '0.9rem',
                                          }}
                                        >
                                          ${displayAmount.toFixed(2)}
                                        </Text>
                                    </div>
                                </List.Item>
                            );
                        }}
                      />
                      {groupedBillPrepItems.length > INITIAL_LIMIT && (
                          <div style={{ textAlign: 'center', marginTop: 'var(--space-12)', paddingBottom: 'var(--space-4)' }}>
                              <Button type="link" onClick={() => setShowAll(prev => !prev)}>
                                  {showAll ? 'Show Less' : 'Display All'}
                              </Button>
                          </div>
                      )}
                  </>
                  )}
              </>
          )}
        </Card>
      </Spin>
    </>
  );
};

export default BillPrepCard;
