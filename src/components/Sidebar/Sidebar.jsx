// src/components/Sidebar/Sidebar.jsx
import React, { useContext, useState, useMemo } from 'react';
import { Layout, Menu, Spin, Button, Tooltip, Space, message, Typography, Dropdown } from 'antd';
import {
  IconHomeFilled,
  IconChartPieFilled,
  IconCreditCard,
  IconPlus,
  IconEdit,
  IconWallet,
  IconTrash,
  IconSettings,
  IconUsers,
  IconDotsVertical,
  IconGripVertical,
  IconActivityHeartbeat,
  IconBuildingBank // Added for the Edit Bank Balance button
} from '@tabler/icons-react';
// dnd-kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { FinanceContext } from '../../contexts/FinanceContext';
import AddCreditCardModal from './AddCreditCardModal';
import EditCreditCardModal from './EditCreditCardModal';
import './Sidebar.css';

const { Sider } = Layout;
const { Text } = Typography;

// Sortable card item for drag-and-drop
const SortableCardItem = ({ id, card, collapsed, onEdit, onDelete, isOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Style for the draggable item
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging && !isOverlay ? 0.5 : 1,
    cursor: isOverlay ? 'grabbing' : 'grab',
    zIndex: isDragging ? 100 : 'auto',
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
  };

  // Menu items for the action dropdown
  const actionMenuItems = [
    { key: 'edit', icon: <IconEdit size={16} />, label: 'Edit', onClick: () => onEdit(card) },
    { key: 'delete', icon: <IconTrash size={16} />, label: 'Delete', danger: true, onClick: () => onDelete(card) },
  ];

  return (
    // Outer wrapper for the sortable item
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`sortable-card-item-wrapper ${isDragging ? 'is-dragging' : ''} ${isOverlay ? 'is-overlay' : ''}`}
    >
      {/* Inner container for the card content */}
      <div className={`sidebar-card-item ${collapsed ? 'collapsed' : ''}`}>
        {/* Drag handle */}
        <span {...listeners} className="drag-handle" title="Drag to reorder">
          <IconGripVertical size={18} />
        </span>

        {/* Main content of the card item */}
        <div className="sidebar-card-item-content">
          <IconCreditCard stroke={1.5} size={20} className="card-item-main-icon" />
          {/* Display card details only if sidebar is not collapsed */}
          {!collapsed && (
            <div className="card-details">
              <span className="card-name" title={card.name}>{card.name}</span>
              <span className="card-balance">
                ${Number(card.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* Action dropdown - only shown when not collapsed and not an overlay */}
        {!collapsed && !isOverlay && (
          <Dropdown
            menu={{ items: actionMenuItems, onClick: e => e.domEvent.stopPropagation() }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              className="card-action-dropdown-trigger"
              type="text"
              size="small"
              icon={<IconDotsVertical size={16} />}
              onClick={e => e.stopPropagation()}
            />
          </Dropdown>
        )}
      </div>
    </div>
  );
};


// Main Sidebar component
const Sidebar = ({ 
  collapsed, 
  onCollapse, 
  selectedKey, 
  onSelect, 
  width, 
  collapsedWidth,
  onEditBalance // Added prop for edit balance functionality
}) => {
  // Get data and functions from FinanceContext
  const {
    creditCards,
    loadingCreditCards,
    createCreditCard,
    editCreditCard,
    removeCreditCard,
    reorderCreditCards,
  } = useContext(FinanceContext);

  // State for modal visibility and editing data
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  // State to track the ID of the item being dragged
  const [activeId, setActiveId] = useState(null);

  // Modal control functions
  const showAddModal = () => setIsAddModalVisible(true);
  const handleAddModalClose = () => setIsAddModalVisible(false);
  const showEditModal = card => { setEditingCard(card); setIsEditModalVisible(true); };
  const handleEditModalClose = () => { setEditingCard(null); setIsEditModalVisible(false); };

  // Function to handle card deletion
  const handleDeleteConfirm = async card => {
    if (!card || typeof card.id === 'undefined') {
      message.error('Cannot delete card: Invalid data.');
      return;
    }
    try {
      await removeCreditCard(card.id); // Call context function
      // Success message is handled within the context function
    } catch (err) {
      message.error(`Error deleting card: ${err.message}`); // Show error message on failure
    }
  };

  // Setup sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 5 pixels before activating drag
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      // Use keyboard coordinates for accessibility
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handler for when dragging starts
  const handleDragStart = event => setActiveId(event.active.id);

  // Handler for when dragging ends
  const handleDragEnd = event => {
    setActiveId(null); // Reset active drag ID
    const { active, over } = event;

    // If dropped over a valid target and it's different from the dragged item
    if (over && active.id !== over.id) {
      const oldIndex = creditCards.findIndex(c => c.id === active.id);
      const newIndex = creditCards.findIndex(c => c.id === over.id);

      // If indices are valid
      if (oldIndex !== -1 && newIndex !== -1) {
        // Get the new order of cards
        const newOrder = arrayMove(creditCards, oldIndex, newIndex);
        // Call context function to update the order in the backend/state
        reorderCreditCards(newOrder);
      }
    }
  };

  // Define the main navigation menu items
  const mainMenuItems = [
    { label: 'Dashboard', key: 'dashboard', icon: <IconHomeFilled size={20} /> },
    { label: 'Finance Feed', key: 'finance-feed', icon: <IconActivityHeartbeat size={20} /> },
    { label: 'Reports',   key: 'reports',   icon: <IconChartPieFilled size={20} /> },
    { label: 'Settings',  key: 'settings',  icon: <IconSettings size={20} /> },
  ];

  // Memoize credit card IDs for dnd-kit context
  const creditCardIds = useMemo(() => creditCards.map(c => c.id), [creditCards]);
  // Find the card data corresponding to the currently dragged item ID
  const activeCard = activeId ? creditCards.find(c => c.id === activeId) : null;

  return (
    <>
      {/* Ant Design Sider component */}
      <Sider
        collapsible
        collapsed={collapsed} // Control collapse state
        onCollapse={onCollapse} // Handler for collapse trigger (if any)
        trigger={null} // Disable default trigger
        breakpoint="lg" // Breakpoint for automatic collapsing
        collapsedWidth={collapsedWidth} // Width when collapsed
        width={width} // Width when expanded
        theme="light" // Theme
        className="app-sidebar" // Custom CSS class
        style={{
          position: 'fixed', top: 0, bottom: 0, left: 0, // Fixed positioning
          height: '100vh', overflow: 'hidden', // Full height, hide overflow initially
          background: '#fff', borderRight: '1px solid var(--neutral-200)', // Styling
          boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column' // Flex layout
        }}
      >
        {/* Sidebar Logo Section */}
        <div className="sidebar-logo">
          <div className="logo-icon-wrapper"><IconWallet size={20} style={{ color: 'white' }} /></div>
          {!collapsed && <span className="logo-text">Financely</span>}
        </div>

        {/* Drag and Drop Context */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter} // Collision detection strategy
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)} // Reset on cancel
        >
          {/* Scrollable container for menu items */}
          <div className="sidebar-main-menu-container" style={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {/* Main Navigation Menu */}
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={[selectedKey]} // Highlight the selected item
              // Map menu items, adding necessary class for styling
              items={mainMenuItems.map(item => ({
                ...item,
                className: 'non-sortable-menu-item', // Apply general styling class
              }))}
              onClick={onSelect} // Handler for menu item clicks
              className="sidebar-menu"
              style={{ borderRight: 0, paddingBottom: 0 }} // Styling adjustments
            />

            {/* Credit Cards Section Header */}
            <div className="sidebar-group-header credit-card-menu-group">
              <span className="sidebar-group-label">CREDIT CARDS</span>
            </div>

            {/* Sortable Context for Credit Cards */}
            <SortableContext items={creditCardIds} strategy={verticalListSortingStrategy}>
              <div className="sortable-items-container">
                {/* Show spinner while loading cards */}
                {loadingCreditCards ? (
                  <Menu theme="light" mode="inline" selectable={false} style={{ borderRight: 0 }}>
                    <Menu.Item key="cc-loading" disabled icon={<Spin size="small" />}>
                      Loading Cards...
                    </Menu.Item>
                  </Menu>
                ) : (
                  // Render sortable card items
                  creditCards.map(card => (
                    <SortableCardItem
                      key={card.id}
                      id={card.id}
                      card={card}
                      collapsed={collapsed}
                      onEdit={showEditModal}
                      onDelete={handleDeleteConfirm}
                    />
                  ))
                )}
              </div>
            </SortableContext>

            {/* Add Credit Card Menu Item */}
            <Menu
              theme="light"
              mode="inline"
              selectable={false}
              items={[{
                key: 'add-credit-card',
                icon: <IconPlus size={20} />,
                label: 'Add Credit Card',
                className: 'add-card-menu-item non-sortable-menu-item', // Apply styling classes
                onClick: showAddModal // Open add modal on click
              }]}
              style={{ borderRight: 0 }}
              className="sidebar-menu add-card-menu-section"
            />
          </div>

          {/* Drag Overlay: Renders the item being dragged */}
          <DragOverlay>
            {activeId && activeCard && (
              <SortableCardItem
                id={activeId}
                card={activeCard}
                collapsed={collapsed}
                onEdit={() => {}} // No edit/delete on overlay
                onDelete={() => {}}
                isOverlay // Flag to indicate it's the overlay item
              />
            )}
          </DragOverlay>
        </DndContext>

        {/* Bottom Navigation Section */}
        <div className="sidebar-bottom-nav">
          {collapsed ? (
            // Render icons with tooltips when collapsed
            <>
              {/* Edit Bank Balance button */}
              <Tooltip title="Edit Bank Balance" placement="right">
                <Button 
                  className="sidebar-bottom-button" 
                  type="text" 
                  icon={<IconBuildingBank size={20} />} 
                  onClick={onEditBalance}
                />
              </Tooltip>
              <Tooltip title="Account" placement="right">
                <Button 
                  className="sidebar-bottom-button" 
                  type="text" 
                  icon={<IconUsers size={20} />} 
                  onClick={() => { /* TODO: Implement account action */ }} 
                />
              </Tooltip>
            </>
          ) : (
            // Render buttons with text when expanded
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* Edit Bank Balance button */}
              <Button 
                className="sidebar-bottom-button" 
                type="text" 
                icon={<IconBuildingBank size={20} />} 
                onClick={onEditBalance}
              >
                Edit Bank Balance
              </Button>
              <Button 
                className="sidebar-bottom-button" 
                type="text" 
                icon={<IconUsers size={20} />} 
                onClick={() => { /* TODO: Implement account action */ }}
              >
                Account
              </Button>
            </Space>
          )}
        </div>
      </Sider>

      {/* Modals */}
      <AddCreditCardModal open={isAddModalVisible} onClose={handleAddModalClose} onSubmit={createCreditCard} />
      {/* Render Edit modal only when editingCard has data */}
      {editingCard && (
        <EditCreditCardModal
          open={isEditModalVisible}
          onClose={handleEditModalClose}
          onSubmit={editCreditCard}
          cardData={editingCard}
        />
      )}
    </>
  );
};

export default Sidebar;