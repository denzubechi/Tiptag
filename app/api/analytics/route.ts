import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { requireAuth } from "@/lib/auth";
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";

    // Calculate date range
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

    // Get user data
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

    // Calculate metrics
    const totalRevenue = user.tips.reduce((sum, tip) => sum + tip.amount, 0);
    const totalTips = user.tips.length;
    const profileViews =
      user.analytics.reduce(
        (sum, analytics) => sum + analytics.profileViews,
        0
      ) || user.profileViews;
    const tipPageViews = user.analytics.reduce(
      (sum, analytics) => sum + analytics.tipPageViews,
      0
    );
    const conversionRate =
      profileViews > 0 ? (totalTips / profileViews) * 100 : 0;
    const averageTipAmount = totalTips > 0 ? totalRevenue / totalTips : 0;

    // Calculate growth rates (mock for now - would need historical data)
    const revenueGrowth = Math.random() * 40 - 10; // -10% to +30%
    const viewsGrowth = Math.random() * 30 - 5; // -5% to +25%
    const conversionGrowth = Math.random() * 20 - 5; // -5% to +15%
    const tipAmountGrowth = Math.random() * 15 - 7.5; // -7.5% to +7.5%

    // Generate tips over time data
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

      const dayTips = user.tips.filter((tip) => {
        const tipDate = new Date(tip.createdAt);
        return tipDate.toDateString() === date.toDateString();
      });

      tipsOverTime.push({
        date: date.toISOString().split("T")[0],
        tips: dayTips.length,
        amount: dayTips.reduce((sum, tip) => sum + tip.amount, 0),
        views: Math.floor(Math.random() * 100) + 50, // Mock data
      });
    }

    // Generate hourly data
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourTips = user.tips.filter((tip) => {
        const tipHour = new Date(tip.createdAt).getHours();
        return tipHour === hour;
      });

      hourlyData.push({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        tips: hourTips.length,
      });
    }

    // Mock referrer data (would come from analytics)
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

    // Mock device data
    const deviceData = [
      { name: "Mobile", value: 65, color: "#8b5cf6" },
      { name: "Desktop", value: 28, color: "#06b6d4" },
      { name: "Tablet", value: 7, color: "#10b981" },
    ];

    // Mock geographic data
    const geographicData = [
      {
        country: "United States",
        flag: "🇺🇸",
        percentage: 45,
        tips: Math.floor(totalTips * 0.45),
        amount: totalRevenue * 0.45,
      },
      {
        country: "Canada",
        flag: "🇨🇦",
        percentage: 20,
        tips: Math.floor(totalTips * 0.2),
        amount: totalRevenue * 0.2,
      },
      {
        country: "United Kingdom",
        flag: "🇬🇧",
        percentage: 15,
        tips: Math.floor(totalTips * 0.15),
        amount: totalRevenue * 0.15,
      },
      {
        country: "Germany",
        flag: "🇩🇪",
        percentage: 12,
        tips: Math.floor(totalTips * 0.12),
        amount: totalRevenue * 0.12,
      },
      {
        country: "Australia",
        flag: "🇦🇺",
        percentage: 8,
        tips: Math.floor(totalTips * 0.08),
        amount: totalRevenue * 0.08,
      },
    ];

    // Top content performance
    const topContent = [
      {
        title: "Profile Page",
        views: profileViews,
        tips: totalTips,
        conversion: conversionRate,
      },
      ...user.links.map((link) => ({
        title: link.title,
        views: link.clicks,
        tips: Math.floor(link.clicks * 0.05), // 5% conversion
        conversion:
          link.clicks > 0
            ? (Math.floor(link.clicks * 0.05) / link.clicks) * 100
            : 0,
      })),
    ]
      .sort((a, b) => b.conversion - a.conversion)
      .slice(0, 5);

    // Goal performance
    const goalPerformance = user.goals.map((goal) => ({
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
      completedAt: goal.completedAt?.toISOString(),
    }));

    const analyticsData = {
      totalRevenue,
      totalTips,
      profileViews,
      conversionRate,
      averageTipAmount,
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
