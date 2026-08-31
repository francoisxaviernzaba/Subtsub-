// Seed: creates an admin and a couple of demo campaigns for local exploration.
// In production, remove or guard this. Run with: pnpm db:seed

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  // Ensure config exists
  const { setSettings } = await import("../src/lib/settings");
  await setSettings({});

  // Create admin
  const adminEmail = "admin@sub2sub.local";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });
    console.log(`Created admin ${adminEmail}`);
  } else {
    console.log(`Admin exists: ${adminEmail}`);
  }

  // Note: creating real campaigns requires a connected YouTube channel.
  // In dev, create a fake channel + sample campaigns directly so the UI has data.
  const owner = await prisma.user.upsert({
    where: { email: "creator@sub2sub.local" },
    update: {},
    create: {
      email: "creator@sub2sub.local",
      name: "Demo Creator",
      role: "USER",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  await prisma.youTubeChannel.upsert({
    where: { userId: owner.id },
    update: {},
    create: {
      userId: owner.id,
      youtubeId: "UC_demo_channel_id_xx",
      handle: "democreator",
      title: "Demo Creator Channel",
      description: "Seeded demo channel",
      thumbnailUrl: "https://yt3.ggpht.com/placeholder/photo.jpg",
      verified: true,
      verifiedAt: new Date(),
    },
  });

  // Seed some coin balance
  const existing = await prisma.coinTransaction.findFirst({ where: { userId: owner.id } });
  if (!existing) {
    await prisma.coinTransaction.create({
      data: {
        userId: owner.id,
        deltaCoins: 1000,
        balanceAfter: 1000,
        type: "COIN_PURCHASE",
        note: "Seed credit",
      },
    });
  }

  // Sample campaigns (note: skipped in real env without verified channels)
  const ccount = await prisma.campaign.count({ where: { ownerId: owner.id } });
  if (ccount === 0) {
    await prisma.campaign.createMany({
      data: [
        {
          ownerId: owner.id,
          type: "VIDEO_VIEW",
          status: "ACTIVE",
          youtubeVideoId: "dQw4w9WgXcQ",
          title: "Demo Video — Earn 10 coins per view",
          thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
          rewardPerAction: 10,
          totalBudget: 200,
          spentBudget: 0,
          maxActions: 20,
          completedActions: 0,
          minWatchSeconds: 30,
        },
        {
          ownerId: owner.id,
          type: "SUBSCRIBER",
          status: "ACTIVE",
          youtubeChannelId: "UC_demo_channel_id_xx",
          title: "@democreator — Subscribe to earn 25 coins",
          thumbnailUrl: "https://yt3.ggpht.com/placeholder/photo.jpg",
          rewardPerAction: 25,
          totalBudget: 500,
          spentBudget: 0,
          maxActions: 20,
          completedActions: 0,
        },
      ],
    });
    console.log("Created sample campaigns");
  }

  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
