import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        tipsReceived: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        tippingGoals: {
          where: { isActive: true },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate analytics
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlyTips = await prisma.tip.aggregate({
      where: {
        recipientUserId: user.id,
        createdAt: { gte: startOfMonth },
        paymentStatus: "completed",
      },
      _sum: { amount: true },
    })

    // Get tips over time (last 6 months)
    const tipsOverTime = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const monthlyTotal = await prisma.tip.aggregate({
        where: {
          recipientUserId: user.id,
          createdAt: { gte: date, lt: nextDate },
          paymentStatus: "completed",
        },
        _sum: { amount: true },
      })

      tipsOverTime.push({
        date: date.toLocaleDateString("en-US", { month: "short" }),
        amount: monthlyTotal._sum.amount || 0,
      })
    }

    // Get top tippers
    const topTippers = await prisma.tip.groupBy({
      by: ["tipperName"],
      where: {
        recipientUserId: user.id,
        paymentStatus: "completed",
      },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    })

    // Mock geographic data (in real app, this would be calculated from tip locations)
    const geographicData = [
      { country: "United States", percentage: 45, color: "#8b5cf6" },
      { country: "Canada", percentage: 20, color: "#a78bfa" },
      { country: "United Kingdom", percentage: 15, color: "#c4b5fd" },
      { country: "Germany", percentage: 12, color: "#ddd6fe" },
      { country: "Others", percentage: 8, color: "#ede9fe" },
    ]

    // Get recent transactions
    const recentTransactions = await prisma.tip.findMany({
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
    })

    const formattedTransactions = recentTransactions.map((tip) => ({
      id: tip.id,
      type: "tip_received" as const,
      amount: tip.amount,
      status: tip.paymentStatus,
      createdAt: tip.createdAt.toISOString(),
      description: `Tip from ${tip.tipperName}`,
    }))

    const dashboardData = {
      user: {
        displayName: user.displayName,
        tipTag: user.tipTag,
        avatarUrl: user.avatarUrl,
        totalTipsReceived: user.totalTipsReceived,
        totalTipCount: user.totalTipCount,
        walletAddress: user.walletAddress,
        walletBalance: user.totalTipsReceived, // In real app, this would be calculated after withdrawals
      },
      analytics: {
        monthlyTips: monthlyTips._sum.amount || 0,
        profileViews: user.profileViews || 0,
        conversionRate: user.totalTipCount > 0 ? (user.totalTipCount / (user.profileViews || 1)) * 100 : 0,
        averageTip: user.totalTipCount > 0 ? user.totalTipsReceived / user.totalTipCount : 0,
      },
      currentGoal: user.tippingGoals[0] || null,
      recentTips: user.tipsReceived.map((tip) => ({
        id: tip.id,
        amount: tip.amount,
        message: tip.message,
        tipperName: tip.tipperName,
        createdAt: tip.createdAt.toISOString(),
        isHighlighted: tip.amount >= 50, // Highlight tips >= $50
      })),
      topTippers: topTippers.map((tipper, index) => ({
        name: tipper.tipperName,
        amount: tipper._sum.amount || 0,
        tipCount: tipper._count.id,
        badge: index === 0 ? "Gold" : index === 1 ? "Silver" : index === 2 ? "Bronze" : undefined,
      })),
      tipsOverTime,
      geographicData,
      recentTransactions: formattedTransactions,
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
