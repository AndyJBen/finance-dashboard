// src/components/FinancialSummary/BillsListSection.jsx
import React from 'react';
import {
    Table, Button, Space, Tag, Dropdown, Menu, Typography
} from 'antd';
import {
    IconPlus, IconChevronDown, IconPlaylistAdd
} from '@tabler/icons-react';

// Use Typography components directly
const { Text } = Typography;

const BillsListSection = ({
    loading, // To potentially show loading state here if needed
    columns,
    tableDataSource,
    isTableCollapsed,
    categories,
    selectedCategory,
    setSelectedCategory,
    handleAddSingle, // Function to open single add modal
    handleMenuClick, // Function to handle dropdown menu clicks
    addBillMenuItems, // Menu items for the dropdown
    getCategoryIcon, // Helper function passed from parent
    selectedAllButtonStyle, // Style object passed from parent
    defaultAllButtonStyle // Style object passed from parent
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
                    <div>
                        <Dropdown.Button
                            type="primary"
                            icon={<IconChevronDown size={16} />} // Dropdown indicator
                            onClick={handleAddSingle} // Default action: Add Single Bill
                            menu={{ items: addBillMenuItems, onClick: handleMenuClick }} // Pass items and handler
                            style={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}
                        >
                            <IconPlus size={16} style={{marginRight: '4px'}}/> {/* Icon for the main button part */}
                            Add Bill
                        </Dropdown.Button>
                    </div>
                 </div>
                 {/* Category Tags */}
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {categories.map((category) => (
                        <Tag.CheckableTag
                            key={category}
                            checked={selectedCategory === category}
                            onChange={(checked) => { setSelectedCategory(checked ? category : 'All'); }}
                            style={{ padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid', borderColor: selectedCategory === category ? 'var(--primary-500)' : 'var(--neutral-300)', backgroundColor: selectedCategory === category ? 'var(--primary-50)' : 'var(--neutral-50)', color: selectedCategory === category ? 'var(--primary-600)' : 'var(--neutral-700)', lineHeight: '1.4', fontSize: '0.8rem' }} >
                            {getCategoryIcon(category)} <span>{category}</span>
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
                pagination={false} // Pagination handled by parent or potentially here if needed
                scroll={{ x: 730 }}
                size="middle"
                loading={loading} // Show loading state on table
            />
            {/* No Bills Message */}
            {tableDataSource.length === 0 && !loading && (
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 'var(--space-16)' }}>
                    {isTableCollapsed ? 'Table is collapsed.' : 'No bills match the current filters for this month.'}
                </Text>
                 )}
        </div>
    );
};

export default BillsListSection;
