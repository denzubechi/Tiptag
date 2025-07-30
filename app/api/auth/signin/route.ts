import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { generateToken, AuthUser } from "@/lib/auth";
export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    // Validation
    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Find user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this wallet address" },
        { status: 401 }
      );
    }

    // // Check if email is verified
    // if (!user.isVerified) {
    //   return NextResponse.json(
    //     { error: "Please verify your email before signing in" },
    //     { status: 401 }
    //   );
    // }

    const authUserPayload: AuthUser = {
      userId: user.id,
      email: user.email,
      tipTag: user.tipTag,
      walletAddress: user.walletAddress || "",
    };

    const token = generateToken(authUserPayload);

    const response = NextResponse.json({
      message: "Sign in successful",
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        tipTag: user.tipTag,
        walletAddress: user.walletAddress,
      },
    });

    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 10 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
