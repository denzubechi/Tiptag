import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const userId = decoded.userId

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get analytics data
    const [tips, analytics, goals] = await Promise.all([
      // Tips data
      prisma.tip.findMany({
        where: {
          recipientUserId: userId,
          paymentStatus: "completed",
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),

      // Analytics data
      prisma.analytics.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 30,
      }),

      // Goals data
      prisma.tippingGoal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ])

    // Calculate metrics
    const totalTips = tips.reduce((sum, tip) => sum + tip.amount, 0)
    const tipCount = tips.length
    const averageTip = tipCount > 0 ? totalTips / tipCount : 0

    // Monthly data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const monthlyTips = tips.filter((tip) => new Date(tip.createdAt) > thirtyDaysAgo)
    const monthlyTotal = monthlyTips.reduce((sum, tip) => sum + tip.amount, 0)

    // Profile views
    const totalViews = analytics.reduce((sum, day) => sum + day.profileViews, 0)
    const conversionRate = totalViews > 0 ? (tipCount / totalViews) * 100 : 0

    // Top tippers
    const tipperStats = tips.reduce(
      (acc, tip) => {
        const name = tip.tipperName || "Anonymous"
        if (!acc[name]) {
          acc[name] = { name, amount: 0, count: 0 }
        }
        acc[name].amount += tip.amount
        acc[name].count += 1
        return acc
      },
      {} as Record<string, { name: string; amount: number; count: number }>,
    )

    const topTippers = Object.values(tipperStats)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Geographic data
    const geoData = tips.reduce(
      (acc, tip) => {
        if (tip.tipperLocation) {
          const location = tip.tipperLocation as any
          const country = location.country || "Unknown"
          if (!acc[country]) {
            acc[country] = 0
          }
          acc[country] += tip.amount
        }
        return acc
      },
      {} as Record<string, number>,
    )

    return NextResponse.json({
      overview: {
        totalTips,
        monthlyTips: monthlyTotal,
        tipCount,
        averageTip,
        profileViews: totalViews,
        conversionRate,
      },
      tips: tips.slice(0, 10), // Recent tips
      topTippers,
      geoData,
      goals,
      analytics: analytics.slice(0, 7), // Last 7 days
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
