"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@senlo/ui";
import { Pencil } from "lucide-react";
import { useUpdateProvider } from "apps/web/queries/providers";
import type { EmailProvider, EmailProviderType } from "@senlo/core";
import { CreateProviderError } from "./actions";

interface EditProviderDialogProps {
  provider: EmailProvider;
}

export function EditProviderDialog({ provider }: EditProviderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<EmailProviderType>(provider.type);
  const { mutate: updateProvider } = useUpdateProvider();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    updateProvider(
      { id: provider.id, formData },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
        onError: (error: CreateProviderError) => {
          const fieldErrors = error.error?.fieldErrors;
          let errorMessage = "Validation failed";

          if (fieldErrors) {
            if ("name" in fieldErrors && fieldErrors.name?.[0]) {
              errorMessage = fieldErrors.name[0];
            } else if ("type" in fieldErrors && fieldErrors.type?.[0]) {
              errorMessage = fieldErrors.type[0];
            } else if ("apiKey" in fieldErrors && fieldErrors.apiKey?.[0]) {
              errorMessage = fieldErrors.apiKey[0];
            } else if (
              "webhookSecret" in fieldErrors &&
              fieldErrors.webhookSecret?.[0]
            ) {
              errorMessage = fieldErrors.webhookSecret[0];
            } else if ("domain" in fieldErrors && fieldErrors.domain?.[0]) {
              errorMessage = fieldErrors.domain[0];
            } else if (
              "accessKeyId" in fieldErrors &&
              fieldErrors.accessKeyId?.[0]
            ) {
              errorMessage = fieldErrors.accessKeyId[0];
            } else if (
              "secretAccessKey" in fieldErrors &&
              fieldErrors.secretAccessKey?.[0]
            ) {
              errorMessage = fieldErrors.secretAccessKey[0];
            } else if ("general" in fieldErrors && fieldErrors.general?.[0]) {
              errorMessage = fieldErrors.general[0];
            }
          }

          alert(`Error: ${errorMessage}`);
        },
      },
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    setType(provider.type);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
        title="Edit settings"
      >
        <Pencil size={18} />
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={handleClose}
        title="Edit Email Provider"
        description="Update your email provider configuration."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Display Name"
            required
            hint="Internal name for this provider"
          >
            <Input
              name="name"
              defaultValue={provider.name}
              placeholder="My Account"
              required
              autoFocus
            />
          </FormField>

          <FormField label="Provider Type" required>
            <Select
              name="type"
              value={type}
              onValueChange={(val) => setType(val as EmailProviderType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESEND">Resend</SelectItem>
                <SelectItem value="MAILGUN">Mailgun</SelectItem>
                <SelectItem value="SES">Amazon SES</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {type === "RESEND" && (
            <>
              <FormField label="API Key" hint="Leave empty to keep current key">
                <Input
                  name="apiKey"
                  type="password"
                  placeholder="re_••••••••"
                />
              </FormField>

              <FormField
                label="Webhook Secret"
                hint="Svix signing secret for delivery tracking"
              >
                <Input
                  name="webhookSecret"
                  type="password"
                  defaultValue={
                    (provider.config.webhook_secret as string) || ""
                  }
                  placeholder="whsec_..."
                />
              </FormField>
            </>
          )}

          {type === "MAILGUN" && (
            <>
              <FormField label="API Key" hint="Leave empty to keep current key">
                <Input
                  name="apiKey"
                  type="password"
                  placeholder="key-••••••••"
                />
              </FormField>

              <FormField
                label="Sending Domain"
                required
                hint="Your verified Mailgun domain"
              >
                <Input
                  name="domain"
                  defaultValue={(provider.config.domain as string) || ""}
                  placeholder="mg.example.com"
                  required
                />
              </FormField>

              <FormField
                label="Region"
                hint="Choose based on your Mailgun account region"
              >
                <Select
                  name="region"
                  defaultValue={(provider.config.region as string) || "US"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">US (api.mailgun.net)</SelectItem>
                    <SelectItem value="EU">EU (api.eu.mailgun.net)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </>
          )}

          {type === "SES" && (
            <>
              <FormField
                label="Access Key ID"
                hint="Leave empty to keep current"
              >
                <Input
                  name="accessKeyId"
                  defaultValue={(provider.config.accessKeyId as string) || ""}
                  placeholder="AKIA..."
                />
              </FormField>

              <FormField
                label="Secret Access Key"
                hint="Leave empty to keep current"
              >
                <Input
                  name="secretAccessKey"
                  type="password"
                  placeholder="••••••••"
                />
              </FormField>

              <FormField
                label="Region"
                required
                hint="AWS Region where SES is configured"
              >
                <Input
                  name="region"
                  defaultValue={(provider.config.region as string) || ""}
                  placeholder="us-east-1"
                  required
                />
              </FormField>
            </>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
