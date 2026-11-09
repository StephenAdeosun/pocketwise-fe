import styles from "@/app/dashboard/page.module.css";

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className={`${styles.modal} ${styles.confirmModal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>Please confirm</p>
            <h2 id="confirm-dialog-title">{title}</h2>
          </div>
          <button
            className={styles.closeButton}
            type="button"
            onClick={onClose}
            aria-label="Close confirmation"
          >
            ×
          </button>
        </div>
        <p className={styles.confirmMessage}>{message}</p>
        <div className={styles.formActions}>
          <button className={styles.cancelButton} type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.dangerButton}
            type="button"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </section>
    </div>
  );
}
