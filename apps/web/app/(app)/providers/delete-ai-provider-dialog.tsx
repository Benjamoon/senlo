"use client";

import { Button, Dialog } from "@senlo/ui";
import { useDeleteAiProvider } from "apps/web/queries/ai-providers";

interface DeleteAiProviderDialogProps {
  providerId: number;
  name: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAiProviderDialog({
  providerId,
  name,
  isOpen,
  onClose,
}: DeleteAiProviderDialogProps) {
  const { mutate: deleteAiProvider, isPending: isDeleting } =
    useDeleteAiProvider();

  const confirmDelete = () => {
    deleteAiProvider(providerId, {
      onSuccess: () => {
        onClose();
      },
      onError: () => {
        alert("Failed to delete AI provider. Please try again.");
      },
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      disableAnimation={true}
      title="Delete AI Provider"
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
            {isDeleting ? "Deleting..." : "Delete AI Provider"}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-zinc-500">
        This will permanently remove the AI provider configuration.
      </p>
    </Dialog>
  );
}
