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

    // Get tips data
    const tips = await prisma.tip.findMany({
      where: {
        recipientUserId: userId,
        createdAt: {
          gte: startDate,
          lte: now,
        },
        paymentStatus: "completed",
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV content
    const csvHeaders = [
      "Date",
      "Amount",
      "Currency",
      "Tipper Name",
      "Message",
      "Payment Provider",
      "Transaction Hash",
    ];

    const csvRows = tips.map((tip) => [
      tip.createdAt.toISOString().split("T")[0],
      tip.amount.toString(),
      tip.currency,
      tip.tipperName,
      tip.message || "",
      tip.paymentProvider,
      tip.transactionHash || "",
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="analytics-${timeRange}.csv"`,
      },
    });
  } catch (error) {
    console.error("Analytics export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
