export type EmailJobData = {
  campaignId: number;
  contactId: number | null;
  email: string;
  from: string;
  subject: string;
  html: string;
  providerId: number;
  replyTo?: string;
};

export type CampaignJobData = {
  campaignId: number;
  userId: string;
};
