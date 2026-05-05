"use client";

import { PageHeader, EmptyState, Button } from "@senlo/ui";
import { Send, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TriggerCard } from "apps/web/app/(app)/triggers/trigger-card";
import { useProject } from "apps/web/queries/projects";
import { useProjectCampaigns } from "apps/web/queries/campaigns";

export default function ProjectCampaignsPage() {
  const params = useParams();
  const projectId = Number(params.id);

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useProject(projectId);

  const { data: campaigns = [], isLoading: campaignsLoading } =
    useProjectCampaigns(projectId);

  if (projectLoading || campaignsLoading) {
    return (
      <main className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  if (projectError || !project) {
    return (
      <main className="max-w-6xl mx-auto py-10 px-4">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              !
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Project not found
            </h1>
            <p className="text-gray-600">
              {projectError?.message ||
                "The project you are looking for does not exist."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-zinc-500 hover:text-zinc-800 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to {project.name}
        </Link>
      </div>

      <PageHeader
        title={`Triggers: ${project.name}`}
        description="Manage email triggers specific to this project."
        actions={
          <Link href={`/triggers/new?projectId=${projectId}`}>
            <Button>
              <Plus size={16} />
              New Trigger
            </Button>
          </Link>
        }
      />

      {campaigns.length === 0 ? (
        <EmptyState
          icon={<Send size={40} />}
          title="No triggers in this project"
          description="Create your first email trigger to start sending emails via API."
          action={
            <Link href={`/triggers/new?projectId=${projectId}`}>
              <Button>
                <Plus size={16} />
                New Trigger
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <TriggerCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </main>
  );
}
