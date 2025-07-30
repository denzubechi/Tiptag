import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { tipTag: string } }
) {
  try {
    const { tipTag } = params;

    // Find creator by tip tag
    const creator = await prisma.user.findUnique({
      where: { tipTag },
      include: {
        goals: {
          where: { isActive: true, isPublic: true },
          take: 1,
        },
      },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Increment profile views
    await prisma.user.update({
      where: { id: creator.id },
      data: { profileViews: { increment: 1 } },
    });

    const response = {
      creator: {
        id: creator.id,
        displayName: creator.displayName,
        bio: creator.bio,
        avatarUrl: creator.avatarUrl,
        tipTag: creator.tipTag,
        totalTipCount: creator.totalTipCount,
        isVerified: creator.isVerified,
        walletAddress: creator.walletAddress,
        customTheme: creator.customTheme,
      },
      currentGoal: creator.goals[0] || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Creator fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
