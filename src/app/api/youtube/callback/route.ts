import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { makeOAuth2Client } from "@/lib/youtube";
import { encryptToken } from "@/lib/crypto";
import { handleError, HttpError } from "@/lib/api";
import { getSettings } from "@/lib/settings";
import { creditCoins } from "@/lib/coins";

export async function GET(req: NextRequest) {
  try {
    const u = await auth();
    if (!u?.user?.id) throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
    const settings = await getSettings();
    if (!settings.enforceChannelPermanence) {
      // still allow but log
    }
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const cookieState = req.cookies.get("yt_oauth_state")?.value;
    if (!code) throw new HttpError(400, "NO_CODE", "Missing OAuth code");
    if (!state || !cookieState || state !== cookieState) throw new HttpError(400, "BAD_STATE", "Invalid OAuth state");

    const oauth2 = makeOAuth2Client();
    const { tokens } = await oauth2.getToken(code);
    if (!tokens.access_token) throw new HttpError(400, "NO_TOKEN", "No access token returned");
    oauth2.setCredentials(tokens);

    // Identify the YouTube channel owned by this Google account
    const { google } = await import("googleapis");
    const yt = google.youtube({ version: "v3", auth: oauth2 });
    const ch = await yt.channels.list({ part: ["id", "snippet"], mine: true, maxResults: 1 });
    const item = ch.data.items?.[0];
    if (!item?.id) throw new HttpError(400, "NO_CHANNEL", "No YouTube channel found for this Google account");

    const ytChannelId = item.id;
    const ytTitle = item.snippet?.title || "YouTube channel";
    const ytHandle = item.snippet?.customUrl || null;
    const ytThumb = item.snippet?.thumbnails?.default?.url || null;

    // Get subscriber count
    const stats = await yt.channels.list({ part: ["statistics"], id: [ytChannelId], maxResults: 1 });
    const subCount = stats.data.items?.[0]?.statistics?.subscriberCount ? Number(stats.data.items[0].statistics!.subscriberCount) : null;

    // CRITICAL: this YouTube channel cannot already be linked to another SUB2SUB account
    const existingForChannel = await prisma.youTubeChannel.findUnique({ where: { youtubeId: ytChannelId } });
    if (existingForChannel && existingForChannel.userId !== u.user.id) {
      throw new HttpError(409, "CHANNEL_TAKEN", "This YouTube channel is already connected to another account");
    }

    // CRITICAL: this user cannot have a different channel already (enforce permanence)
    const existingForUser = await prisma.youTubeChannel.findUnique({ where: { userId: u.user.id } });
    if (existingForUser && existingForUser.youtubeId !== ytChannelId) {
      throw new HttpError(409, "CHANNEL_LOCKED", "Your account is already linked to a different YouTube channel. Channel connection is permanent and cannot be changed.");
    }

    const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

    const updateData: any = {
      handle: ytHandle,
      title: ytTitle,
      thumbnailUrl: ytThumb,
      subscriberCount: subCount,
      verified: true,
      verifiedAt: new Date(),
      tokenExpiresAt: expiresAt,
      scope: tokens.scope ?? null,
    };
    if (tokens.access_token) updateData.accessTokenCipher = encryptToken(tokens.access_token);
    if (tokens.refresh_token) updateData.refreshTokenCipher = encryptToken(tokens.refresh_token);

    await prisma.youTubeChannel.upsert({
      where: { userId: u.user.id },
      create: {
        userId: u.user.id,
        youtubeId: ytChannelId,
        handle: ytHandle,
        title: ytTitle,
        thumbnailUrl: ytThumb,
        subscriberCount: subCount,
        verified: true,
        verifiedAt: new Date(),
        accessTokenCipher: tokens.access_token ? encryptToken(tokens.access_token) : null,
        refreshTokenCipher: tokens.refresh_token ? encryptToken(tokens.refresh_token) : null,
        tokenExpiresAt: expiresAt,
        scope: tokens.scope ?? null,
      },
      update: updateData,
    });

    const justConnected = existingForUser === null;
    if (justConnected) {
      const me = await prisma.user.findUnique({ where: { id: u.user.id } });
      const inviterId = me?.invitedById;
      const settings = await getSettings();
      if (inviterId && settings.inviteRewardCoins > 0) {
        await creditCoins({
          userId: inviterId,
          amount: settings.inviteRewardCoins,
          type: "ADMIN_ADJUSTMENT",
          note: `Invite reward for ${me?.email} connecting YouTube`,
          idempotencyKey: `invite.reward.${u.user.id}`,
        });
        await prisma.notification.create({
          data: {
            userId: inviterId,
            kind: "COIN_PURCHASE",
            title: `+${settings.inviteRewardCoins} invite coins`,
            body: `Your invite ${me?.email} connected YouTube. You earned ${settings.inviteRewardCoins} coins.`,
            link: "/transactions",
          },
        }).catch(() => {});
      }
      await prisma.user.update({
        where: { id: u.user.id },
        data: { inviteCompletedAt: new Date() },
      }).catch(() => {});
    }

    // create notification
    await prisma.notification.create({
      data: {
        userId: u.user.id,
        kind: "YT_CONNECTION",
        title: "YouTube channel connected",
        body: `@${ytHandle || ytTitle} is now linked to your account.`,
        link: "/settings#youtube",
      },
    });

    const res = NextResponse.redirect(new URL("/settings?yt=ok", req.url));
    res.cookies.delete("yt_oauth_state");
    return res;
  } catch (e) {
    if (e instanceof HttpError) {
      const url = new URL(`/settings?yt=err&msg=${encodeURIComponent(e.message)}`, req.url);
      return NextResponse.redirect(url);
    }
    console.error("[yt callback]", e);
    const url = new URL(`/settings?yt=err&msg=${encodeURIComponent("Connection failed")}`, req.url);
    return NextResponse.redirect(url);
  }
}
