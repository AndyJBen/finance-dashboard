// src/components/FinancialSummary/CombinedBillsOverview/BillsListSection.jsx
// Using handleAddSingle prop for the main button click
// Added mobile carousel for categories and hide Add Bill button on mobile

import React from 'react';
import {
    Table, Button, Space, Tag, Dropdown, Menu, Typography, Grid // Added Grid
} from 'antd';
import {
    IconPlus, IconChevronDown, IconPlaylistAdd // Keep needed icons
} from '@tabler/icons-react';

const { Text } = Typography;
const { useBreakpoint } = Grid; // Import useBreakpoint

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

    const screens = useBreakpoint(); // Get breakpoint status
    const isMobile = !screens.md;    // Determine if mobile view

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
                    {/* 🟩 MODIFIED: Added Tailwind classes to hide on mobile */}
                    <div className="hidden md:block"> {/* Hide on screens smaller than md */}
                        <Dropdown.Button
                            type="primary"
                            icon={<IconChevronDown size={16} />}
                            // Use the handleAddSingle prop for the main button click
                            onClick={handleAddSingle} // Use the prop here
                            menu={{ items: addBillMenuItems, onClick: handleMenuClick }}
                            style={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}
                        >
                            <IconPlus size={16} style={{marginRight: '4px'}}/>
                            Add Bill
                        </Dropdown.Button>
                    </div>
                </div>
                {/* Category Tags */}
                {/* 🟩 MODIFIED: Added Tailwind classes for mobile horizontal scroll */}
                <div className={`flex gap-1.5 ${isMobile ? 'overflow-x-auto flex-nowrap pb-2 scrollbar-hide' : 'flex-wrap'}`}>
                    {categories.map((category) => (
                        <Tag.CheckableTag
                            key={category}
                            checked={selectedCategory === category}
                            onChange={(checked) => { setSelectedCategory(checked ? category : 'All'); }}
                            // Added flex-shrink-0 to prevent tags from shrinking in the scroll container
                            className="flex-shrink-0"
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
                // 🟩 MODIFIED: Adjusted pagination logic based on isTableCollapsed
                pagination={isTableCollapsed ? false : { pageSize: 10, size: 'small' }}
                scroll={{ x: 730 }} // Keep horizontal scroll for table content if needed
                size="middle"
                loading={loading}
            />
            {tableDataSource.length === 0 && !loading && (
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 'var(--space-16)' }}>
                    {isTableCollapsed ? 'Table is collapsed.' : 'No bills match the current filters for this month.'}
                </Text>
            )}

            {/* 🟩 ADDED: Minimal scrollbar styling for the category filter on mobile (optional) */}
            {isMobile && (
                 <style jsx global>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none; /* Safari and Chrome */
                    }
                    .scrollbar-hide {
                        -ms-overflow-style: none;  /* IE and Edge */
                        scrollbar-width: none;  /* Firefox */
                    }
                `}</style>
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
