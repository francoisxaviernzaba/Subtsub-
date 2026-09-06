import { prisma } from "./db";
import { NextResponse } from "next/server";
import { z, ZodSchema } from "zod";

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function parseJson<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "BAD_JSON", "Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, "VALIDATION", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }
  return parsed.data;
}

export async function withIdempotency<T>(userId: string, endpoint: string, key: string | null, fn: () => Promise<T>): Promise<T> {
  if (!key) return fn();
  const existing = await prisma.idempotencyKey.findUnique({ where: { key } });
  if (existing?.result) {
    try {
      return JSON.parse(existing.result) as T;
    } catch {
      // corrupt result; fall through and recompute
    }
  }
  try {
    const result = await fn();
    await prisma.idempotencyKey.create({
      data: { key, userId, endpoint, result: JSON.stringify(result ?? null) },
    });
    return result;
  } catch (e) {
    throw e;
  }
}

export function handleError(e: unknown) {
  if (e instanceof HttpError) return jsonError(e.status, e.code, e.message);
  console.error("[api] unhandled", e);
  return jsonError(500, "INTERNAL", "Internal server error");
}

export const zCoins = z.number().int().min(1).max(1_000_000_000);
