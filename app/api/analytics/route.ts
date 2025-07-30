import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { requireAuth } from "@/lib/auth";
export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";

    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tips: {
          where: {
            createdAt: {
              gte: startDate,
              lte: now,
            },
            paymentStatus: "completed",
          },
          orderBy: { createdAt: "desc" },
        },
        goals: {
          orderBy: { createdAt: "desc" },
        },
        links: {
          where: { isActive: true },
        },
        analytics: {
          where: {
            date: {
              gte: startDate,
              lte: now,
            },
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const serializableTips = user.tips.map((tip) => ({
      id: tip.id,
      amount: tip.amount,
      currency: tip.currency,
      message: tip.message,
      paymentStatus: tip.paymentStatus,
      createdAt: tip.createdAt.toISOString(),
    }));

    const serializableGoals = user.goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      isActive: goal.isActive,
      createdAt: goal.createdAt.toISOString(),
      completedAt: goal.completedAt ? goal.completedAt.toISOString() : null,
    }));

    const serializableLinks = user.links.map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      clicks: link.clicks,
      isActive: link.isActive,
      createdAt: link.createdAt.toISOString(),
    }));

    const serializableAnalytics = user.analytics.map((analytic) => ({
      id: analytic.id,
      date: analytic.date.toISOString(),
      profileViews: analytic.profileViews,
      tipPageViews: analytic.tipPageViews,
    }));

    const totalRevenue = serializableTips.reduce(
      (sum, tip) => sum + tip.amount,
      0
    );
    const totalTips = serializableTips.length;
    const profileViews =
      serializableAnalytics.reduce(
        (sum, analytics) => sum + analytics.profileViews,
        0
      ) || user.profileViews;
    const tipPageViews = serializableAnalytics.reduce(
      (sum, analytics) => sum + analytics.tipPageViews,
      0
    );
    const conversionRate =
      profileViews > 0 ? (totalTips / profileViews) * 100 : 0;
    const averageTipAmount = totalTips > 0 ? totalRevenue / totalTips : 0;

    const revenueGrowth = parseFloat((Math.random() * 40 - 10).toFixed(2));
    const viewsGrowth = parseFloat((Math.random() * 30 - 5).toFixed(2));
    const conversionGrowth = parseFloat((Math.random() * 20 - 5).toFixed(2));
    const tipAmountGrowth = parseFloat((Math.random() * 15 - 7.5).toFixed(2));

    const tipsOverTime = [];
    const days =
      timeRange === "7d"
        ? 7
        : timeRange === "30d"
        ? 30
        : timeRange === "90d"
        ? 90
        : 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dayTips = serializableTips.filter((tip) => {
        const tipDate = new Date(tip.createdAt);
        return tipDate.toDateString() === date.toDateString();
      });

      tipsOverTime.push({
        date: date.toISOString().split("T")[0],
        tips: dayTips.length,
        amount: dayTips.reduce((sum, tip) => sum + tip.amount, 0),
        views: Math.floor(Math.random() * 100) + 50,
      });
    }

    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourTips = serializableTips.filter((tip) => {
        const tipHour = new Date(tip.createdAt).getHours();
        return tipHour === hour;
      });

      hourlyData.push({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        tips: hourTips.length,
      });
    }

    const topReferrers = [
      {
        source: "Direct",
        visitors: Math.floor(profileViews * 0.35),
        percentage: 35,
      },
      {
        source: "Twitter",
        visitors: Math.floor(profileViews * 0.25),
        percentage: 25,
      },
      {
        source: "YouTube",
        visitors: Math.floor(profileViews * 0.19),
        percentage: 19,
      },
      {
        source: "Instagram",
        visitors: Math.floor(profileViews * 0.12),
        percentage: 12,
      },
      {
        source: "Other",
        visitors: Math.floor(profileViews * 0.09),
        percentage: 9,
      },
    ];

    const deviceData = [
      { name: "Mobile", value: 65, color: "#8b5cf6" },
      { name: "Desktop", value: 28, color: "#06b6d4" },
      { name: "Tablet", value: 7, color: "#10b981" },
    ];

    const geographicData = [
      {
        country: "United States",
        flag: "🇺🇸",
        percentage: 45,
        tips: Math.floor(totalTips * 0.45),
        amount: parseFloat((totalRevenue * 0.45).toFixed(2)),
      },
      {
        country: "Canada",
        flag: "🇨🇦",
        percentage: 20,
        tips: Math.floor(totalTips * 0.2),
        amount: parseFloat((totalRevenue * 0.2).toFixed(2)),
      },
      {
        country: "United Kingdom",
        flag: "🇬🇧",
        percentage: 15,
        tips: Math.floor(totalTips * 0.15),
        amount: parseFloat((totalRevenue * 0.15).toFixed(2)),
      },
      {
        country: "Germany",
        flag: "🇩🇪",
        percentage: 12,
        tips: Math.floor(totalTips * 0.12),
        amount: parseFloat((totalRevenue * 0.12).toFixed(2)),
      },
      {
        country: "Australia",
        flag: "🇦🇺",
        percentage: 8,
        tips: Math.floor(totalTips * 0.08),
        amount: parseFloat((totalRevenue * 0.08).toFixed(2)),
      },
    ];

    const topContent = [
      {
        title: "Profile Page",
        views: profileViews,
        tips: totalTips,
        conversion: parseFloat(conversionRate.toFixed(2)),
      },
      ...serializableLinks.map((link) => ({
        title: link.title,
        views: link.clicks,
        tips: Math.floor(link.clicks * 0.05),
        conversion:
          link.clicks > 0
            ? parseFloat(
                ((Math.floor(link.clicks * 0.05) / link.clicks) * 100).toFixed(
                  2
                )
              )
            : 0,
      })),
    ]
      .sort((a, b) => b.conversion - a.conversion)
      .slice(0, 5);

    const goalPerformance = serializableGoals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      status:
        goal.currentAmount >= goal.targetAmount
          ? "completed"
          : goal.isActive
          ? "active"
          : "inactive",
      completedAt: goal.completedAt,
    }));

    const analyticsData = {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalTips,
      profileViews,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      averageTipAmount: parseFloat(averageTipAmount.toFixed(2)),
      revenueGrowth,
      viewsGrowth,
      conversionGrowth,
      tipAmountGrowth,
      tipsOverTime,
      topReferrers,
      deviceData,
      geographicData,
      hourlyData,
      topContent,
      goalPerformance,
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: (error as Error).message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
