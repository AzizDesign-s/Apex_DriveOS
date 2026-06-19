// src/components/roles/RoleDeleteConfirm.jsx

import { AlertTriangle, Lock } from "lucide-react";
import { Modal, Button } from "../ui";

function RoleDeleteConfirm({
  isOpen,
  onClose,
  onConfirm,
  role,
  assignedUserCount = 0,
}) {
  if (!role) return null;
  const blocked = role.isSystemRole;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={blocked ? "System Role" : "Delete this role?"}
      subtitle={
        blocked
          ? `"${role.name}" is a default system role and cannot be deleted.`
          : `Permanently remove "${role.name}". This action cannot be undone.`
      }
    >
      {blocked ? (
        <>
          <div className="flex items-start gap-2 bg-text-subtle/[0.06] border border-border rounded-xl p-3 mb-4">
            <Lock size={14} className="text-text-subtle flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-text-subtle leading-relaxed">
              System roles are required for the platform to function correctly.
              You can still edit its permissions, just not remove it entirely.
            </p>
          </div>
          <Button variant="ghost" onClick={onClose} fullWidth>
            Got it
          </Button>
        </>
      ) : (
        <>
          {assignedUserCount > 0 && (
            <div className="flex items-start gap-2 bg-rose-400/8 border border-rose-400/20 rounded-xl p-3 mb-4">
              <AlertTriangle
                size={14}
                className="text-rose-400 flex-shrink-0 mt-0.5"
              />
              <p className="text-[11px] text-rose-400/80 leading-relaxed">
                {assignedUserCount} user
                {assignedUserCount > 1 ? "s are" : " is"} currently assigned
                this role. They will lose their permissions until reassigned.
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm} fullWidth>
              Yes, Delete
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default RoleDeleteConfirm;
