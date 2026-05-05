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
  User,
  Mail,
  ArrowRight,
  Settings2,
  Pencil,
  Save,
  X,
  FolderOpen,
  Languages,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Campaign, Project, EmailTemplate } from "@senlo/core";
import { updateCampaignAction } from "../actions";
import { logger } from "apps/web/lib/logger";
import { useTemplates } from "apps/web/hooks/use-templates";

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
  const { templates } = useTemplates({
    filters: { projectId: project.id },
    enabled: isEditing,
  });

  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description || "",
    fromName: campaign.fromName || "",
    fromEmail: campaign.fromEmail || "",
    subject: campaign.subject || "",
    variablesSchema: JSON.stringify(campaign.variablesSchema || {}, null, 2),
    localeTemplates: campaign.localeTemplates || {},
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "localeTemplates") {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value as string);
        }
      });
      const result = await updateCampaignAction(campaign.id, data);
      if ("success" in result && result.success) {
        setIsEditing(false);
      } else if ("error" in result && result.error) {
        // Handle Zod validation errors
        const fieldErrors = result.error.fieldErrors;
        let errorMessage = "Validation failed";

        if (fieldErrors) {
          if ("name" in fieldErrors && fieldErrors.name?.[0]) {
            errorMessage = fieldErrors.name[0];
          } else if ("fromEmail" in fieldErrors && fieldErrors.fromEmail?.[0]) {
            errorMessage = fieldErrors.fromEmail[0];
          } else if ("general" in fieldErrors && fieldErrors.general?.[0]) {
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
              <span className="text-sm font-medium text-zinc-700">
                {project.name}
              </span>
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
                <span className="text-sm text-zinc-600">
                  {campaign.fromName || "Default Sender"}
                </span>
              </div>
              <div className="flex items-center gap-3 px-3">
                <div className="w-5 h-5 flex items-center justify-center text-zinc-400">
                  <Mail size={14} />
                </div>
                <span className="text-sm text-zinc-600 font-mono">
                  {campaign.fromEmail || "hello@senlo.io"}
                </span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Content & Templates
            </h4>
            <div className="space-y-2">
              <div className="px-4 py-3 bg-blue-50/30 border border-blue-100/50 rounded-xl mb-2">
                <div className="text-[10px] font-bold uppercase text-blue-600/60 mb-1.5 tracking-tight">
                  Email Subject
                </div>
                <div className="text-sm font-medium text-zinc-900 leading-snug">
                  {campaign.subject || template.subject}
                </div>
              </div>

              {/* Default Template */}
              <Link
                href={`/editor/${template.id}?campaignId=${campaign.id}`}
                className="flex items-center justify-between px-3 py-2 bg-zinc-50/50 border border-zinc-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="bg-white text-[10px] font-bold uppercase tracking-wider text-blue-600 border-blue-100"
                  >
                    {template.locale}
                  </Badge>
                  <span className="text-sm font-medium text-zinc-700 group-hover:text-blue-700">
                    {template.name}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] uppercase tracking-tighter h-4 px-1 text-zinc-400 border-zinc-100"
                  >
                    Default
                  </Badge>
                </div>
                <ArrowRight
                  size={14}
                  className="text-zinc-300 group-hover:text-blue-400 transition-colors"
                />
              </Link>

              {/* Localization Variants */}
              {campaign.localeTemplates &&
                Object.entries(campaign.localeTemplates).map(
                  ([locale, templateId]) => (
                    <Link
                      key={locale}
                      href={`/editor/${templateId}?campaignId=${campaign.id}`}
                      className="flex items-center justify-between px-3 py-2 bg-zinc-50/50 border border-zinc-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="bg-white text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-blue-600 group-hover:border-blue-100"
                        >
                          {locale}
                        </Badge>
                        <span className="text-sm text-zinc-600 group-hover:text-blue-700">
                          Template ID: {templateId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Languages
                          size={14}
                          className="text-zinc-300 group-hover:text-blue-300"
                        />
                        <ArrowRight
                          size={14}
                          className="text-zinc-200 group-hover:text-blue-400 transition-colors"
                        />
                      </div>
                    </Link>
                  ),
                )}
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
            <>
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

              <div className="pt-4 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">
                      Language Variants
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Map specific templates to languages
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      const locale = prompt(
                        "Enter locale code (e.g. ru, es, de):",
                      );
                      if (locale) {
                        setFormData((prev) => ({
                          ...prev,
                          localeTemplates: {
                            ...prev.localeTemplates,
                            [locale.toLowerCase()]: campaign.templateId,
                          },
                        }));
                      }
                    }}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Locale
                  </Button>
                </div>

                <div className="space-y-3">
                  {Object.entries(formData.localeTemplates).map(
                    ([locale, templateId]) => (
                      <div
                        key={locale}
                        className="grid grid-cols-12 gap-3 items-end"
                      >
                        <div className="col-span-3">
                          <label className="text-[10px] font-bold uppercase text-zinc-400 mb-1 block">
                            Locale
                          </label>
                          <div className="px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-md text-sm font-bold uppercase">
                            {locale}
                          </div>
                        </div>
                        <div className="col-span-7">
                          <label className="text-[10px] font-bold uppercase text-zinc-400 mb-1 block">
                            Template
                          </label>
                          <select
                            className="w-full h-9 px-3 rounded-md border border-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={templateId}
                            onChange={(e) => {
                              const newId = parseInt(e.target.value);
                              setFormData((prev) => ({
                                ...prev,
                                localeTemplates: {
                                  ...prev.localeTemplates,
                                  [locale]: newId,
                                },
                              }));
                            }}
                          >
                            {templates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name} ({t.locale})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            className="text-zinc-400 hover:text-red-600 h-9 w-full"
                            onClick={() => {
                              const newLocales = {
                                ...formData.localeTemplates,
                              };
                              delete newLocales[locale];
                              setFormData((prev) => ({
                                ...prev,
                                localeTemplates: newLocales,
                              }));
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ),
                  )}
                  {Object.keys(formData.localeTemplates).length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-zinc-100 rounded-xl text-zinc-400 text-xs">
                      No language variants added yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}
