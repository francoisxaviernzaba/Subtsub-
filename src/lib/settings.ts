import { prisma } from "./db";

export type Settings = {
  viewRewardCoins: number;
  minWatchSeconds: number;
  maxViewsPerUserPerCampaign: number; // 1 typically
  subscribeRewardCoins: number;
  minBudget: number;
  maxBudget: number;
  minRewardPerAction: number;
  maxRewardPerAction: number;
  coinPackages: { coins: number; amountCents: number; currency: string }[];
  adminEmails: string[];
  enforceChannelPermanence: boolean;
};

const DEFAULTS: Settings = {
  viewRewardCoins: 10,
  minWatchSeconds: 30,
  maxViewsPerUserPerCampaign: 1,
  subscribeRewardCoins: 25,
  minBudget: 100,
  maxBudget: 1_000_000,
  minRewardPerAction: 1,
  maxRewardPerAction: 1000,
  coinPackages: [
    { coins: 500, amountCents: 499, currency: "USD" },
    { coins: 1500, amountCents: 1299, currency: "USD" },
    { coins: 5000, amountCents: 3999, currency: "USD" },
    { coins: 12000, amountCents: 8999, currency: "USD" },
  ],
  adminEmails: (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  enforceChannelPermanence: true,
};

export async function getSettings(): Promise<Settings> {
  const rows = await prisma.systemSetting.findMany();
  const merged: Settings = { ...DEFAULTS };
  for (const r of rows) {
    if (r.key === "config") {
      try {
        const parsed = JSON.parse(r.value);
        Object.assign(merged, parsed);
      } catch {
        /* ignore */
      }
    }
  }
  return merged;
}

export async function setSettings(patch: Partial<Settings>, adminId?: string): Promise<Settings> {
  const current = await getSettings();
  const next: Settings = { ...current, ...patch };
  await prisma.systemSetting.upsert({
    where: { key: "config" },
    create: { key: "config", value: JSON.stringify(next), updatedBy: adminId },
    update: { value: JSON.stringify(next), updatedBy: adminId },
  });
  if (adminId) {
    await prisma.adminAction.create({
      data: {
        adminId,
        action: "UPDATE_SETTINGS",
        payload: JSON.stringify(patch),
      },
    });
  }
  return next;
}
