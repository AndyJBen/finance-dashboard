import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, Row, Col } from 'antd';
import { IconTrash } from '@tabler/icons-react';
import './styles/DeleteBillModal.css';

const { Title, Text } = Typography;

const DeleteBillModal = ({
  open,
  onCancel,
  onDeleteCurrent,
  onDeleteFuture,
  bill = {}
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formattedAmount = typeof bill.amount === 'number'
    ? bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={isMobile ? '92%' : 420}
      style={{ top: 20, margin: '0 auto', padding: 0 }}
      bodyStyle={{ padding: 0, borderRadius: '20px', overflow: 'hidden' }}
      maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      className="delete-bill-modal modern-overlay"
    >
      <div className="modal-header">
        <Row align="middle" gutter={12}>
          <Col>
            <div className="modal-icon-container">
              <IconTrash size={22} />
            </div>
          </Col>
          <Col>
            <Title level={4} className="modal-title">Delete Bill</Title>
          </Col>
        </Row>
      </div>

      <div className="delete-content">
        <Text className="delete-question">Are you sure you want to delete:</Text>
        <div className="bill-info">
          <Text strong>{bill.name || 'Unnamed Bill'}</Text>
          <Text className="bill-amount">${formattedAmount}</Text>
        </div>
      </div>

      <div className="modal-footer">
        <Button onClick={onCancel} className="cancel-button">Cancel</Button>
        <Button danger onClick={() => onDeleteCurrent(bill)} className="delete-single-button">
          This Bill
        </Button>
        <Button danger type="primary" onClick={() => onDeleteFuture(bill)} className="delete-all-button">
          All Future
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteBillModal;
