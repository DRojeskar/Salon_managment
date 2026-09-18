function ConfirmDialog({ open, title, message, confirmLabel = "Delete", cancelLabel = "Cancel", onConfirm, onCancel, danger = true }) {
  if (!open) return null;

  return (
    <div className="confirm-overlay" role="presentation" onClick={onCancel}>
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" onClick={(event) => event.stopPropagation()}>
        <p className="eyebrow">Confirm action</p>
        <h4 id="confirm-dialog-title">{title}</h4>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="ghost-btn" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className={danger ? "form-button compact confirm-danger-btn" : "form-button compact"} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
