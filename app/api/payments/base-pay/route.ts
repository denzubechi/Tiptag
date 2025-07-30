import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { amount, tipTag, message, tipperName, tipperLocation } = await request.json()

    // Validation
    if (!amount || !tipTag || amount < 1) {
      return NextResponse.json({ error: "Invalid payment data" }, { status: 400 })
    }

    // Find recipient user
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

    // Create payment intent (Base Pay integration)
    const paymentIntent = {
      id: `bp_${Date.now()}`,
      amount: amount * 100, // Convert to cents
      currency: "USD",
      status: "requires_payment_method",
      client_secret: `bp_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      payment_url: `https://checkout.base.org/pay/${Date.now()}`,
    }

    // Create tip record
    const tip = await prisma.tip.create({
      data: {
        recipientUserId: recipient.id,
        amount,
        message: message || null,
        tipperName: tipperName || "Anonymous",
        paymentProviderId: paymentIntent.id,
        paymentStatus: "pending",
        tipperLocation: tipperLocation || null,
        goalId: activeGoal?.id || null,
      },
    })

    return NextResponse.json({
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        payment_url: paymentIntent.payment_url,
      },
      tipId: tip.id,
    })
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
