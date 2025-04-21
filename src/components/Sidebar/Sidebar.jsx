import React, { useContext, useState, useMemo } from 'react';
import { Layout, Menu, Spin, Button, Tooltip, Space, message, Typography, Dropdown } from 'antd';
import {
  IconHomeFilled, IconReceiptFilled, IconChartPieFilled, IconCreditCard,
  IconPlus, IconEdit, IconWallet, IconTrash, IconSettings, IconUsers, IconDotsVertical,
  IconGripVertical // Import drag handle icon
} from '@tabler/icons-react';
// --- dnd-kit imports ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay, // Optional: For visual feedback while dragging
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// -----------------------
import { FinanceContext } from '../../contexts/FinanceContext';
import AddCreditCardModal from './AddCreditCardModal';
import EditCreditCardModal from './EditCreditCardModal';
import './Sidebar.css'; // Ensure CSS supports potential new styles

const { Sider } = Layout;
const { Text } = Typography;

// --- START: Sortable Item Component ---
// This component wraps each credit card item to make it sortable
// Added isOverlay prop for styling the drag overlay differently if needed
const SortableCardItem = ({ card, collapsed, onEdit, onDelete, isOverlay = false, id }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Use this to style the item while dragging
  } = useSortable({ id: id }); // Use the id prop passed to the component

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition, // Prevent transition during drag for smoother overlay
    opacity: isDragging && !isOverlay ? 0.5 : 1, // Make original item semi-transparent while dragging
    cursor: isOverlay ? 'grabbing' : 'grab', // Indicate draggable state
    zIndex: isDragging ? 100 : 'auto', // Ensure dragged item is above others
    // Add other styles as needed, e.g., background change on drag
    boxShadow: isDragging ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none', // Add shadow when dragging
  };

  // Define menu items for the action dropdown
  const cardActionMenuItems = [
     { key: 'edit', icon: <IconEdit size={16} />, label: 'Edit', onClick: () => onEdit(card) },
     { key: 'delete', icon: <IconTrash size={16} />, label: 'Delete', danger: true, onClick: () => onDelete(card) }
  ];

  return (
    // This div is the draggable element
    <div
        ref={setNodeRef}
        style={style}
        {...attributes} // Apply attributes here, not listeners yet
        className={`sortable-card-item-wrapper ${isDragging ? 'is-dragging' : ''} ${isOverlay ? 'is-overlay' : ''}`}
        data-is-dragging={isDragging} // Add data attribute for potential CSS targeting
    >
        {/* Use a div instead of Menu.Item for easier styling and DnD integration */}
        <div className={`sidebar-card-item ${collapsed ? 'collapsed' : ''}`}>
            {/* Drag Handle (Listeners are applied ONLY here) */}
            <span {...listeners} className="drag-handle" title="Drag to reorder">
                <IconGripVertical size={18} />
            </span>

            {/* Card Icon and Details */}
            <div className="sidebar-card-item-content">
                <IconCreditCard stroke={1.5} size={20} className="card-item-main-icon" />
                {!collapsed && (
                    <div className="card-details">
                        <span className="card-name" title={card.name}>{card.name}</span>
                        <span className="card-balance">
                            ${Number(card.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                )}
            </div>

            {/* Action Dropdown (only shown when not collapsed and not overlay) */}
            {!collapsed && !isOverlay && (
                <Dropdown
                    menu={{ items: cardActionMenuItems, onClick:(e) => e.domEvent.stopPropagation() }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        className="card-action-dropdown-trigger" type="text" size="small"
                        icon={<IconDotsVertical size={16} />}
                        onClick={e => e.stopPropagation()}
                    />
                </Dropdown>
            )}
        </div>
    </div>
  );
};
// --- END: Sortable Item Component ---


const Sidebar = ({ collapsed, onCollapse, selectedKey, onSelect, width, collapsedWidth }) => {
  const {
    creditCards, loadingCreditCards, createCreditCard, editCreditCard, removeCreditCard,
    // --- Get the reorder function from context ---
    reorderCreditCards
    // -------------------------------------------
  } = useContext(FinanceContext);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  // State to track the currently dragged item ID
  const [activeId, setActiveId] = useState(null);

  // --- Modal Handlers ---
  const showAddModal = () => setIsAddModalVisible(true);
  const handleAddModalClose = () => setIsAddModalVisible(false);
  const showEditModal = (card) => { setEditingCard(card); setIsEditModalVisible(true); };
  const handleEditModalClose = () => { setIsEditModalVisible(false); setEditingCard(null); };
  const handleDeleteConfirm = async (card) => {
    if (!card || typeof card.id === 'undefined') {
        console.error('[Sidebar] Invalid card object passed to handleDeleteConfirm:', card);
        message.error('Cannot delete card: Invalid data.');
        return;
    }
    console.log(`[Sidebar] Delete menu item clicked directly for card ID: ${card.id}, Name: ${card.name}`);
    try {
        const success = await removeCreditCard(card.id);
        if (success) {
            console.log(`[Sidebar] Context reported success deleting card ${card.id}`);
        } else {
            console.error(`[Sidebar] Context reported failure deleting card ${card.id}`);
        }
    } catch (error) {
        console.error(`[Sidebar] Unexpected error calling context removeCreditCard (ID: ${card.id}):`, error);
        message.error(`An unexpected error occurred while deleting the card: ${error.message || 'Unknown error'}`);
    }
  };

  // --- dnd-kit Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 5 pixels before activating
      // Helps prevent drags starting accidentally on simple clicks
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      // Enable keyboard dragging support
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  // ----------------------

  // --- Drag Handlers ---
  function handleDragStart(event) {
    // Store the ID of the item being dragged
    setActiveId(event.active.id);
    console.log("Drag Start:", event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    // Reset the active drag item ID
    setActiveId(null);

    // Check if the item was dropped over a valid target and moved position
    if (over && active.id !== over.id) {
      console.log(`Drag End: Item ${active.id} moved over ${over.id}`);
      // Find the original index of the dragged item
      const oldIndex = creditCards.findIndex((card) => card.id === active.id);
      // Find the new index where the item was dropped
      const newIndex = creditCards.findIndex((card) => card.id === over.id);

      // Safety check
      if (oldIndex === -1 || newIndex === -1) {
          console.error("Could not find dragged item indices");
          return;
      }

      console.log(`Moving from index ${oldIndex} to ${newIndex}`);

      // Create the newly ordered array using dnd-kit's utility
      const newOrder = arrayMove(creditCards, oldIndex, newIndex);

      // Call the context function to update state and trigger backend save
      if (reorderCreditCards) { // Ensure function exists
        reorderCreditCards(newOrder);
      } else {
        console.error("reorderCreditCards function not found in context!");
      }
    } else {
        console.log("Drag End: No move detected or dropped outside a valid target.");
    }
  }
  // --------------------

  // --- Menu Item Generation ---
  // Main menu items (non-draggable)
  const mainMenuItems = [
      { label: 'Dashboard', key: 'dashboard', icon: <IconHomeFilled size={20} />, className: 'non-sortable-menu-item' },
      { label: 'Bills', key: 'bills', icon: <IconReceiptFilled size={20} />, className: 'non-sortable-menu-item' },
      { label: 'Reports', key: 'reports', icon: <IconChartPieFilled size={20} />, className: 'non-sortable-menu-item' },
  ];

  // Use useMemo for credit card IDs used by SortableContext for performance
  const creditCardIds = useMemo(() => creditCards.map(card => card.id), [creditCards]);
   // --- End Menu Item Generation ---

   // Find the currently dragged card for the DragOverlay
   const activeCard = activeId ? creditCards.find(card => card.id === activeId) : null;

  // --- Component Render ---
  return (
    <>
      <Sider
        collapsible collapsed={collapsed} onCollapse={onCollapse} trigger={null}
        breakpoint="lg" collapsedWidth={collapsedWidth} width={width}
        theme="light" className="app-sidebar"
        style={{
            overflow: 'hidden', height: '100vh', position: 'fixed',
            left: 0, top: 0, bottom: 0, background: '#FFFFFF',
            borderRight: '1px solid var(--neutral-200)', boxShadow: 'var(--shadow-lg)',
            display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Logo Section */}
        <div className="sidebar-logo">
           <div className="logo-icon-wrapper"> <IconWallet size={20} style={{ color: 'white' }} /> </div>
           {!collapsed && <span className="logo-text">Financely</span>}
        </div>

        {/* --- Wrap Menu Area with DndContext --- */}
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
        >
            {/* This div handles the scrolling */}
            <div className="sidebar-main-menu-container" style={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>

                {/* Render Main Menu Items (Not Sortable) */}
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    items={[{ // Wrap main items in their group
                        type: 'group',
                        label: ( <div className="sidebar-group-header"><span className="sidebar-group-label">MAIN</span></div> ),
                        key: 'main-group',
                        children: mainMenuItems,
                    }]}
                    className="sidebar-menu"
                    style={{ borderRight: 0 }}
                    onClick={onSelect} // Handles main navigation clicks
                />

                {/* Credit Card Section Header */}
                <div className="sidebar-group-header credit-card-menu-group">
                    <span className="sidebar-group-label">CREDIT CARDS</span>
                </div>

                {/* SortableContext wraps ONLY the sortable items */}
                <SortableContext
                    items={creditCardIds} // Pass array of IDs
                    strategy={verticalListSortingStrategy}
                >
                    {/* Render Sortable Items */}
                    <div className="sortable-items-container"> {/* Optional container */}
                        {loadingCreditCards ? (
                            // Use Menu.Item for consistent styling during load
                            <Menu theme="light" mode="inline" selectable={false} className="sidebar-menu" style={{ borderRight: 0 }}>
                                <Menu.Item key="cc-loading" disabled icon={<Spin size="small" />}>Loading Cards...</Menu.Item>
                            </Menu>
                        ) : (
                            creditCards.map(card => (
                                <SortableCardItem
                                    key={card.id} // React key
                                    id={card.id}  // ID for dnd-kit
                                    card={card}
                                    collapsed={collapsed}
                                    onEdit={showEditModal}
                                    onDelete={handleDeleteConfirm}
                                />
                            ))
                        )}
                    </div>
                </SortableContext>

                {/* Render Add Card Button (outside SortableContext) */}
                 <Menu
                    theme="light"
                    mode="inline"
                    items={[{
                        key: 'add-credit-card',
                        icon: <IconPlus size={20} />,
                        label: 'Add Credit Card',
                        className: 'add-card-menu-item non-sortable-menu-item',
                        onClick: showAddModal,
                    }]}
                    className="sidebar-menu add-card-menu-section"
                    style={{ borderRight: 0 }}
                    selectable={false}
                 />

            </div> {/* End sidebar-main-menu-container */}

            {/* Drag Overlay: Renders a copy of the item being dragged */}
            <DragOverlay>
              {activeId && activeCard ? (
                // Render the SortableCardItem again, but mark it as an overlay
                <SortableCardItem
                    id={activeId}
                    card={activeCard}
                    collapsed={collapsed}
                    onEdit={() => {}} // No actions on overlay
                    onDelete={() => {}}
                    isOverlay // Pass prop to style it differently (e.g., higher z-index, no hover effects)
                />
              ) : null}
            </DragOverlay>

        </DndContext>
        {/* --- END: DndContext Wrapper --- */}


        {/* Bottom Navigation Section */}
        <div className="sidebar-bottom-nav">
           {collapsed ? (
            <>
              <Tooltip title="Settings" placement="right"><Button className="sidebar-bottom-button" type="text" icon={<IconSettings size={20} />} onClick={() => onSelect({ key: 'settings' })} /></Tooltip>
              <Tooltip title="Account" placement="right"><Button className="sidebar-bottom-button" type="text" icon={<IconUsers size={20} />} onClick={() => { console.log("Account clicked - Placeholder"); }} /></Tooltip>
            </>
          ) : (
            <>
              <Button className="sidebar-bottom-button" type="text" icon={<IconSettings size={20} />} onClick={() => onSelect({ key: 'settings' })} > Settings </Button>
              <Button className="sidebar-bottom-button" type="text" icon={<IconUsers size={20} />} onClick={() => { console.log("Account clicked - Placeholder"); }} > Account </Button>
            </>
          )}
        </div>
      </Sider>

      {/* Modals */}
      <AddCreditCardModal open={isAddModalVisible} onClose={handleAddModalClose} onSubmit={createCreditCard} />
      {editingCard && ( <EditCreditCardModal open={isEditModalVisible} onClose={handleEditModalClose} onSubmit={editCreditCard} cardData={editingCard} /> )}
    </>
  );
};

export default Sidebar;
