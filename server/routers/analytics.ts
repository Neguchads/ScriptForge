import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { videoAnalytics } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const analyticsRouter = router({
  getVideoAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const analytics = await db
      .select()
      .from(videoAnalytics)
      .where(eq(videoAnalytics.userId, ctx.user.id))
      .orderBy(desc(videoAnalytics.publishedAt));

    return analytics;
  }),

  getAnalyticsByVideoId: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const analytics = await db
        .select()
        .from(videoAnalytics)
        .where(
          eq(videoAnalytics.youtubeVideoId, input.videoId)
        )
        .limit(1);

      return analytics[0] || null;
    }),

  getSummaryStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const analytics = await db
      .select()
      .from(videoAnalytics)
      .where(eq(videoAnalytics.userId, ctx.user.id));

    if (analytics.length === 0) {
      return {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        averageCTR: "0%",
        averageRetention: "0%",
        videosPublished: 0,
      };
    }

    const totalViews = analytics.reduce((sum, a) => sum + (a.views || 0), 0);
    const totalLikes = analytics.reduce((sum, a) => sum + (a.likes || 0), 0);
    const totalComments = analytics.reduce(
      (sum, a) => sum + (a.comments || 0),
      0
    );

    const ctrValues = analytics
      .filter((a) => a.ctr)
      .map((a) => parseFloat(a.ctr || "0"));
    const averageCTR =
      ctrValues.length > 0
        ? (ctrValues.reduce((a, b) => a + b, 0) / ctrValues.length).toFixed(2)
        : "0";

    const retentionValues = analytics
      .filter((a) => a.retention)
      .map((a) => parseFloat(a.retention || "0"));
    const averageRetention =
      retentionValues.length > 0
        ? (
            retentionValues.reduce((a, b) => a + b, 0) / retentionValues.length
          ).toFixed(2)
        : "0";

    return {
      totalViews,
      totalLikes,
      totalComments,
      averageCTR: `${averageCTR}%`,
      averageRetention: `${averageRetention}%`,
      videosPublished: analytics.length,
    };
  }),

  updateAnalytics: protectedProcedure
    .input(
      z.object({
        youtubeVideoId: z.string(),
        title: z.string().optional(),
        views: z.number().optional(),
        likes: z.number().optional(),
        comments: z.number().optional(),
        ctr: z.string().optional(),
        retention: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if analytics already exists
      const existing = await db
        .select()
        .from(videoAnalytics)
        .where(eq(videoAnalytics.youtubeVideoId, input.youtubeVideoId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(videoAnalytics)
          .set({
            title: input.title,
            views: input.views,
            likes: input.likes,
            comments: input.comments,
            ctr: input.ctr,
            retention: input.retention,
          })
          .where(eq(videoAnalytics.youtubeVideoId, input.youtubeVideoId));
      } else {
        await db.insert(videoAnalytics).values({
          userId: ctx.user.id,
          youtubeVideoId: input.youtubeVideoId,
          title: input.title,
          views: input.views || 0,
          likes: input.likes || 0,
          comments: input.comments || 0,
          ctr: input.ctr,
          retention: input.retention,
        });
      }

      return { success: true };
    }),
});
