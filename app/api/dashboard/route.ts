import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as { userId: string };
    const userId = decoded.userId;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tips: {
          orderBy: { createdAt: "desc" },
          take: 10,
          where: {
            paymentStatus: "completed",
          },
        },
        goals: {
          where: { isActive: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const monthlyTipsAggregate = await prisma.tip.aggregate({
      where: {
        recipientUserId: user.id,
        createdAt: { gte: startOfMonth },
        paymentStatus: "completed",
      },
      _sum: { amount: true },
    });
    const monthlyTipsAmount = monthlyTipsAggregate._sum.amount || 0;

    const tipsOverTime = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthlyTotalAggregate = await prisma.tip.aggregate({
        where: {
          recipientUserId: user.id,
          createdAt: { gte: date, lt: nextDate },
          paymentStatus: "completed",
        },
        _sum: { amount: true },
      });

      tipsOverTime.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        amount: monthlyTotalAggregate._sum.amount || 0,
      });
    }

    const topTippers = await prisma.tip.groupBy({
      by: ["tipperName"],
      where: {
        recipientUserId: user.id,
        paymentStatus: "completed",
        tipperName: { not: "Anonymous" },
      },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    });

    const geographicData = [
      { country: "United States", percentage: 45, color: "#8b5cf6" },
      { country: "Canada", percentage: 20, color: "#a78bfa" },
      { country: "United Kingdom", percentage: 15, color: "#c4b5fd" },
      { country: "Germany", percentage: 12, color: "#ddd6fe" },
      { country: "Others", percentage: 8, color: "#ede9fe" },
    ];

    const recentTipsTransactions = await prisma.tip.findMany({
      where: { recipientUserId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        amount: true,
        tipperName: true,
        createdAt: true,
        paymentStatus: true,
      },
    });

    const formattedTransactions = recentTipsTransactions.map((tip) => ({
      id: tip.id,
      type: "tip_received" as const,
      amount: tip.amount,
      status: tip.paymentStatus,
      createdAt: tip.createdAt.toISOString(),
      description: `Tip from ${tip.tipperName}`,
    }));

    const walletBalance = user.totalTipsReceived - user.totalWithdrawn;

    const dashboardData = {
      user: {
        displayName: user.displayName,
        tipTag: user.tipTag,
        avatarUrl: user.avatarUrl,
        totalTipsReceived: user.totalTipsReceived,
        totalTipCount: user.totalTipCount,
        walletAddress: user.walletAddress,
        walletBalance: walletBalance,
      },
      analytics: {
        monthlyTips: monthlyTipsAmount,
        profileViews: user.profileViews || 0,
        conversionRate:
          user.profileViews > 0
            ? (user.totalTipCount / user.profileViews) * 100
            : 0,
        averageTip:
          user.totalTipCount > 0
            ? user.totalTipsReceived / user.totalTipCount
            : 0,
      },
      currentGoal: user.goals[0] || null,
      recentTips: user.tips.map((tip) => ({
        id: tip.id,
        amount: tip.amount,
        message: tip.message,
        tipperName: tip.tipperName,
        createdAt: tip.createdAt.toISOString(),
        isHighlighted: tip.amount >= 50,
      })),
      topTippers: topTippers.map((tipper) => ({
        name: tipper.tipperName,
        amount: tipper._sum.amount || 0,
        tipCount: tipper._count.id,
        badge:
          tipper._sum.amount && tipper._sum.amount > 0
            ? topTippers.findIndex(
                (t) => t.tipperName === tipper.tipperName
              ) === 0
              ? "Gold"
              : topTippers.findIndex(
                  (t) => t.tipperName === tipper.tipperName
                ) === 1
              ? "Silver"
              : topTippers.findIndex(
                  (t) => t.tipperName === tipper.tipperName
                ) === 2
              ? "Bronze"
              : undefined
            : undefined,
      })),
      tipsOverTime,
      geographicData,
      recentTransactions: formattedTransactions,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
