import React from 'react';
import { ResponsiveRadialBar } from '@nivo/radial-bar';
import { theme, Typography } from 'antd';
import './CreditUtilizationGauge.css';

const { Text } = Typography;

// --- PLACEHOLDER DATA ---
// You NEED to add 'limit' to your credit_cards table/API
const PLACEHOLDER_UTILIZATION_DATA = [
  { id: 'Visa Gold',      data: [{ x: 'Util.', y: 65 }], limit: 5000,  balance: 3250 }, // y = (balance / limit) * 100
  { id: 'Store Card',     data: [{ x: 'Util.', y: 82 }], limit: 1000,  balance: 820  },
  { id: 'Travel Rewards', data: [{ x: 'Util.', y: 30 }], limit: 10000, balance: 3000 },
];
// --- END PLACEHOLDER ---

// Helper to process actual card data (once limits are available)
// const processUtilizationData = cards =>
//   cards.map(card => ({
//     id: card.name,
//     limit: card.limit,
//     balance: card.balance,
//     data: [{
//       x: 'Util.',
//       y: card.limit > 0 ? Math.round((card.balance / card.limit) * 100) : 0,
//     }],
//   }));

// This component renders ONE gauge at a time.
// Parent page should map over processed data and render one per card.
const CreditUtilizationGauge = ({ cardData }) => {
  const { token } = theme.useToken();
  const utilization = cardData.data[0].y; // Percentage value

  // Pick a colour based on utilisation thresholds
  const getColor = value => {
    if (value > 75) return token.colorError;
    if (value > 50) return token.colorWarning;
    return token.colorSuccess;
  };

  return (
    <div
      style={{
        height: '200px',
        width:  '200px',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <ResponsiveRadialBar
        data={cardData.data}          // e.g. [{ x: 'Util.', y: 65 }]
        valueFormat=">-.0f"
        maxValue={100}
        startAngle={-120}
        endAngle={120}
        innerRadius={0.65}
        padding={0.4}
        colors={[getColor(utilization)]}
        cornerRadius={5}
        enableTracks
        trackColor={token.colorFillSecondary}
        enableLabels={false}
        animate
        motionStiffness={90}
        motionDamping={15}
        theme={{
          tooltip: {
            container: {
              background: token.colorBgElevated,
              color:       token.colorText,
              borderRadius: token.borderRadiusLG,
              boxShadow:    token.boxShadowSecondary,
              padding:      '5px 10px',
            },
          },
        }}
        tooltip={({ bar }) => (
          <div
            style={{
              padding: '5px 10px',
              background: token.colorBgElevated,
              borderRadius: token.borderRadius,
              boxShadow: token.boxShadow,
            }}
          >
            <strong>{cardData.id}</strong><br />
            Balance: ${cardData.balance?.toFixed(2)}<br />
            Limit:   ${cardData.limit?.toFixed(2)}<br />
            Utilization: {bar.value}%
          </div>
        )}
      />

      {/* Centre text overlay */}
      <div
        style={{
          position: 'absolute',
          top:  '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <Text
          style={{
            fontSize: '1.5em',
            fontWeight: 'bold',
            color: getColor(utilization),
          }}
        >
          {utilization}%
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: '0.9em' }}>
          {cardData.id}
        </Text>
      </div>
    </div>
  );
};

export default CreditUtilizationGauge;
// export { processUtilizationData };  // Uncomment if you wire in real data
