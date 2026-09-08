import React from 'react';
import Modal from './Modal';
import Button from './Button';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  isLoading = false,
  maxWidth = 'max-w-md',
}) => {
  const footerContent = (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClose}
        disabled={isLoading}
        className="shrink-0"
      >
        {cancelLabel}
      </Button>
      <Button
        type="button"
        variant={confirmVariant}
        size="sm"
        onClick={onConfirm}
        isLoading={isLoading}
        disabled={isLoading}
        className="shrink-0"
      >
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
      footer={footerContent}
    >
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        {message}
      </p>
    </Modal>
  );
};

export default ConfirmModal;
