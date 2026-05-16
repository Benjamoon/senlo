import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmailProvider } from "@senlo/core";
import {
  listProviders,
  createProviderAction,
  deleteProviderAction,
  toggleProviderAction,
  updateProviderAction,
  type CreateProviderError,
} from "../app/(app)/providers/actions";
import { queryKeys } from "../providers";
import { logger } from "../lib/logger";

/**
 * Query function for fetching all email providers
 */
async function fetchProviders(): Promise<EmailProvider[]> {
  const result = await listProviders();

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

/**
 * Hook for fetching all email providers
 */
export function useProviders() {
  return useQuery({
    queryKey: queryKeys.emailProviders.list(),
    queryFn: fetchProviders,
  });
}

/**
 * Hook for creating a new email provider
 */
export function useCreateProvider() {
  const queryClient = useQueryClient();

  return useMutation<EmailProvider, CreateProviderError, FormData>({
    mutationFn: async (formData: FormData) => {
      const result = await createProviderAction(formData);
      if ("error" in result) {
        throw result;
      }
      return result.data;
    },
    onError: (err) => {
      logger.error("Failed to create provider", {
        error: err instanceof Error ? err.message : String(err),
      });
    },
    onSuccess: (provider) => {
      logger.info("Provider created successfully", { providerId: provider.id });
    },
    onSettled: () => {
      // Invalidate providers list to refresh UI
      queryClient.invalidateQueries({
        queryKey: queryKeys.emailProviders.lists(),
      });
    },
  });
}

/**
 * Hook for updating an existing email provider
 */
export function useUpdateProvider() {
  const queryClient = useQueryClient();

  return useMutation<
    EmailProvider,
    CreateProviderError,
    { id: number; formData: FormData }
  >({
    mutationFn: async ({ id, formData }) => {
      const result = await updateProviderAction(id, formData);
      if ("error" in result) {
        throw result;
      }
      return result.data;
    },
    onError: (err, { id }) => {
      logger.error("Failed to update provider", {
        providerId: id,
        error: err instanceof Error ? err.message : String(err),
      });
    },
    onSuccess: (provider) => {
      logger.info("Provider updated successfully", { providerId: provider.id });
    },
    onSettled: () => {
      // Invalidate providers list to refresh UI
      queryClient.invalidateQueries({
        queryKey: queryKeys.emailProviders.lists(),
      });
    },
  });
}

/**
 * Hook for deleting an email provider
 */
export function useDeleteProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (providerId: number) => {
      const result = await deleteProviderAction(providerId);
      if (!result.success) {
        throw result;
      }
      return providerId;
    },
    onError: (err, providerId) => {
      logger.error("Failed to delete provider", {
        providerId,
        error: err instanceof Error ? err.message : String(err),
      });
    },
    onSuccess: (providerId) => {
      // Remove from individual provider cache
      queryClient.removeQueries({
        queryKey: queryKeys.emailProviders.detail(providerId),
      });

      logger.info("Provider deleted successfully", { providerId });
    },
    onSettled: () => {
      // Invalidate providers list to refresh UI
      queryClient.invalidateQueries({
        queryKey: queryKeys.emailProviders.lists(),
      });
    },
  });
}

/**
 * Hook for toggling email provider active status
 */
export function useToggleProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      providerId,
      isActive,
    }: {
      providerId: number;
      isActive: boolean;
    }) => {
      const result = await toggleProviderAction(providerId, isActive);
      if (!result.success) {
        throw result;
      }
      return result.data;
    },
    onError: (err, { providerId }) => {
      logger.error("Failed to toggle provider status", {
        providerId,
        error: err instanceof Error ? err.message : String(err),
      });
    },
    onSuccess: (provider, { providerId }) => {
      // Update the specific provider in cache
      queryClient.setQueryData(
        queryKeys.emailProviders.detail(providerId),
        provider,
      );

      // Update provider in the list cache
      queryClient.setQueryData<EmailProvider[]>(
        queryKeys.emailProviders.list(),
        (old) =>
          old ? old.map((p) => (p.id === providerId ? provider : p)) : [],
      );

      logger.info("Provider status toggled successfully", {
        providerId,
        isActive: provider.isActive,
      });
    },
    onSettled: () => {
      // Invalidate providers list to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.emailProviders.lists(),
      });
    },
  });
}
