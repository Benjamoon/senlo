"use server";

import { revalidatePath } from "next/cache";
import {
  CampaignRepository,
  ProjectRepository,
  EmailTemplateRepository,
  EmailProviderRepository,
  TriggeredSendLogRepository,
} from "@senlo/db";
import {
  Campaign,
  Project,
  EmailTemplate,
  CampaignEvent,
  TriggeredSendLog,
  encodeUnsubscribeToken,
  renderEmailDesign,
  wrapLinksWithTracking,
  MailerFactory,
  EmailDesignDocument,
} from "@senlo/core";
import { emailQueue } from "@senlo/core/src/queue";
import { ActionResult, withErrorHandling } from "apps/web/lib/errors";
import { logger } from "apps/web/lib/logger";
import { CreateCampaignSchema, UpdateCampaignSchema } from "./schemas";
import { auth } from "apps/web/auth";

const campaignRepo = new CampaignRepository();
const projectRepo = new ProjectRepository();
const templateRepo = new EmailTemplateRepository();
const providerRepo = new EmailProviderRepository();
const triggeredLogRepo = new TriggeredSendLogRepository();

async function getAuthorizedCampaign(campaignId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const campaign = await campaignRepo.findById(campaignId);
  if (!campaign) throw new Error("Campaign not found");

  const project = await projectRepo.findById(campaign.projectId);
  if (!project || project.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  return { campaign, project, session };
}

export async function getCampaignDetails(id: number): Promise<{
  campaign: Campaign;
  project: Project;
  template: EmailTemplate;
  events: CampaignEvent[];
  triggeredLogs: TriggeredSendLog[];
} | null> {
  const { campaign, project } = await getAuthorizedCampaign(id);

  const [template, events, triggeredLogs] = await Promise.all([
    templateRepo.findById(campaign.templateId),
    campaignRepo.getEventsByCampaign(id),
    triggeredLogRepo.findByCampaign(id),
  ]);

  if (!template) return null;

  return {
    campaign,
    project,
    template,
    events,
    triggeredLogs,
  };
}

export async function listAllCampaigns(): Promise<ActionResult<Campaign[]>> {
  const session = await auth();
  if (!session?.user?.id)
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized", statusCode: 401 },
    };

  const userId = session.user.id;

  return withErrorHandling(async () => {
    logger.debug("Listing all campaigns for user", { userId });
    // This is a bit tricky, we need to filter by projects owned by the user
    const projects = await projectRepo.findByUser(userId);
    const projectIds = projects.map((p) => p.id);

    if (projectIds.length === 0) return [];

    // We might need a new repository method for this, or just filter manually for now
    // Actually, let's assume campaigns don't have findByUser yet.
    // I'll filter them manually or just get all for simplicity if the list is small,
    // but better to do it correctly.
    const allCampaigns = await Promise.all(
      projectIds.map((pid) => campaignRepo.findByProject(pid))
    );
    return allCampaigns.flat();
  });
}

export async function listProjectCampaigns(
  projectId: number
): Promise<ActionResult<Campaign[]>> {
  const session = await auth();
  if (!session?.user?.id)
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized", statusCode: 401 },
    };

  const userId = session.user.id;

  return withErrorHandling(async () => {
    const project = await projectRepo.findById(projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Unauthorized");
    }

    logger.debug("Listing campaigns by project", { projectId });
    return await campaignRepo.findByProject(projectId);
  });
}

export async function getWizardData(): Promise<
  ActionResult<{ projects: Project[] }>
> {
  const session = await auth();
  if (!session?.user?.id)
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized", statusCode: 401 },
    };

  const userId = session.user.id;

  return withErrorHandling(async () => {
    logger.debug("Getting wizard data for user", { userId });
    const projects = await projectRepo.findByUser(userId);
    return { projects };
  });
}

export async function getTemplatesByProject(
  projectId: number
): Promise<EmailTemplate[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const project = await projectRepo.findById(projectId);
  if (!project || project.userId !== session.user.id)
    throw new Error("Unauthorized");

  return templateRepo.findByProject(projectId);
}

export async function createCampaignAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id)
    return { error: { formErrors: ["Unauthorized"], fieldErrors: {} } };

  const parsed = CreateCampaignSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      error: parsed.error.flatten(),
    };
  }

  const {
    name,
    description,
    projectId,
    templateId,
    type,
    fromName,
    fromEmail,
    subject,
    variablesSchema,
  } = parsed.data;

  try {
    // Check project ownership
    const project = await projectRepo.findById(projectId);
    if (!project || project.userId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    logger.info("Creating transactional email", {
      name,
      projectId,
      templateId,
      type,
    });

    const campaign = await campaignRepo.create({
      name,
      description,
      projectId,
      templateId,
      listId: null,
      type: "TRIGGERED",
      variablesSchema,
      fromName,
      fromEmail,
      subject,
      status: "DRAFT",
    });

    revalidatePath("/triggers");

    logger.info("Transactional email created successfully", { campaignId: campaign.id });

    return { success: true, data: campaign };
  } catch (error) {
    logger.error("Failed to create transactional email", {
      error: error instanceof Error ? error.message : String(error),
      name,
      projectId,
    });
    return {
      error: {
        formErrors: [],
        fieldErrors: { general: ["Failed to create transactional email"] },
      },
    };
  }
}

export async function updateCampaignAction(id: number, formData: FormData) {
  try {
    const { campaign } = await getAuthorizedCampaign(id);

    const parsed = UpdateCampaignSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return {
        error: parsed.error.flatten(),
      };
    }

    const { name, description, fromName, fromEmail, subject, variablesSchema } =
      parsed.data;

    logger.info("Updating campaign", { campaignId: id, name });

    const updatedCampaign = await campaignRepo.update(id, {
      name,
      description,
      fromName,
      fromEmail,
      subject,
      variablesSchema,
    });

    if (!updatedCampaign) {
      return {
        error: {
          formErrors: [],
          fieldErrors: { general: ["Campaign not found"] },
        },
      };
    }

    revalidatePath(`/triggers/${id}`);
    revalidatePath("/triggers");

    logger.info("Campaign updated successfully", { campaignId: id });

    return { success: true, data: updatedCampaign };
  } catch (error) {
    logger.error("Failed to update campaign", {
      error: error instanceof Error ? error.message : String(error),
      campaignId: id,
    });
    return {
      error: {
        formErrors: [],
        fieldErrors: { general: ["Failed to update campaign"] },
      },
    };
  }
}

export async function deleteCampaignAction(
  id: number
): Promise<ActionResult<void>> {
  return withErrorHandling(async () => {
    await getAuthorizedCampaign(id);
    logger.debug("Deleting email", { campaignId: id });
    await campaignRepo.delete(id);
    revalidatePath("/triggers");
  });
}
