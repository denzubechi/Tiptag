import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

import { requireAuth } from "@/lib/auth";
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth(request);

    const { amount, walletAddress } = await request.json();

    if (!amount || !walletAddress) {
      return NextResponse.json(
        { error: "Amount and wallet address are required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has sufficient balance
    if (user.totalTipsReceived < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Initiate a blockchain transaction to send funds to the user's wallet
    // 2. Create a withdrawal record with pending status
    // 3. Update the record when the transaction is confirmed

    // For now, we'll simulate a successful withdrawal
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: user.id,
        amount,
        walletAddress,
        status: "completed",
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock transaction hash
        completedAt: new Date(),
      },
    });

    // Update user's available balance (subtract withdrawn amount)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalWithdrawn: {
          increment: amount,
        },
      },
    });

    return NextResponse.json({
      success: true,
      withdrawalId: withdrawal.id,
      transactionHash: withdrawal.transactionHash,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
