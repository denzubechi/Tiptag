"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ExternalLink,
  Youtube,
  Twitter,
  Instagram,
  Github,
  Globe,
  CheckCircle,
  DollarSign,
} from "lucide-react";

export default function CreatorProfilePage() {
  const params = useParams();
  const tipTag = params.tipTag as string;

  // Mock creator data - in real app, this would be fetched based on tipTag
  const creator = {
    displayName: "Alex Creator",
    bio: "Full-stack developer, content creator, and educator. I create tutorials on web development, share coding tips, and build open-source projects. Thanks for being part of my journey! 🚀",
    avatar: "/placeholder.svg?height=150&width=150",
    tipTag: tipTag,
    isVerified: true,
    totalTips: 1247,
    links: [
      { title: "My Portfolio", url: "https://alexcreator.dev", icon: Globe },
      {
        title: "YouTube Channel",
        url: "https://youtube.com/@alexcreator",
        icon: Youtube,
      },
      {
        title: "Latest Course",
        url: "https://course.alexcreator.dev",
        icon: ExternalLink,
      },
      {
        title: "GitHub Projects",
        url: "https://github.com/alexcreator",
        icon: Github,
      },
    ],
    socialMedia: [
      {
        platform: "Twitter",
        handle: "@alexcreator",
        url: "https://twitter.com/alexcreator",
        icon: Twitter,
      },
      {
        platform: "Instagram",
        handle: "@alex.creator",
        url: "https://instagram.com/alex.creator",
        icon: Instagram,
      },
      {
        platform: "YouTube",
        handle: "@alexcreator",
        url: "https://youtube.com/@alexcreator",
        icon: Youtube,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-2xl mx-auto p-4 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-8 text-center">
            <Avatar className="h-32 w-32 mx-auto mb-4">
              <AvatarImage src={creator.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">
                {creator.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center justify-center space-x-2 mb-2">
              <h1 className="text-3xl font-bold">{creator.displayName}</h1>
              {creator.isVerified && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <p className="text-gray-600 mb-4">@{creator.tipTag}</p>

            <p className="text-gray-700 mb-6 leading-relaxed">{creator.bio}</p>

            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Heart className="h-4 w-4 text-red-500" />
                <span>{creator.totalTips} tips received</span>
              </div>
            </div>

            {/* Tip Button */}
            <Link href={`/tip/${creator.tipTag}`}>
              <Button size="lg" className="w-full sm:w-auto px-8 py-3 text-lg">
                <DollarSign className="h-5 w-5 mr-2" />
                Send a Tip
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Links Section */}
        {creator.links.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-center">
                My Work & Projects
              </h2>
              <div className="space-y-3">
                {creator.links.map((link, index) => {
                  const IconComponent = link.icon;
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{link.title}</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    </a>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Media Section */}
        {creator.socialMedia.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Connect With Me
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {creator.socialMedia.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <IconComponent className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm">{social.platform}</p>
                        <p className="text-xs text-gray-600">{social.handle}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Support Section */}
        <Card>
          <CardContent className="pt-6 text-center">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Support My Work</h2>
            <p className="text-gray-600 mb-4">
              Your tips help me create more content and continue sharing
              knowledge with the community.
            </p>
            <Link href={`/tip/${creator.tipTag}`}>
              <Button size="lg" className="px-8">
                <DollarSign className="h-5 w-5 mr-2" />
                Send a Tip
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            Powered by{" "}
            <Link
              href="/"
              className="font-semibold text-purple-600 hover:underline"
            >
              tiptag
            </Link>
          </p>
          <p className="mt-1">Create your own tip page today</p>
        </div>
      </div>
    </div>
  );
}
