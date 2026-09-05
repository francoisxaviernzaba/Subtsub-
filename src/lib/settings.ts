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
  platformFeePercent: number;
  coinPackages: { coins: number; amountCents: number; currency: string }[];
  adminEmails: string[];
  enforceChannelPermanence: boolean;
  inviteRewardCoins: number;
  welcomeCoins: number;
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
  platformFeePercent: 35,
  coinPackages: [
    { coins: 1000, amountCents: 100, currency: "USD" },
    { coins: 2000, amountCents: 200, currency: "USD" },
    { coins: 5000, amountCents: 500, currency: "USD" },
    { coins: 12000, amountCents: 1000, currency: "USD" },
    { coins: 25000, amountCents: 2000, currency: "USD" },
  ],
  adminEmails: (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  enforceChannelPermanence: true,
  inviteRewardCoins: 50,
  welcomeCoins: 100,
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
