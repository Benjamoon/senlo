import { eq, desc } from "drizzle-orm";
import { db } from "../client";
import { triggeredSendLogs } from "../schema";
import { TriggeredSendLog } from "@senlo/core";
import { BaseRepository } from "./baseRepository";

/**
 * Repository for logging triggered (API-initiated) email sends.
 * Extends BaseRepository for common operations (findById, delete).
 */
export class TriggeredSendLogRepository extends BaseRepository<
  typeof triggeredSendLogs,
  typeof triggeredSendLogs.$inferSelect,
  TriggeredSendLog
> {
  protected table = triggeredSendLogs;

  /**
   * Map a database row to a TriggeredSendLog entity.
   * @param row - The raw database row
   * @returns The mapped TriggeredSendLog
   */
  protected mapToEntity(row: typeof triggeredSendLogs.$inferSelect): TriggeredSendLog {
    return {
      id: row.id,
      campaignId: row.campaignId,
      email: row.email,
      status: row.status as "SUCCESS" | "FAILED" | "BOUNCED" | "COMPLAINED" | "DELIVERED",
      providerMessageId: row.providerMessageId,
      error: row.error,
      data: row.data as Record<string, any> | null,
      sentAt: row.sentAt,
    };
  }

  /**
   * Get all triggered send logs for a campaign, ordered by send time (newest first).
   * @param campaignId - The campaign ID
   * @returns Array of send logs
   */
  async findByCampaign(campaignId: number): Promise<TriggeredSendLog[]> {
    const rows = await db
      .select()
      .from(triggeredSendLogs)
      .where(eq(triggeredSendLogs.campaignId, campaignId))
      .orderBy(desc(triggeredSendLogs.sentAt));

    return rows.map((r) => this.mapToEntity(r));
  }

  /**
   * Log a triggered email send attempt.
   * @param data - Log data including campaignId, email, status, and optional error/data
   * @returns The created log entry
   */
  async create(
    data: Omit<TriggeredSendLog, "id" | "sentAt">
  ): Promise<TriggeredSendLog> {
    const [row] = await db
      .insert(triggeredSendLogs)
      .values({
        campaignId: data.campaignId,
        email: data.email,
        status: data.status,
        error: data.error,
        data: data.data,
        sentAt: new Date(),
      })
      .returning();

    return this.mapToEntity(row);
  }

  /**
   * Update a log entry by ID.
   */
  async update(
    id: number,
    data: Partial<Omit<TriggeredSendLog, "id" | "sentAt">>
  ): Promise<TriggeredSendLog | null> {
    const [row] = await db
      .update(triggeredSendLogs)
      .set({
        ...data,
      })
      .where(eq(triggeredSendLogs.id, id))
      .returning();

    return row ? this.mapToEntity(row) : null;
  }

  /**
   * Find a log entry by provider message ID.
   */
  async findByProviderMessageId(
    providerMessageId: string
  ): Promise<TriggeredSendLog | null> {
    const [row] = await db
      .select()
      .from(triggeredSendLogs)
      .where(eq(triggeredSendLogs.providerMessageId, providerMessageId));

    return row ? this.mapToEntity(row) : null;
  }
}
