// src/components/FinanceFeed/FinanceFeed.jsx
import React from 'react';
import MobileFinanceFeed from './MobileFinanceFeed';
import './styles/FinanceFeed.css';

/**
 * Finance Feed component - A dedicated page showing financial activity
 * Components are arranged in a mobile-friendly layout
 */
const FinanceFeed = ({ onEditBill, onAddBill }) => {
  return (
    <div className="finance-feed-mobile">
      <MobileFinanceFeed
        onEditBill={onEditBill}
        onAddBill={onAddBill}
      />
    </div>
  );
};

export default FinanceFeed;