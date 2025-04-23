// src/components/Sidebar/Sidebar.jsx

import React, { useContext, useState, useMemo } from 'react';
import { Layout, Menu, Spin, Button, Tooltip, Space, message, Typography, Dropdown } from 'antd';
import {
  IconHomeFilled,
  IconReceiptFilled,
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
  IconSun,
  IconMoon
} from '@tabler/icons-react';
// dnd‑kit imports
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
import { ThemeContext } from '../../contexts/ThemeContext';
import AddCreditCardModal from './AddCreditCardModal';
import EditCreditCardModal from './EditCreditCardModal';
import './Sidebar.css';

const { Sider } = Layout;
const { Text } = Typography;

// Sortable card item for drag‑and‑drop
const SortableCardItem = ({ id, card, collapsed, onEdit, onDelete, isOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging && !isOverlay ? 0.5 : 1,
    cursor: isOverlay ? 'grabbing' : 'grab',
    zIndex: isDragging ? 100 : 'auto',
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
  };

  const actionMenuItems = [
    { key: 'edit', icon: <IconEdit size={16} />, label: 'Edit', onClick: () => onEdit(card) },
    { key: 'delete', icon: <IconTrash size={16} />, label: 'Delete', danger: true, onClick: () => onDelete(card) },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`sortable-card-item-wrapper ${isDragging ? 'is-dragging' : ''} ${isOverlay ? 'is-overlay' : ''}`}
    >
      <div className={`sidebar-card-item ${collapsed ? 'collapsed' : ''}`}>
        <span {...listeners} className="drag-handle" title="Drag to reorder">
          <IconGripVertical size={18} />
        </span>

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

const Sidebar = ({ collapsed, onCollapse, selectedKey, onSelect, width, collapsedWidth }) => {
  const {
    creditCards,
    loadingCreditCards,
    createCreditCard,
    editCreditCard,
    removeCreditCard,
    reorderCreditCards,
  } = useContext(FinanceContext);

  // Add theme context
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const showAddModal = () => setIsAddModalVisible(true);
  const handleAddModalClose = () => setIsAddModalVisible(false);
  const showEditModal = card => { setEditingCard(card); setIsEditModalVisible(true); };
  const handleEditModalClose = () => { setEditingCard(null); setIsEditModalVisible(false); };

  const handleDeleteConfirm = async card => {
    if (!card || typeof card.id === 'undefined') {
      message.error('Cannot delete card: Invalid data.');
      return;
    }
    try {
      await removeCreditCard(card.id);
    } catch (err) {
      message.error(`Error deleting card: ${err.message}`);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = event => setActiveId(event.active.id);

  const handleDragEnd = event => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = creditCards.findIndex(c => c.id === active.id);
      const newIndex = creditCards.findIndex(c => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newOrder = arrayMove(creditCards, oldIndex, newIndex);
      reorderCreditCards(newOrder);
    }
  };

  const mainMenuItems = [
    { label: 'Dashboard', key: 'dashboard', icon: <IconHomeFilled size={20} /> },
    { label: 'Bills',     key: 'bills',     icon: <IconReceiptFilled size={20} /> },
    { label: 'Reports',   key: 'reports',   icon: <IconChartPieFilled size={20} /> },
  ];

  const creditCardIds = useMemo(() => creditCards.map(c => c.id), [creditCards]);
  const activeCard = activeId && creditCards.find(c => c.id === activeId);

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        trigger={null}
        breakpoint="lg"
        collapsedWidth={collapsedWidth}
        width={width}
        theme="light"
        className="app-sidebar"
        style={{
          position: 'fixed', top: 0, bottom: 0, left: 0,
          height: '100vh', overflow: 'hidden',
          background: '#fff', borderRight: '1px solid var(--neutral-200)',
          boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column'
        }}
      >
        <div className="sidebar-logo">
          <div className="logo-icon-wrapper"><IconWallet size={20} style={{ color: 'white' }} /></div>
          {!collapsed && <span className="logo-text">Financely</span>}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="sidebar-main-menu-container" style={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={[selectedKey]}
              items={[{
                type: 'group',
                label: <div className="sidebar-group-header"><span className="sidebar-group-label">MAIN</span></div>,
                key: 'main-group',
                children: mainMenuItems
              }]}
              onClick={onSelect}
              className="sidebar-menu"
              style={{ borderRight: 0 }}
            />

            <div className="sidebar-group-header credit-card-menu-group">
              <span className="sidebar-group-label">CREDIT CARDS</span>
            </div>

            <SortableContext items={creditCardIds} strategy={verticalListSortingStrategy}>
              <div className="sortable-items-container">
                {loadingCreditCards ? (
                  <Menu theme="light" mode="inline" selectable={false} style={{ borderRight: 0 }}>
                    <Menu.Item key="cc-loading" disabled icon={<Spin size="small" />}>
                      Loading Cards...
                    </Menu.Item>
                  </Menu>
                ) : creditCards.map(card => (
                  <SortableCardItem
                    key={card.id}
                    id={card.id}
                    card={card}
                    collapsed={collapsed}
                    onEdit={showEditModal}
                    onDelete={handleDeleteConfirm}
                  />
                ))}
              </div>
            </SortableContext>

            <Menu
              theme="light"
              mode="inline"
              selectable={false}
              items={[{
                key: 'add-credit-card',
                icon: <IconPlus size={20} />,
                label: 'Add Credit Card',
                className: 'add-card-menu-item',
                onClick: showAddModal
              }]}
              style={{ borderRight: 0 }}
              className="sidebar-menu add-card-menu-section"
            />
          </div>

          <DragOverlay>
            {activeId && activeCard && (
              <SortableCardItem
                id={activeId}
                card={activeCard}
                collapsed={collapsed}
                onEdit={() => {}}
                onDelete={() => {}}
                isOverlay
              />
            )}
          </DragOverlay>
        </DndContext>

        <div className="sidebar-bottom-nav">
          {collapsed ? (
            <>
              {/* Theme toggle button (collapsed) */}
              <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} placement="right">
                <Button 
                  type="text" 
                  icon={darkMode ? <IconSun size={20} /> : <IconMoon size={20} />} 
                  onClick={toggleTheme} 
                />
              </Tooltip>
              <Tooltip title="Settings" placement="right">
                <Button type="text" icon={<IconSettings size={20} />} onClick={() => onSelect({ key: 'settings' })} />
              </Tooltip>
              <Tooltip title="Account" placement="right">
                <Button type="text" icon={<IconUsers size={20} />} onClick={() => {}} />
              </Tooltip>
            </>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* Theme toggle button (expanded) */}
              <Button 
                type="text" 
                icon={darkMode ? <IconSun size={20} /> : <IconMoon size={20} />} 
                onClick={toggleTheme}
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
              <Button type="text" icon={<IconSettings size={20} />} onClick={() => onSelect({ key: 'settings' })}>
                Settings
              </Button>
              <Button type="text" icon={<IconUsers size={20} />} onClick={() => {}}>
                Account
              </Button>
            </Space>
          )}
        </div>
      </Sider>

      <AddCreditCardModal open={isAddModalVisible} onClose={handleAddModalClose} onSubmit={createCreditCard} />
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