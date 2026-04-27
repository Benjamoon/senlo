"use client";

import { useState } from "react";
import {
  Card,
  Badge,
  Button,
  Dialog,
  FormField,
  Input,
  Textarea,
  JsonEditor,
} from "@senlo/ui";
import {
  Info,
  User,
  Mail,
  FileText,
  ArrowRight,
  Settings2,
  Pencil,
  Save,
  X,
  FolderOpen,
  LayoutTemplate,
} from "lucide-react";
import Link from "next/link";
import { Campaign, Project, EmailTemplate } from "@senlo/core";
import { updateCampaignAction } from "../actions";
import { logger } from "apps/web/lib/logger";

interface TriggerConfigurationCardProps {
  campaign: Campaign;
  project: Project;
  template: EmailTemplate;
}

export function TriggerConfigurationCard({
  campaign,
  project,
  template,
}: TriggerConfigurationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description || "",
    fromName: campaign.fromName || "",
    fromEmail: campaign.fromEmail || "",
    subject: campaign.subject || "",
    variablesSchema: JSON.stringify(campaign.variablesSchema || {}, null, 2),
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        data.append(key, value)
      );
      const result = await updateCampaignAction(campaign.id, data);
      if ('success' in result && result.success) {
        setIsEditing(false);
      } else if ('error' in result && result.error) {
        // Handle Zod validation errors
        const fieldErrors = result.error.fieldErrors;
        let errorMessage = 'Validation failed';

        if (fieldErrors) {
          if ('name' in fieldErrors && fieldErrors.name?.[0]) {
            errorMessage = fieldErrors.name[0];
          } else if ('fromEmail' in fieldErrors && fieldErrors.fromEmail?.[0]) {
            errorMessage = fieldErrors.fromEmail[0];
          } else if ('general' in fieldErrors && fieldErrors.general?.[0]) {
            errorMessage = fieldErrors.general[0];
          }
        }

        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      logger.error("Failed to update campaign from info card", {
        campaignId: campaign.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings2 size={20} strokeWidth={2.5} className="text-zinc-400" />
            Configuration
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 text-zinc-400 hover:text-blue-600"
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={18} />
          </Button>
        </div>

        <div className="space-y-7">
          {/* Project Section */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Project
            </h4>
            <div className="flex items-center gap-3 px-3 py-2.5 bg-zinc-50/50 border border-zinc-100 rounded-xl group hover:border-zinc-200 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-blue-600 transition-colors">
                <FolderOpen size={16} />
              </div>
              <span className="text-sm font-medium text-zinc-700">{project.name}</span>
            </div>
          </div>

          {/* Sender Section */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Sender details
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-3">
                <div className="w-5 h-5 flex items-center justify-center text-zinc-400">
                  <User size={14} />
                </div>
                <span className="text-sm text-zinc-600">{campaign.fromName || "Default Sender"}</span>
              </div>
              <div className="flex items-center gap-3 px-3">
                <div className="w-5 h-5 flex items-center justify-center text-zinc-400">
                  <Mail size={14} />
                </div>
                <span className="text-sm text-zinc-600 font-mono">{campaign.fromEmail || "hello@senlo.io"}</span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Content & Template
            </h4>
            <div className="space-y-3">
              <div className="px-4 py-3 bg-blue-50/30 border border-blue-100/50 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-blue-600/60 mb-1.5 tracking-tight">Email Subject</div>
                <div className="text-sm font-medium text-zinc-900 leading-snug">
                  {campaign.subject || template.subject}
                </div>
              </div>

              <Link
                href={`/editor/${template.id}?campaignId=${campaign.id}`}
                className="flex items-center justify-between p-4 border border-zinc-200 bg-white rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-600 transition-all">
                    <LayoutTemplate size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400 mb-0.5">Active Template</div>
                    <div className="text-sm font-semibold text-zinc-900">{template.name}</div>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all"
                />
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <Dialog
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Configuration"
        className="max-w-2xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
              <Save size={16} className="ml-2" />
            </Button>
          </div>
        }
      >
        <div className="space-y-5 py-2">
          <FormField label="Internal Name" required>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="From Name">
              <Input
                value={formData.fromName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fromName: e.target.value }))
                }
                placeholder="e.g. Igor from Senlo"
              />
            </FormField>
            <FormField label="From Email">
              <Input
                value={formData.fromEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fromEmail: e.target.value,
                  }))
                }
                placeholder="e.g. hello@senlo.io"
              />
            </FormField>
          </div>

          <FormField label="Email Subject">
            <Input
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="Leave empty to use template subject"
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={2}
            />
          </FormField>

          {campaign.type === "TRIGGERED" && (
            <FormField
              label="Sample JSON Data (Variables)"
              hint="Defines variables available in the editor"
            >
              <JsonEditor
                value={formData.variablesSchema}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, variablesSchema: val }))
                }
                height="180px"
              />
            </FormField>
          )}
        </div>
      </Dialog>
    </>
  );
}
