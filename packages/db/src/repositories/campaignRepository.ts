import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { db } from "../client";
import { campaigns, campaignEvents } from "../schema";
import { Campaign, CampaignEvent, ICampaignRepository } from "@senlo/core";
import { BaseRepository } from "./baseRepository";

// Drizzle inferred types for insert operations
type CampaignInsert = typeof campaigns.$inferInsert;
type CampaignEventInsert = typeof campaignEvents.$inferInsert;

/**
 * Repository for managing email campaigns and their events.
 * Extends BaseRepository for common operations (findById, delete).
 */
export class CampaignRepository
  extends BaseRepository<
    typeof campaigns,
    typeof campaigns.$inferSelect,
    Campaign
  >
  implements ICampaignRepository
{
  protected table = campaigns;

  /**
   * Map a database row to a Campaign entity.
   * @param row - The raw database row
   * @returns The mapped Campaign
   */
  protected mapToEntity(row: typeof campaigns.$inferSelect): Campaign {
    return {
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      type: row.type,
      status: row.status,
      fromName: row.fromName,
      fromEmail: row.fromEmail,
      replyTo: row.replyTo,
      subject: row.subject,
      preheader: row.preheader,
      templateId: row.templateId,
      localeTemplates: row.localeTemplates as Record<string, number> | null,
      listId: row.listId,
      variablesSchema: row.variablesSchema as Record<string, any> | null,
      scheduledAt: row.scheduledAt,
      sentAt: row.sentAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapEvent(row: typeof campaignEvents.$inferSelect): CampaignEvent {
    return {
      id: row.id,
      campaignId: row.campaignId,
      contactId: row.contactId,
      email: row.email,
      type: row.type,
      linkUrl: row.linkUrl,
      metadata: row.metadata as Record<string, any> | null,
      occurredAt: row.occurredAt,
    };
  }

  /**
   * Find a campaign by its template ID.
   * @param templateId - The template ID
   * @returns The first campaign using this template or null
   */
  async findByTemplateId(templateId: number): Promise<Campaign | null> {
    const [row] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.templateId, templateId));

    return row ? this.mapToEntity(row) : null;
  }

  /**
   * Get all campaigns for a project, ordered by creation date (newest first).
   * @param projectId - The project ID
   * @returns Array of campaigns
   */
  async findByProject(projectId: number): Promise<Campaign[]> {
    const rows = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.projectId, projectId))
      .orderBy(desc(campaigns.createdAt));

    return rows.map((r) => this.mapToEntity(r));
  }

  /**
   * Get all campaigns, ordered by creation date (newest first).
   * @returns Array of all campaigns
   */
  async findAll(): Promise<Campaign[]> {
    const rows = await db
      .select()
      .from(campaigns)
      .orderBy(desc(campaigns.createdAt));

    return rows.map((r) => this.mapToEntity(r));
  }

  /**
   * Create a new campaign.
   * @param data - Campaign data
   * @returns The created campaign
   */
  async create(
    data: Omit<CampaignInsert, "id" | "createdAt" | "updatedAt">,
  ): Promise<Campaign> {
    const [row] = await db
      .insert(campaigns)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return this.mapToEntity(row);
  }

  /**
   * Update a campaign by ID.
   * @param id - The campaign ID
   * @param data - Fields to update
   * @returns The updated campaign or null if not found
   */
  async update(
    id: number,
    data: Partial<
      Omit<CampaignInsert, "id" | "projectId" | "createdAt" | "updatedAt">
    >,
  ): Promise<Campaign | null> {
    const [row] = await db
      .update(campaigns)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();

    return row ? this.mapToEntity(row) : null;
  }

  // ============================================================
  // Campaign Events
  // ============================================================

  /**
   * Log a campaign event (sent, opened, clicked, etc.).
   * @param data - Event data including campaignId, email, and type
   * @returns The created event
   */
  async logEvent(
    data: Omit<CampaignEventInsert, "id" | "occurredAt">,
  ): Promise<CampaignEvent> {
    const [row] = await db
      .insert(campaignEvents)
      .values({
        ...data,
        occurredAt: new Date(),
      })
      .returning();

    return this.mapEvent(row);
  }

  /**
   * Get all events for a campaign, ordered by occurrence (newest first).
   * @param campaignId - The campaign ID
   * @returns Array of campaign events
   */
  async getEventsByCampaign(campaignId: number): Promise<CampaignEvent[]> {
    const rows = await db
      .select()
      .from(campaignEvents)
      .where(eq(campaignEvents.campaignId, campaignId))
      .orderBy(desc(campaignEvents.occurredAt));

    return rows.map((r) => this.mapEvent(r));
  }

  /**
   * Get paginated and filtered events for a campaign.
   * @param campaignId - The campaign ID
   * @param options - Pagination and filter options
   * @returns Paginated events and total count
   */
  async getPaginatedEventsByCampaign(
    campaignId: number,
    options: {
      page: number;
      pageSize: number;
      type?: string;
      search?: string;
    },
  ): Promise<{ events: CampaignEvent[]; total: number }> {
    const { page, pageSize, type, search } = options;
    const offset = (page - 1) * pageSize;

    const whereClauses = [eq(campaignEvents.campaignId, campaignId)];

    if (type) {
      whereClauses.push(eq(campaignEvents.type, type as any));
    }

    if (search) {
      whereClauses.push(ilike(campaignEvents.email, `%${search}%`));
    }

    const query = db
      .select()
      .from(campaignEvents)
      .where(and(...whereClauses))
      .orderBy(desc(campaignEvents.occurredAt))
      .limit(pageSize)
      .offset(offset);

    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(campaignEvents)
      .where(and(...whereClauses));

    const [rows, [countResult]] = await Promise.all([query, countQuery]);

    return {
      events: rows.map((r) => this.mapEvent(r)),
      total: Number(countResult.count),
    };
  }

  /**
   * Get event statistics for a campaign.
   * @param campaignId - The campaign ID
   * @returns Stats for opens and clicks
   */
  async getEventStatsByCampaign(campaignId: number): Promise<{
    opens: { unique: number; total: number };
    clicks: { unique: number; total: number };
  }> {
    const [openStats] = await db
      .select({
        total: sql<number>`count(*)`,
        unique: sql<number>`count(distinct ${campaignEvents.email})`,
      })
      .from(campaignEvents)
      .where(
        and(
          eq(campaignEvents.campaignId, campaignId),
          eq(campaignEvents.type, "OPEN" as any),
        ),
      );

    const [clickStats] = await db
      .select({
        total: sql<number>`count(*)`,
        unique: sql<number>`count(distinct ${campaignEvents.email})`,
      })
      .from(campaignEvents)
      .where(
        and(
          eq(campaignEvents.campaignId, campaignId),
          eq(campaignEvents.type, "CLICK" as any),
        ),
      );

    return {
      opens: {
        total: Number(openStats?.total || 0),
        unique: Number(openStats?.unique || 0),
      },
      clicks: {
        total: Number(clickStats?.total || 0),
        unique: Number(clickStats?.unique || 0),
      },
    };
  }
}
