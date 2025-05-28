// src/components/FinancialSummary/CombinedBillsOverview/BillsListSection.jsx
import React from 'react';
import {
    Table, Button, Space, Tag, Typography, Grid
} from 'antd';
import {
    IconPlus // Keep only needed icons
} from '@tabler/icons-react';
import './BillsListSection.css';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const BillsListSection = ({
    loading,
    columns,
    tableDataSource,
    isTableCollapsed, // Receive collapse state from parent
    categories,
    selectedCategory,
    setSelectedCategory,
    handleAddBill,
    getCategoryIcon,
    selectedAllButtonStyle,
    defaultAllButtonStyle,
    rowClassName
}) => {

    const screens = useBreakpoint();
    const isSmallScreen = screens.xs || screens.sm;

    return (
        <div>
            {/* Filter Section */}
            <div style={{ marginBottom: '20px', width: '100%' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    {/* Filter controls */}
                    <Space align="center">
                        <Text strong style={{ color: 'var(--neutral-600)', whiteSpace: 'nowrap' }}> Filter by: </Text>
                        <Button
                            size="small"
                            type="default"
                            className="all-categories-btn"
                            onClick={() => setSelectedCategory('All')}
                            style={selectedCategory === 'All' ? selectedAllButtonStyle : defaultAllButtonStyle}
                        >
                            All Categories
                        </Button>
                    </Space>

                    {/* Button for Adding Bills */}
                    {/* This button will be hidden on mobile via the 'hide-on-mobile' class (defined in global.css) */}
                    <div>
                        <Button
                            type="primary"
                            icon={<IconPlus size={16} />}
                            onClick={handleAddBill}
                            style={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}
                            className="hide-on-mobile" // Keep class to hide on mobile
                        >
                            Add Bills
                        </Button>
                    </div>
                 </div>
                 {/* Category Tags Container - Apply specific class, REMOVE inline style */}
                 <div
                    className="category-tags-container" // Class for styling (mobile and desktop)
                    // Removed inline style: style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}
                 >
                    {categories.map((category) => (
                        <Tag.CheckableTag
                            key={category}
                            checked={selectedCategory === category}
                            onChange={(checked) => { setSelectedCategory(checked ? category : 'All'); }}
                            // Inline styles for individual tags are fine
                            style={{ padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid', borderColor: selectedCategory === category ? 'var(--primary-500)' : 'var(--neutral-300)', backgroundColor: selectedCategory === category ? 'var(--primary-50)' : 'var(--neutral-50)', color: selectedCategory === category ? 'var(--primary-600)' : 'var(--neutral-700)', lineHeight: '1.4', fontSize: '0.8rem' }} >
                            {/* Ensure getCategoryIcon is available and correct */}
                            {getCategoryIcon && getCategoryIcon(category)} <span>{category}</span>
                        </Tag.CheckableTag>
                    ))}
                 </div>
                 </div>
                 {/* END Filter Section */}

            {/* Main Bills Table */}
            <Table
                className="bills-overview-table" // Added class for mobile-specific styling
                columns={columns}
                dataSource={tableDataSource}
                rowKey={record => record.id || `${record.name}-${record.dueDate}`} // Ensure unique keys
                rowClassName={rowClassName}
                pagination={false}
                scroll={isSmallScreen ? undefined : { x: 730 }}
                size="middle"
                loading={loading}
                // --- START: MODIFIED LOCALE FOR COLLAPSE ---
                // Conditionally set locale to hide "No Data" message only when collapsed
                locale={isTableCollapsed ? { emptyText: null } : undefined}
                // --- END: MODIFIED LOCALE FOR COLLAPSE ---
            />
            {/* --- START: ADJUSTED EMPTY TEXT LOGIC --- */}
            {/* Only show this text if the table is NOT collapsed AND the dataSource is truly empty */}
            {tableDataSource.length === 0 && !loading && !isTableCollapsed && (
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 'var(--space-16)' }}>
                    No bills match the current filters for this month.
                </Text>
            )}
            {/* Removed the redundant "Table is collapsed" text block */}
            {/* --- END: ADJUSTED EMPTY TEXT LOGIC --- */}
        </div>
    );
};

// Add defaultProps for safety, although App.jsx should always pass them
BillsListSection.defaultProps = {
  handleAddBill: () => console.warn("handleAddBill handler not provided to BillsListSection"),
  getCategoryIcon: () => null, // Provide a default fallback for the icon function
  rowClassName: () => ''
};


export default BillsListSection;