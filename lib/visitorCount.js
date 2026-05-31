import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const KV_KEY = "wc2026:visitor_count";
const visitorsPath = path.join(process.cwd(), "data", "visitors.json");

function redisConfigured() {
  const upstash =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
  const vercelKv =
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
  return Boolean(upstash || vercelKv);
}

function getRedis() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Redis.fromEnv();
  }

  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

function readFileCount() {
  if (!fs.existsSync(visitorsPath)) {
    return 0;
  }

  try {
    const raw = fs.readFileSync(visitorsPath, "utf8");
    const data = JSON.parse(raw);
    return Number.isFinite(data.count) ? data.count : 0;
  } catch {
    return 0;
  }
}

function writeFileCount(count) {
  fs.mkdirSync(path.dirname(visitorsPath), { recursive: true });
  fs.writeFileSync(visitorsPath, JSON.stringify({ count }, null, 2));
}

async function seedRedisFromFileIfNeeded(redis) {
  const existing = await redis.get(KV_KEY);
  if (existing !== null && existing !== undefined) return;

  const fileCount = readFileCount();
  if (fileCount > 0) {
    await redis.set(KV_KEY, fileCount);
  }
}

export function visitorStoreKind() {
  return redisConfigured() ? "redis" : "file";
}

export async function getVisitorCount() {
  if (redisConfigured()) {
    const redis = getRedis();
    await seedRedisFromFileIfNeeded(redis);
    const value = await redis.get(KV_KEY);
    if (value === null || value === undefined) {
      return 0;
    }
    return Number(value) || 0;
  }

  return readFileCount();
}

export async function incrementVisitorCount() {
  if (redisConfigured()) {
    const redis = getRedis();
    await seedRedisFromFileIfNeeded(redis);
    return await redis.incr(KV_KEY);
  }

  const next = readFileCount() + 1;
  writeFileCount(next);
  return next;
}
