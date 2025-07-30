import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, tipTag, walletAddress } = await request.json();

    // Validation
    if (!email || !displayName || !tipTag || !walletAddress) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists by email or wallet
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { walletAddress }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email or wallet" },
        { status: 400 }
      );
    }

    // Check if tip tag is taken
    const existingTipTag = await prisma.user.findUnique({
      where: { tipTag },
    });

    if (existingTipTag) {
      return NextResponse.json(
        { error: "Tip tag is already taken" },
        { status: 400 }
      );
    }

    // Generate verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        displayName,
        tipTag,
        walletAddress,
        isVerified: false,
      },
    });

    // Store verification code
    await prisma.emailVerificationCode.create({
      data: {
        email,
        code: verificationCode,
        expiresAt: expires,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, displayName, verificationCode);

    // Send welcome email (will be sent after verification)
    setTimeout(async () => {
      await sendWelcomeEmail(email, displayName, tipTag);
    }, 1000);

    return NextResponse.json({
      message:
        "User created successfully. Please check your email for verification.",
      userId: newUser.id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
