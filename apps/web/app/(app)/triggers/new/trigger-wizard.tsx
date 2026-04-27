"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  FormField,
  Input,
  Textarea,
  JsonEditor,
  PageHeader,
} from "@senlo/ui";
import { Project } from "@senlo/core";
import { useRouter } from "next/navigation";
import { useTemplates } from "apps/web/hooks/use-templates";
import { createCampaignAction } from "../actions";
import { logger } from "apps/web/lib/logger";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Settings,
  Layout,
  Users,
  Send,
  List as ListIcon,
  Zap,
} from "lucide-react";

interface CampaignWizardProps {
  projects: Project[];
}

type Step = "setup" | "content" | "audience" | "review";

export function TriggerWizard({ projects }: TriggerWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("setup");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    projectId: "",
    templateId: "",
    fromName: "",
    fromEmail: "",
    subject: "",
    type: "TRIGGERED" as "TRIGGERED",
    variablesSchema: "",
  });

  const projectId = formData.projectId ? Number(formData.projectId) : undefined;
  const { templates, loading: isLoadingTemplates } = useTemplates({
    filters: { projectId: projectId! },
    enabled: !!projectId,
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === "setup") setStep("content");
    else if (step === "content") setStep("review");
  };

  const handleBack = () => {
    if (step === "content") setStep("setup");
    else if (step === "review") setStep("content");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        data.append(key, value)
      );

      const result = await createCampaignAction(data);
      if ("success" in result && result.success) {
        router.push(`/triggers/${result.data.id}`);
      } else if ("error" in result && result.error) {
        const fieldErrors = result.error.fieldErrors;
        let errorMessage = "Validation failed";

        if (fieldErrors) {
          if ("name" in fieldErrors && fieldErrors.name?.[0]) {
            errorMessage = fieldErrors.name[0];
          } else if ("projectId" in fieldErrors && fieldErrors.projectId?.[0]) {
            errorMessage = fieldErrors.projectId[0];
          } else if (
            "templateId" in fieldErrors &&
            fieldErrors.templateId?.[0]
          ) {
            errorMessage = fieldErrors.templateId[0];
          } else if ("general" in fieldErrors && fieldErrors.general?.[0]) {
            errorMessage = fieldErrors.general[0];
          }
        }

        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      logger.error("Failed to create campaign from wizard", {
        projectId: formData.projectId ? Number(formData.projectId) : undefined,
        templateId: formData.templateId
          ? Number(formData.templateId)
          : undefined,
        listId: formData.listId ? Number(formData.listId) : undefined,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: "setup", label: "Setup", icon: <Settings size={18} /> },
    { id: "content", label: "Content", icon: <Layout size={18} /> },
    { id: "review", label: "Review", icon: <Send size={18} /> },
  ];

  const currentProject = projects.find(
    (p) => p.id === Number(formData.projectId)
  );
  const currentTemplate = templates.find(
    (t) => t.id === Number(formData.templateId)
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-8">
      <PageHeader
        title="Create New Email"
        description="Configure your transactional email trigger."
      />

      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-100 -translate-y-1/2 -z-10" />
        {steps.map((s, idx) => {
          const isActive = step === s.id;
          const isCompleted = steps.findIndex((st) => st.id === step) > idx;

          return (
            <div
              key={s.id}
              className="flex flex-col items-center gap-2 bg-white px-4"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isActive
                    ? "border-blue-600 bg-blue-50 text-blue-600 shadow-md"
                    : isCompleted
                    ? "border-green-500 bg-green-50 text-green-500"
                    : "border-zinc-200 bg-white text-zinc-400"
                }`}
              >
                {isCompleted ? <Check size={20} /> : s.icon}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-blue-600" : "text-zinc-500"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <Card className="p-8">
        {step === "setup" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Trigger Name"
                required
                hint="Internal name for your email trigger"
              >
                <Input
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Welcome Email"
                />
              </FormField>
              <FormField
                label="Target Project"
                required
                hint="Which project does this belong to?"
              >
                <select
                  className="w-full h-9 px-3 rounded-md border border-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.projectId}
                  onChange={(e) => updateField("projectId", e.target.value)}
                >
                  <option value="">Select a project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField
              label="Sample JSON Data"
              hint="Provide a sample JSON object to define variables for the editor"
            >
              <JsonEditor
                value={formData.variablesSchema}
                onChange={(val) => updateField("variablesSchema", val)}
                height="160px"
              />
            </FormField>

            <FormField label="Description (optional)">
              <Textarea
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="e.g. Sent when a new user signs up..."
                rows={3}
              />
            </FormField>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="From Name"
                hint="How you'll appear in the inbox"
              >
                <Input
                  value={formData.fromName}
                  onChange={(e) => updateField("fromName", e.target.value)}
                  placeholder="e.g. Igor from Senlo"
                />
              </FormField>
              <FormField
                label="From Email"
                hint="The email address to send from"
              >
                <Input
                  value={formData.fromEmail}
                  onChange={(e) => updateField("fromEmail", e.target.value)}
                  placeholder="e.g. hello@senlo.io"
                />
              </FormField>
            </div>
          </div>
        )}

        {step === "content" && (
          <div className="space-y-6">
            <FormField
              label="Email Subject"
              required
              hint="What recipients will see in their inbox"
            >
              <Input
                value={formData.subject}
                onChange={(e) => updateField("subject", e.target.value)}
                placeholder="Don't miss our winter sale!"
              />
            </FormField>

            <FormField
              label="Select Template"
              required
              hint="Choose the design for this campaign"
            >
              {!formData.projectId ? (
                <div className="p-4 bg-amber-50 text-amber-700 text-sm rounded-md border border-amber-100">
                  Please select a project in the previous step first.
                </div>
              ) : isLoadingTemplates ? (
                <div className="py-8 text-center text-zinc-500">
                  Loading templates...
                </div>
              ) : templates.length === 0 ? (
                <div className="py-8 text-center text-zinc-500">
                  No templates found in this project.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => updateField("templateId", String(t.id))}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        formData.templateId === String(t.id)
                          ? "border-blue-600 bg-blue-50 shadow-sm"
                          : "border-zinc-200 hover:border-zinc-300 bg-white"
                      }`}
                    >
                      <h4 className="font-medium text-sm">{t.name}</h4>
                      <p className="text-xs text-zinc-500 mt-1 truncate">
                        {t.subject}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </FormField>
          </div>
        )}

        {step === "audience" && (
          <div className="space-y-6">
            <FormField
              label="Select Recipient List"
              required
              hint="Choose which list of contacts will receive this campaign"
            >
              {!formData.projectId ? (
                <div className="p-4 bg-amber-50 text-amber-700 text-sm rounded-md border border-amber-100">
                  Please select a project in the first step.
                </div>
              ) : isLoadingLists ? (
                <div className="py-8 text-center text-zinc-500">
                  Loading lists...
                </div>
              ) : lists.length === 0 ? (
                <div className="py-12 text-center bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200">
                  <ListIcon size={32} className="mx-auto text-zinc-300 mb-2" />
                  <p className="text-sm text-zinc-500">
                    No lists found in this project.
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Create a list in the Audience section first.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lists.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => updateField("listId", String(l.id))}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        formData.listId === String(l.id)
                          ? "border-blue-600 bg-blue-50 shadow-sm"
                          : "border-zinc-200 hover:border-zinc-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ListIcon
                          size={16}
                          className={
                            formData.listId === String(l.id)
                              ? "text-blue-600"
                              : "text-zinc-400"
                          }
                        />
                        <h4 className="font-medium text-sm">{l.name}</h4>
                      </div>
                      {l.description && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                          {l.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </FormField>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                  Settings
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Name:</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Project:</span>
                    <span className="font-medium">{currentProject?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">From:</span>
                    <span className="font-medium">
                      {formData.fromName || "Default"} (
                      {formData.fromEmail || "Default"})
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                  Content
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Subject:</span>
                    <span className="font-medium">{formData.subject}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Template:</span>
                    <span className="font-medium">{currentTemplate?.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
              <div className="mt-0.5 text-blue-600">
                <Settings size={18} />
              </div>
              <p className="text-sm text-blue-800">
                Ready to go! Once you create this transactional email, you
                will receive a <strong>Webhook URL</strong>
                to start sending from your backend.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-10 pt-6 border-t border-zinc-100">
          <Button
            variant="ghost"
            onClick={step === "setup" ? () => router.back() : handleBack}
            disabled={isSubmitting}
          >
            <ChevronLeft size={16} />
            {step === "setup" ? "Cancel" : "Back"}
          </Button>

          {step === "review" ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Email"}
              <Check size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={
                (step === "setup" && (!formData.name || !formData.projectId)) ||
                (step === "content" &&
                  (!formData.subject || !formData.templateId))
              }
            >
              Next Step
              <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
