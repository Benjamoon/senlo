"use client";

import { Button, Dialog } from "@senlo/ui";
import { useDeleteProvider } from "apps/web/queries/providers";

interface DeleteProviderDialogProps {
  providerId: number;
  name: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteProviderDialog({
  providerId,
  name,
  isOpen,
  onClose,
}: DeleteProviderDialogProps) {
  const { mutate: deleteProvider, isPending: isDeleting } = useDeleteProvider();

  const confirmDelete = () => {
    deleteProvider(providerId, {
      onSuccess: () => {
        onClose();
      },
      onError: () => {
        alert("Failed to delete provider. Please try again.");
      },
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      disableAnimation={true}
      title="Delete Email Provider"
      description={`Are you sure you want to delete "${name}"? This action cannot be undone.`}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Provider"}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-zinc-500">
        This will permanently remove the provider configuration.
      </p>
    </Dialog>
  );
}
