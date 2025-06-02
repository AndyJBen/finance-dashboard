import React from 'react';
import { Modal, Button, Typography } from 'antd';
import './styles/ConfirmApplyModal.css';

const { Text } = Typography;

const ConfirmApplyModal = ({ open, onJustThis, onAllFuture, onCancel }) => (
  <Modal
    open={open}
    onCancel={onCancel}
    footer={null}
    centered
    width={420}
    className="confirm-apply-modal"
  >
    <div className="confirm-content">
      <Text className="confirm-question">
        Do you want to apply the changes to just this bill, or to this bill and all future bills?
      </Text>
    </div>
    <div className="confirm-footer">
      <Button onClick={onCancel} className="cancel-button">Cancel</Button>
      <Button onClick={onJustThis} className="single-button">Just This Bill</Button>
      <Button type="primary" onClick={onAllFuture} className="all-button">All Future Bills</Button>
    </div>
  </Modal>
);

export default ConfirmApplyModal;
