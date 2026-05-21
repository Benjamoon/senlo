"use client";

import { Card, Badge } from "@senlo/ui";
import { Project } from "@senlo/core";
import Link from "next/link";
import { Folder, Calendar, Trash2 } from "lucide-react";
import { useDialogStore } from "apps/web/providers/dialogs/store";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const openDialog = useDialogStore((state) => state.open);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openDialog("DELETE_PROJECT", { project });
  };

  return (
    <Link href={`/projects/${project.id}`} className="group relative">
      <Card className="h-full p-5 transition-shadow hover:shadow-md border-zinc-200 group-hover:border-zinc-300">
        <div className="flex flex-col h-full gap-4">
          <div className="flex items-start justify-between">
            <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-zinc-200 transition-colors">
              <Folder size={20} className="text-zinc-600" />
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="flex items-center gap-1 font-normal text-zinc-500 border-zinc-200"
              >
                <Calendar size={12} />
                {project.createdAt instanceof Date
                  ? project.createdAt.toLocaleDateString("en-GB")
                  : String(project.createdAt)}
              </Badge>
              <button
                onClick={handleDelete}
                className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete project"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-zinc-500 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
