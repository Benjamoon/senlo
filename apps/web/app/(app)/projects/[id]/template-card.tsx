"use client";

import { useState } from "react";
import { Card, Badge, Dialog, Button } from "@senlo/ui";
import { EmailTemplate } from "@senlo/core";
import Link from "next/link";
import { FileText, Calendar, ArrowRight, Trash2 } from "lucide-react";
import { logger } from "apps/web/lib/logger";
import { useDeleteTemplate } from "apps/web/queries/templates";

interface TemplateCardProps {
  template: EmailTemplate;
  projectId: number;
}

export function TemplateCard({ template, projectId }: TemplateCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Use React Query mutation for deleting templates
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplate();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    deleteTemplate(
      { projectId: projectId.toString(), templateId: template.id },
      {
        onSuccess: () => {
          setIsDeleteOpen(false);
        },
        onError: (error) => {
          logger.error("Failed to delete template from card", {
            templateId: template.id,
            projectId: template.projectId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    );
  };

  return (
    <>
      <Link href={`/editor/${template.id}`} className="group relative">
        <Card className="h-full p-5 transition-shadow hover:shadow-md border-zinc-200 group-hover:border-zinc-300">
          <div className="flex flex-col h-full gap-4">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-zinc-200"
                >
                  {template.locale}
                </Badge>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 font-normal text-zinc-500 border-zinc-200"
                >
                  <Calendar size={12} />
                  {template.createdAt instanceof Date
                    ? template.createdAt.toLocaleDateString("en-GB")
                    : String(template.createdAt)}
                </Badge>
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete template"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
                {template.name}
              </h3>
              <p className="text-sm text-zinc-500 line-clamp-2">
                {template.subject}
              </p>
            </div>

            <div className="mt-auto pt-4 flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Open in editor
              <ArrowRight size={14} className="ml-1" />
            </div>
          </div>
        </Card>
      </Link>

      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Template"
        description={`Are you sure you want to delete "${template.name}"? This action cannot be undone.`}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Template"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-zinc-500">
          The template will be permanently removed from this project.
        </p>
      </Dialog>
    </>
  );
}
