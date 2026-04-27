"use client";

import { Button } from "@senlo/ui";
import { TriggerCard } from "apps/web/app/(app)/triggers/trigger-card";
import { useCampaigns } from "../queries/campaigns";

interface TriggersListProps {
  showFilters?: boolean;
}

export function TriggersList({
  showFilters = true,
}: TriggersListProps) {
  const {
    data: campaigns = [],
    isLoading,
    error,
    refetch,
  } = useCampaigns();

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-500">Loading emails...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">Error loading emails</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {campaigns.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          No emails found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <TriggerCard
              key={campaign.id}
              campaign={campaign}
            />
          ))}
        </div>
      )}
    </div>
  );
}
