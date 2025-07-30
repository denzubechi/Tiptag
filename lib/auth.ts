import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

export interface AuthUser {
  userId: string;
  email: string;
  tipTag: string;
  walletAddress: string;
}

export async function requireAuth(request: NextRequest): Promise<string> {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      throw new Error("Authentication required");
    }

    const jwtSecret =
      process.env.JWT_SECRET || "your-super-secret-jwt-key-here";
    if (!jwtSecret) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, jwtSecret) as AuthUser;

    if (!decoded.userId) {
      throw new Error("Invalid token payload");
    }

    return decoded.userId;
  } catch (error) {
    console.error("Authentication error:", error);
    throw new Error("Authentication required");
  }
}

export async function getAuthUser(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) return null;

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return null;

    const decoded = jwt.verify(token, jwtSecret) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function generateToken(user: AuthUser): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET not configured");
  }

  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      tipTag: user.tipTag,
      walletAdress: user.walletAddress,
    },
    jwtSecret,
    { expiresIn: "10d" }
  );
}
