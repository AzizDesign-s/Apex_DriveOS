// src/components/ui/DeleteConfirm.jsx
import { useState, useEffect } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

function DeleteConfirm({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete this item?",
  description,
  itemName,
  confirmText, // if provided → user must type this string to enable delete button
}) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    if (isOpen) setTyped("");
  }, [isOpen]);

  // If confirmText is provided, user must type it exactly.
  // If not provided (bulk delete), button is always enabled.
  const requiresTyping = !!confirmText;
  const canConfirm = !requiresTyping || typed.trim() === confirmText;

  const displayDescription =
    description ||
    (itemName ? `Permanently remove "${itemName}" from inventory.` : undefined);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={displayDescription}
    >
      {/* Warning banner */}
      <div
        className="flex items-start gap-2 bg-amber-400/8 border border-amber-400/15
                      rounded-xl p-3 mb-4"
      >
        <AlertTriangle
          size={14}
          className="text-amber-400 flex-shrink-0 mt-0.5"
        />
        <p className="text-[11px] text-amber-400/80 leading-relaxed">
          This action cannot be undone.
        </p>
      </div>

      {/* Type-to-confirm — only shown for single car delete */}
      {requiresTyping && (
        <div className="mb-4">
          <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase mb-2">
            Type <span className="text-gold">{confirmText}</span> to confirm
          </p>
          <input
            className="input-luxury text-xs w-full"
            placeholder={confirmText}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            if (canConfirm) {
              onConfirm();
              onClose();
            }
          }}
          disabled={!canConfirm}
          icon={Trash2}
          fullWidth
        >
          {requiresTyping ? "Delete" : "Yes, Delete"}
        </Button>
      </div>
    </Modal>
  );
}

export default DeleteConfirm;
