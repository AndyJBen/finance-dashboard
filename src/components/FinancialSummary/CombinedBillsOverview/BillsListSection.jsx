// src/components/FinancialSummary/CombinedBillsOverview/BillsListSection.jsx
// Using handleAddSingle prop for the main button click
// Highlight: Added className="hide-on-mobile" to Dropdown.Button
// Highlight: Added className="category-tags-container" to the div wrapping category tags for mobile carousel styling

import React from 'react';
import {
    Table, Button, Space, Tag, Dropdown, Menu, Typography
} from 'antd';
import {
    IconPlus, IconChevronDown, IconPlaylistAdd // Keep needed icons
} from '@tabler/icons-react';

const { Text } = Typography;

const BillsListSection = ({
    loading,
    columns,
    tableDataSource,
    isTableCollapsed,
    categories,
    selectedCategory,
    setSelectedCategory,
    handleAddSingle, // Function to open single add modal (received as prop)
    handleMenuClick, // Function to handle dropdown menu clicks (for multi-modal)
    addBillMenuItems, // Menu items for the dropdown
    getCategoryIcon,
    selectedAllButtonStyle,
    defaultAllButtonStyle
}) => {

    return (
        <div>
            {/* Filter Section */}
            <div style={{ marginBottom: '16px', width: '100%' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    {/* Filter controls */}
                    <Space align="center">
                        <Text strong style={{ color: 'var(--neutral-600)', whiteSpace: 'nowrap' }}> Filter by: </Text>
                        <Button size="small" type="default" onClick={() => setSelectedCategory('All')} style={selectedCategory === 'All' ? selectedAllButtonStyle : defaultAllButtonStyle} >
                            All Categories
                        </Button>
                    </Space>

                    {/* Dropdown Button for Adding Bills */}
                    {/* This button will be hidden on mobile via the 'hide-on-mobile' class (defined in global.css) */}
                    <div>
                        <Dropdown.Button
                            type="primary"
                            icon={<IconChevronDown size={16} />}
                            // Use the handleAddSingle prop for the main button click
                            onClick={handleAddSingle} // Use the prop here
                            menu={{ items: addBillMenuItems, onClick: handleMenuClick }}
                            style={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}
                            className="hide-on-mobile" // Add class to hide on mobile
                        >
                            <IconPlus size={16} style={{marginRight: '4px'}}/>
                            Add Bill
                        </Dropdown.Button>
                    </div>
                 </div>
                 {/* Category Tags Container - Apply specific class for mobile styling */}
                 <div
                    className="category-tags-container" // Added class for mobile carousel styling
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }} // Default styles (wrap on desktop)
                 >
                    {categories.map((category) => (
                        <Tag.CheckableTag
                            key={category}
                            checked={selectedCategory === category}
                            onChange={(checked) => { setSelectedCategory(checked ? category : 'All'); }}
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
                columns={columns}
                dataSource={tableDataSource}
                rowKey={record => record.id || `${record.name}-${record.dueDate}`} // Ensure unique keys
                pagination={false}
                scroll={{ x: 730 }}
                size="middle"
                loading={loading}
            />
            {tableDataSource.length === 0 && !loading && (
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 'var(--space-16)' }}>
                    {isTableCollapsed ? 'Table is collapsed.' : 'No bills match the current filters for this month.'}
                </Text>
                 )}
        </div>
    );
};

// Add defaultProps for safety, although App.jsx should always pass them
BillsListSection.defaultProps = {
  handleAddSingle: () => console.warn("handleAddSingle handler not provided to BillsListSection"),
  getCategoryIcon: () => null, // Provide a default fallback for the icon function
};


export default BillsListSection;
