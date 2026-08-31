import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { setSettings } from "@/lib/settings";
import { parseJson, handleError, HttpError } from "@/lib/api";

const Body = z.object({
  viewRewardCoins: z.number().int().min(0).optional(),
  minWatchSeconds: z.number().int().min(1).max(3600).optional(),
  subscribeRewardCoins: z.number().int().min(0).optional(),
  minBudget: z.number().int().min(1).optional(),
  maxBudget: z.number().int().min(1).optional(),
  minRewardPerAction: z.number().int().min(1).optional(),
  maxRewardPerAction: z.number().int().min(1).optional(),
  enforceChannelPermanence: z.boolean().optional(),
  coinPackages: z.array(z.object({ coins: z.number().int().min(1), amountCents: z.number().int().min(1), currency: z.string().min(3) })).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id || u.user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN", "Admins only");
    const body = await parseJson(req, Body);
    const next = await setSettings(body, u.user.id);
    return NextResponse.json({ ok: true, settings: next });
  } catch (e) {
    return handleError(e);
  }
}
