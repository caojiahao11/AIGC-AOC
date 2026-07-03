import { Queue } from "bullmq";
import IORedis from "ioredis";

export const redisConnection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null
});

redisConnection.on("error", (err) => {
  console.error("[Redis] connection error:", err);
});

export type AnalysisJobData = {
  taskId: string;
};

export const analysisQueue = new Queue<AnalysisJobData>("analysis", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 }
  }
});

export async function closeRedis() {
  await redisConnection.quit();
}
