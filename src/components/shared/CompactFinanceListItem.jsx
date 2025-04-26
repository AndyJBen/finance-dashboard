// src/components/shared/CompactFinanceListItem.jsx
// New reusable component for displaying items in finance feed lists compactly

import React from 'react';
import { List, Avatar, Typography, Space } from 'antd';
import { IconHelp } from '@tabler/icons-react'; // Default icon

const { Text } = Typography;

/**
 * A compact list item component for finance feeds.
 *
 * @param {object} props - Component props
 * @param {React.ReactNode} [props.icon=<IconHelp />] - Icon element to display (e.g., category icon).
 * @param {string} props.title - The main title of the list item (e.g., bill name, transaction name).
 * @param {string|React.ReactNode} [props.description] - Secondary text below the title (e.g., due date, category, time ago).
 * @param {number|string} [props.amount] - The monetary amount to display.
 * @param {string} [props.amountColor] - Optional color for the amount text (e.g., 'red' for past due).
 * @param {function} [props.onClick] - Optional click handler for the list item.
 */
const CompactFinanceListItem = ({
  icon = <IconHelp size={20} />, // Default icon
  title,
  description,
  amount,
  amountColor, // e.g., 'var(--danger-color)' or 'red'
  onClick,
}) => {
  // Determine the style for the amount text
  const amountStyle = {
    fontWeight: 500, // Slightly bold
    fontSize: '0.9rem', // Slightly smaller font
    color: amountColor, // Apply custom color if provided
    whiteSpace: 'nowrap', // Prevent amount from wrapping
  };

  // Format amount if it's a number
  const formattedAmount = typeof amount === 'number'
    ? `$${amount.toFixed(2)}`
    : amount; // Use as is if already string or null/undefined

  return (
    <List.Item
      style={{ padding: '8px 12px' }} // Reduced padding
      onClick={onClick} // Make item clickable if handler is provided
      className={onClick ? 'clickable-list-item' : ''} // Optional class for hover effect
    >
      <List.Item.Meta
        avatar={
          <Avatar
            shape="circle" // Use circle shape for icons
            size={32} // Smaller avatar size
            icon={icon}
            style={{ backgroundColor: 'var(--neutral-100)', color: 'var(--neutral-600)' }} // Subtle background
          />
        }
        title={
          <Text style={{ fontSize: '0.9rem' }} ellipsis> {/* Slightly smaller title font */}
            {title}
          </Text>
        }
        description={
          description && (
            <Text type="secondary" style={{ fontSize: '0.8rem' }} ellipsis> {/* Smaller description font */}
              {description}
            </Text>
          )
        }
      />
      {/* Display amount only if it exists */}
      {formattedAmount !== null && formattedAmount !== undefined && (
        <Text style={amountStyle}>
          {formattedAmount}
        </Text>
      )}
    </List.Item>
  );
};

export default CompactFinanceListItem;
