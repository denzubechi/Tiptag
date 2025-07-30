import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as any;
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        links: {
          orderBy: { displayOrder: "asc" },
        },
        socialMedia: {
          orderBy: { displayOrder: "asc" },
        },
        blogPosts: {
          orderBy: { createdAt: "desc" },
        },
        goals: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        displayName: user.displayName,
        bio: user.bio,
        tipTag: user.tipTag,
        avatarUrl: user.avatarUrl,
        thankYouMessage: user.thankYouMessage,
        redirectUrl: user.redirectUrl,
        allowPublicMessages: user.allowPublicMessages,
        publicProfile: user.publicProfile,
        customTheme: user.customTheme,
        totalTipsReceived: user.totalTipsReceived,
        totalTipCount: user.totalTipCount,
        profileViews: user.profileViews,
      },
      links: user.links,
      socialMedia: user.socialMedia,
      blogPosts: user.blogPosts,
      currentGoal: user.goals[0] || null,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as any;
    const userId = decoded.userId;

    const { profile, links, socialMedia, blogPosts, currentGoal } =
      await request.json();

    // Update user profile
    await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: profile.displayName,
        bio: profile.bio,
        tipTag: profile.tipTag,
        avatarUrl: profile.avatarUrl,
        thankYouMessage: profile.thankYouMessage,
        redirectUrl: profile.redirectUrl,
        allowPublicMessages: profile.allowPublicMessages,
        publicProfile: profile.publicProfile,
        customTheme: profile.customTheme,
        updatedAt: new Date(),
      },
    });

    // Update links
    await prisma.creatorLink.deleteMany({ where: { userId } });
    if (links && links.length > 0) {
      await prisma.creatorLink.createMany({
        data: links
          .filter((link: any) => link.title && link.url)
          .map((link: any, index: number) => ({
            userId,
            title: link.title,
            url: link.url,
            description: link.description || null,
            linkType: link.linkType,
            displayOrder: index,
            isActive: link.isActive,
          })),
      });
    }

    // Update social media
    await prisma.creatorSocialMedia.deleteMany({ where: { userId } });
    if (socialMedia && socialMedia.length > 0) {
      await prisma.creatorSocialMedia.createMany({
        data: socialMedia
          .filter(
            (social: any) => social.platform && social.handle && social.url
          )
          .map((social: any, index: number) => ({
            userId,
            platform: social.platform,
            handle: social.handle,
            url: social.url,
            displayOrder: index,
            isActive: social.isActive,
          })),
      });
    }

    // Update blog posts
    await prisma.blogPost.deleteMany({ where: { userId } });
    if (blogPosts && blogPosts.length > 0) {
      await prisma.blogPost.createMany({
        data: blogPosts
          .filter((post: any) => post.title && post.content)
          .map((post: any) => ({
            userId,
            title: post.title,
            content: post.content,
            isPublic: post.isPublic,
          })),
      });
    }

    // Update current goal
    await prisma.tippingGoal.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    if (currentGoal && currentGoal.title) {
      if (currentGoal.id && !currentGoal.id.startsWith("temp-")) {
        await prisma.tippingGoal.update({
          where: { id: currentGoal.id },
          data: {
            title: currentGoal.title,
            description: currentGoal.description,
            targetAmount: currentGoal.targetAmount,
            isActive: currentGoal.isActive,
            isPublic: currentGoal.isPublic,
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.tippingGoal.create({
          data: {
            userId,
            title: currentGoal.title,
            description: currentGoal.description || null,
            targetAmount: currentGoal.targetAmount,
            currentAmount: currentGoal.currentAmount || 0,
            isActive: currentGoal.isActive,
            isPublic: currentGoal.isPublic,
          },
        });
      }
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
