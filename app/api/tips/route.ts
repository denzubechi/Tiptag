import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendTipNotificationEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { tipTag, amount, message, tipperName, tipperEmail, transactionHash, paymentProvider } = await request.json()

    // Find recipient
    const recipient = await prisma.user.findUnique({
      where: { tipTag },
    })

    if (!recipient) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 })
    }

    // Check if there's an active goal
    const activeGoal = await prisma.tippingGoal.findFirst({
      where: {
        userId: recipient.id,
        isActive: true,
      },
    })

    // Create tip record
    const tip = await prisma.tip.create({
      data: {
        recipientUserId: recipient.id,
        amount,
        message: message || null,
        tipperName: tipperName || "Anonymous",
        tipperEmail: tipperEmail || null,
        paymentProviderId: transactionHash,
        paymentProvider: paymentProvider || "base-pay",
        paymentStatus: "completed",
        paymentCompletedAt: new Date(),
        goalId: activeGoal?.id || null,
      },
    })

    // Update user totals
    await prisma.user.update({
      where: { id: recipient.id },
      data: {
        totalTipsReceived: {
          increment: amount,
        },
        totalTipCount: {
          increment: 1,
        },
      },
    })

    // Update goal if applicable
    if (activeGoal) {
      await prisma.tippingGoal.update({
        where: { id: activeGoal.id },
        data: {
          currentAmount: {
            increment: amount,
          },
        },
      })
    }

    // Send notification email to creator
    try {
      await sendTipNotificationEmail(
        recipient.email,
        recipient.displayName,
        amount,
        message || "",
        tipperName || "Anonymous",
      )
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      tipId: tip.id,
    })
  } catch (error) {
    console.error("Tip creation error:", error)
    return NextResponse.json({ error: "Failed to process tip" }, { status: 500 })
  }
}
