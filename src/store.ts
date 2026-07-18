import { createRequire } from "node:module";
import type { StorageAdapter } from "grammy";
import { MemorySessionStorage } from "./toolkit/session/memory.js";
import { RedisSessionStorage, type RedisLike } from "./toolkit/session/redis.js";

function makeRedisAdapter<T>(prefix: string): StorageAdapter<T> | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    const require = createRequire(import.meta.url);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ioredis: any = require("ioredis");
    const Redis = ioredis.default ?? ioredis.Redis ?? ioredis;
    const client = new Redis(url, { maxRetriesPerRequest: null, lazyConnect: false });
    return new RedisSessionStorage<T>(client as RedisLike, prefix);
  } catch {
    return null;
  }
}

/**
 * Durable key-value store for domain data that must survive restarts.
 * Uses Redis in production (via REDIS_URL), falls back to in-memory for
 * development and the test harness.
 */
export class DurableStore<T> {
  private adapter: StorageAdapter<T>;

  constructor(prefix: string) {
    this.adapter = makeRedisAdapter<T>(prefix) ?? new MemorySessionStorage<T>();
  }

  async get(key: string): Promise<T | undefined> {
    return this.adapter.read(key);
  }

  async set(key: string, value: T): Promise<void> {
    await this.adapter.write(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.adapter.delete(key);
  }

  async has(key: string): Promise<boolean> {
    const val = await this.adapter.read(key);
    return val !== undefined;
  }
}

export interface UserProfile {
  userId: number;
  lang?: string;
  displayName?: string;
  skillLevel?: string;
}

export interface Piece {
  id: string;
  userId: number;
  text: string;
  lang: string;
  type: string;
  timestamp: number;
  analysisResult?: string;
}

export interface ReviewRequest {
  id: string;
  pieceId: string;
  userId: number;
  status: "pending" | "reviewed" | "dismissed";
  adminId?: number;
  timestamp: number;
}

export interface AdminAccount {
  telegramId: number;
}

export const userStore = new DurableStore<UserProfile>("user:");
export const pieceStore = new DurableStore<Piece>("piece:");
export const reviewStore = new DurableStore<ReviewRequest>("review:");
export const adminStore = new DurableStore<AdminAccount>("admin:");

let pieceCounter = 0;
let reviewCounter = 0;

export function nextPieceId(): string {
  return `piece_${Date.now()}_${++pieceCounter}`;
}

export function nextReviewId(): string {
  return `review_${Date.now()}_${++reviewCounter}`;
}
