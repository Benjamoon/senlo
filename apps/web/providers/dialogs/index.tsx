"use client";

import React, { lazy, Suspense } from "react";
import { useDialogStore, DialogType, DialogPropsMap } from "./store";

type DialogComponentProps<T extends DialogType> = DialogPropsMap[T] & {
  isOpen: boolean;
  onClose: () => void;
};

const EditTriggerConfigDialog = lazy(
  () => import("../../app/(app)/triggers/[id]/edit-trigger-dialog"),
);
const DeleteTriggerDialog = lazy(
  () => import("../../app/(app)/triggers/delete-trigger-dialog"),
);
const CreateProjectDialog = lazy(
  () => import("../../app/(app)/projects/create-project-dialog"),
);
const EditProjectDialog = lazy(
  () => import("../../app/(app)/projects/[id]/edit-project-dialog"),
);
const DeleteProjectDialog = lazy(
  () => import("../../app/(app)/projects/delete-project-dialog"),
);
const CreateTemplateDialog = lazy(
  () => import("../../app/(app)/projects/[id]/create-template-dialog"),
);
const DeleteTemplateDialog = lazy(
  () => import("../../app/(app)/projects/[id]/delete-template-dialog"),
);
const AddProviderDialog = lazy(
  () => import("../../app/(app)/providers/add-provider-dialog"),
);
const EditProviderDialog = lazy(
  () => import("../../app/(app)/providers/edit-provider-dialog"),
);
const DeleteProviderDialog = lazy(
  () => import("../../app/(app)/providers/delete-provider-dialog"),
);
const AddAiProviderDialog = lazy(
  () => import("../../app/(app)/providers/add-ai-provider-dialog"),
);
const DeleteAiProviderDialog = lazy(
  () => import("../../app/(app)/providers/delete-ai-provider-dialog"),
);

const dialogComponents: {
  [K in DialogType]: React.ComponentType<DialogComponentProps<K>>;
} = {
  EDIT_TRIGGER_CONFIG: EditTriggerConfigDialog,
  DELETE_TRIGGER: DeleteTriggerDialog,
  CREATE_PROJECT: CreateProjectDialog,
  EDIT_PROJECT: EditProjectDialog,
  DELETE_PROJECT: DeleteProjectDialog,
  CREATE_TEMPLATE: CreateTemplateDialog,
  DELETE_TEMPLATE: DeleteTemplateDialog,
  ADD_PROVIDER: AddProviderDialog,
  EDIT_PROVIDER: EditProviderDialog,
  DELETE_PROVIDER: DeleteProviderDialog,
  ADD_AI_PROVIDER: AddAiProviderDialog,
  DELETE_AI_PROVIDER: DeleteAiProviderDialog,
};

export function DialogProvider() {
  const { type, props, isOpen, close } = useDialogStore();

  if (!isOpen || !type || !props) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = dialogComponents[type as DialogType] as any;

  return (
    <Suspense fallback={null}>
      <Component {...props} isOpen={isOpen} onClose={close} />
    </Suspense>
  );
}
