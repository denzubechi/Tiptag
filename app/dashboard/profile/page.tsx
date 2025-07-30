"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Save,
  Upload,
  ExternalLink,
  Palette,
  Youtube,
  Music,
  Twitch,
  Instagram,
  Twitter,
  Globe,
  Edit,
  Sparkles,
  Target,
  MessageCircle,
  Loader2,
} from "lucide-react";

interface UserProfile {
  id: string;
  displayName: string;
  bio: string;
  tipTag: string;
  avatarUrl?: string;
  thankYouMessage?: string;
  redirectUrl?: string;
  allowPublicMessages: boolean;
  publicProfile: boolean;
  customTheme?: any;
  totalTipsReceived: number;
  totalTipCount: number;
  profileViews: number;
}

interface CreatorLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  linkType: string;
  displayOrder: number;
  isActive: boolean;
  clicks: number;
}

interface SocialMedia {
  id: string;
  platform: string;
  handle: string;
  url: string;
  displayOrder: number;
  isActive: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  views: number;
  createdAt: string;
}

interface TippingGoal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  isActive: boolean;
  isPublic: boolean;
  deadline?: string;
}

export default function EnhancedProfileEditPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [uploading, setUploading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [customTheme, setCustomTheme] = useState({
    primaryColor: "#8b5cf6",
    secondaryColor: "#ec4899",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    fontFamily: "Inter",
    layout: "modern",
  });
  const [links, setLinks] = useState<CreatorLink[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [currentGoal, setCurrentGoal] = useState<TippingGoal | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setFetchingData(true);
      const response = await fetch("/api/profile", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data = await response.json();

      setProfileData(data.profile);
      setLinks(data.links || []);
      setSocialMedia(data.socialMedia || []);
      setBlogPosts(data.blogPosts || []);
      setCurrentGoal(data.currentGoal);

      if (data.profile.customTheme) {
        setCustomTheme(JSON.parse(data.profile.customTheme));
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      alert("Failed to load profile data");
    } finally {
      setFetchingData(false);
    }
  };

  const handleProfileChange = (field: string, value: string | boolean) => {
    if (!profileData) return;
    setProfileData((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : null
    );
  };

  const handleThemeChange = (field: string, value: string) => {
    setCustomTheme((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        handleProfileChange("avatarUrl", data.secure_url);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const addLink = () => {
    const newLink: CreatorLink = {
      id: `temp-${Date.now()}`,
      title: "",
      url: "",
      description: "",
      linkType: "custom",
      displayOrder: links.length,
      isActive: true,
      clicks: 0,
    };
    setLinks((prev) => [...prev, newLink]);
  };

  const updateLink = (
    index: number,
    field: string,
    value: string | boolean | number
  ) => {
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const addSocialMedia = () => {
    const newSocial: SocialMedia = {
      id: `temp-${Date.now()}`,
      platform: "",
      handle: "",
      url: "",
      displayOrder: socialMedia.length,
      isActive: true,
    };
    setSocialMedia((prev) => [...prev, newSocial]);
  };

  const updateSocialMedia = (
    index: number,
    field: string,
    value: string | boolean | number
  ) => {
    setSocialMedia((prev) =>
      prev.map((social, i) =>
        i === index ? { ...social, [field]: value } : social
      )
    );
  };

  const removeSocialMedia = (index: number) => {
    setSocialMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const addBlogPost = () => {
    const newPost: BlogPost = {
      id: `temp-${Date.now()}`,
      title: "",
      content: "",
      isPublic: true,
      views: 0,
      createdAt: new Date().toISOString(),
    };
    setBlogPosts((prev) => [...prev, newPost]);
  };

  const updateBlogPost = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    setBlogPosts((prev) =>
      prev.map((post, i) => (i === index ? { ...post, [field]: value } : post))
    );
  };

  const removeBlogPost = (index: number) => {
    setBlogPosts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!profileData) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          profile: {
            ...profileData,
            customTheme: JSON.stringify(customTheme),
          },
          links,
          socialMedia,
          blogPosts,
          currentGoal,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const linkTypeIcons = {
    youtube: Youtube,
    twitch: Twitch,
    spotify: Music,
    instagram: Instagram,
    twitter: Twitter,
    custom: Globe,
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white/70">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load profile data</p>
          <Button
            onClick={fetchProfileData}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-bounce" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-black/50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Palette className="h-6 w-6 text-purple-400" />
                <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Profile Editor
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href={`/tip/${profileData.tipTag}`}>
              <Button
                variant="outline"
                size="sm"
                className="text-white/80 border-white/20 hover:bg-white/10 bg-transparent"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-6 bg-white/5 backdrop-blur-sm border border-white/10">
                <TabsTrigger
                  value="basic"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-white/70"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Basic
                </TabsTrigger>
                <TabsTrigger
                  value="theme"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-white/70"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Theme
                </TabsTrigger>
                <TabsTrigger
                  value="links"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-white/70"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Links
                </TabsTrigger>
                <TabsTrigger
                  value="social"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-white/70"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Social
                </TabsTrigger>
                <TabsTrigger
                  value="blog"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-white/70"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Blog
                </TabsTrigger>
                <TabsTrigger
                  value="goals"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-white/70"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Goals
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Edit className="h-5 w-5 mr-2 text-purple-400" />
                      Basic Information
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Update your public profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24 ring-4 ring-purple-500/30">
                          <AvatarImage
                            src={profileData.avatarUrl || "/placeholder.svg"}
                          />
                          <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            {profileData.displayName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {uploading && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploading}
                          />
                          <Button
                            variant="outline"
                            className="text-white/80 border-white/20 hover:bg-white/10 bg-transparent"
                            disabled={uploading}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? "Uploading..." : "Upload New Picture"}
                          </Button>
                        </div>
                        <p className="text-xs text-white/50">
                          JPG, PNG or GIF. Max size 2MB. Recommended: 400x400px
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-white/90">
                          Display Name
                        </Label>
                        <Input
                          id="displayName"
                          value={profileData.displayName}
                          onChange={(e) =>
                            handleProfileChange("displayName", e.target.value)
                          }
                          placeholder="Your creator name"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tipTag" className="text-white/90">
                          Tip Tag
                        </Label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/20 bg-white/5 text-white/60 text-sm">
                            tiptagi.com/tip/
                          </span>
                          <Input
                            id="tipTag"
                            value={profileData.tipTag}
                            onChange={(e) =>
                              handleProfileChange("tipTag", e.target.value)
                            }
                            placeholder="yourname"
                            className="rounded-l-none bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500"
                          />
                        </div>
                        <p className="text-xs text-white/50">
                          This is your unique tip page URL
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-white/90">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) =>
                          handleProfileChange("bio", e.target.value)
                        }
                        placeholder="Tell your audience about yourself..."
                        rows={4}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500 resize-none"
                      />
                      <p className="text-xs text-white/50">
                        This will appear on your public profile
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="thankYouMessage"
                        className="text-white/90"
                      >
                        Custom Thank You Message
                      </Label>
                      <Textarea
                        id="thankYouMessage"
                        value={profileData.thankYouMessage || ""}
                        onChange={(e) =>
                          handleProfileChange("thankYouMessage", e.target.value)
                        }
                        placeholder="Thank your supporters with a personal message..."
                        rows={3}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500 resize-none"
                      />
                      <p className="text-xs text-white/50">
                        Shown to supporters after they send a tip
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="redirectUrl" className="text-white/90">
                        Post-Tip Redirect URL (Optional)
                      </Label>
                      <Input
                        id="redirectUrl"
                        value={profileData.redirectUrl || ""}
                        onChange={(e) =>
                          handleProfileChange("redirectUrl", e.target.value)
                        }
                        placeholder="https://example.com/thank-you"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500"
                      />
                      <p className="text-xs text-white/50">
                        Redirect supporters to a specific page after tipping
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <div>
                          <Label className="font-medium text-white">
                            Allow Public Messages
                          </Label>
                          <p className="text-sm text-white/60">
                            Let supporters leave public messages with their tips
                          </p>
                        </div>
                        <Switch
                          checked={profileData.allowPublicMessages}
                          onCheckedChange={(checked) =>
                            handleProfileChange("allowPublicMessages", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <div>
                          <Label className="font-medium text-white">
                            Public Profile
                          </Label>
                          <p className="text-sm text-white/60">
                            Make your profile discoverable in search
                          </p>
                        </div>
                        <Switch
                          checked={profileData.publicProfile}
                          onCheckedChange={(checked) =>
                            handleProfileChange("publicProfile", checked)
                          }
                        />
                      </div>
                    </div>

                    {/* Profile Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          ${profileData.totalTipsReceived.toFixed(2)}
                        </div>
                        <div className="text-sm text-white/60">
                          Total Received
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {profileData.totalTipCount}
                        </div>
                        <div className="text-sm text-white/60">Tips Count</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {profileData.profileViews}
                        </div>
                        <div className="text-sm text-white/60">
                          Profile Views
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Theme Customization Tab */}
              <TabsContent value="theme" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Palette className="h-5 w-5 mr-2 text-purple-400" />
                      Theme Customization
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Personalize the look and feel of your profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-white/90">Primary Color</Label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={customTheme.primaryColor}
                              onChange={(e) =>
                                handleThemeChange(
                                  "primaryColor",
                                  e.target.value
                                )
                              }
                              className="w-12 h-10 rounded border border-white/20 bg-transparent"
                            />
                            <Input
                              value={customTheme.primaryColor}
                              onChange={(e) =>
                                handleThemeChange(
                                  "primaryColor",
                                  e.target.value
                                )
                              }
                              className="flex-1 bg-white/5 border-white/20 text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white/90">
                            Secondary Color
                          </Label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={customTheme.secondaryColor}
                              onChange={(e) =>
                                handleThemeChange(
                                  "secondaryColor",
                                  e.target.value
                                )
                              }
                              className="w-12 h-10 rounded border border-white/20 bg-transparent"
                            />
                            <Input
                              value={customTheme.secondaryColor}
                              onChange={(e) =>
                                handleThemeChange(
                                  "secondaryColor",
                                  e.target.value
                                )
                              }
                              className="flex-1 bg-white/5 border-white/20 text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white/90">
                            Background Color
                          </Label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={customTheme.backgroundColor}
                              onChange={(e) =>
                                handleThemeChange(
                                  "backgroundColor",
                                  e.target.value
                                )
                              }
                              className="w-12 h-10 rounded border border-white/20 bg-transparent"
                            />
                            <Input
                              value={customTheme.backgroundColor}
                              onChange={(e) =>
                                handleThemeChange(
                                  "backgroundColor",
                                  e.target.value
                                )
                              }
                              className="flex-1 bg-white/5 border-white/20 text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-white/90">Font Family</Label>
                          <Select
                            value={customTheme.fontFamily}
                            onValueChange={(value) =>
                              handleThemeChange("fontFamily", value)
                            }
                          >
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/20">
                              <SelectItem value="Inter">
                                Inter (Modern)
                              </SelectItem>
                              <SelectItem value="Roboto">
                                Roboto (Clean)
                              </SelectItem>
                              <SelectItem value="Poppins">
                                Poppins (Friendly)
                              </SelectItem>
                              <SelectItem value="Playfair Display">
                                Playfair Display (Elegant)
                              </SelectItem>
                              <SelectItem value="Montserrat">
                                Montserrat (Bold)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white/90">Layout Style</Label>
                          <Select
                            value={customTheme.layout}
                            onValueChange={(value) =>
                              handleThemeChange("layout", value)
                            }
                          >
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/20">
                              <SelectItem value="modern">
                                Modern (Cards)
                              </SelectItem>
                              <SelectItem value="minimal">
                                Minimal (Clean)
                              </SelectItem>
                              <SelectItem value="creative">
                                Creative (Artistic)
                              </SelectItem>
                              <SelectItem value="professional">
                                Professional (Business)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <h4 className="font-medium mb-3 text-white">
                            Theme Preview
                          </h4>
                          <div
                            className="p-4 rounded-lg border-2"
                            style={{
                              backgroundColor: customTheme.backgroundColor,
                              borderColor: customTheme.primaryColor,
                              fontFamily: customTheme.fontFamily,
                            }}
                          >
                            <div
                              className="text-lg font-bold mb-2"
                              style={{ color: customTheme.primaryColor }}
                            >
                              {profileData.displayName}
                            </div>
                            <div
                              className="text-sm mb-2"
                              style={{ color: customTheme.textColor }}
                            >
                              Sample bio text goes here...
                            </div>
                            <div
                              className="inline-block px-3 py-1 rounded text-white text-sm"
                              style={{
                                backgroundColor: customTheme.secondaryColor,
                              }}
                            >
                              Tip Button
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Alert className="bg-purple-500/10 border-purple-500/30">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <AlertDescription className="text-purple-300">
                        Theme changes will be applied to your public profile and
                        tip page. Preview your changes before saving!
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Links Tab */}
              <TabsContent value="links" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <ExternalLink className="h-5 w-5 mr-2 text-purple-400" />
                      Work & Project Links
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Add links to your portfolio, content, and projects with
                      rich embeds
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {links.map((link, index) => {
                      const IconComponent =
                        linkTypeIcons[
                          link.linkType as keyof typeof linkTypeIcons
                        ] || Globe;
                      return (
                        <div
                          key={link.id}
                          className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-5 w-5 text-purple-400" />
                              <span className="font-medium text-white">
                                Link {index + 1}
                              </span>
                              {link.clicks > 0 && (
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  {link.clicks} clicks
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeLink(index)}
                              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-white/90">
                                Link Title
                              </Label>
                              <Input
                                placeholder="e.g., My Portfolio"
                                value={link.title}
                                onChange={(e) =>
                                  updateLink(index, "title", e.target.value)
                                }
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white/90">Link Type</Label>
                              <Select
                                value={link.linkType}
                                onValueChange={(value) =>
                                  updateLink(index, "linkType", value)
                                }
                              >
                                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/20">
                                  <SelectItem value="custom">
                                    Custom Link
                                  </SelectItem>
                                  <SelectItem value="youtube">
                                    YouTube
                                  </SelectItem>
                                  <SelectItem value="twitch">Twitch</SelectItem>
                                  <SelectItem value="spotify">
                                    Spotify
                                  </SelectItem>
                                  <SelectItem value="instagram">
                                    Instagram
                                  </SelectItem>
                                  <SelectItem value="twitter">
                                    Twitter
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white/90">URL</Label>
                            <Input
                              placeholder="https://example.com"
                              value={link.url}
                              onChange={(e) =>
                                updateLink(index, "url", e.target.value)
                              }
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white/90">
                              Description (Optional)
                            </Label>
                            <Input
                              placeholder="Brief description of this link"
                              value={link.description || ""}
                              onChange={(e) =>
                                updateLink(index, "description", e.target.value)
                              }
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={link.isActive}
                                onCheckedChange={(checked) =>
                                  updateLink(index, "isActive", checked)
                                }
                              />
                              <Label className="text-white/90">Active</Label>
                            </div>
                          </div>

                          {link.linkType !== "custom" && (
                            <Alert className="bg-blue-500/10 border-blue-500/30">
                              <IconComponent className="h-4 w-4 text-blue-400" />
                              <AlertDescription className="text-blue-300">
                                This link will display with rich embed preview
                                for {link.linkType} content.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      );
                    })}

                    <Button
                      variant="outline"
                      onClick={addLink}
                      className="w-full border-dashed border-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Link
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Media Tab */}
              <TabsContent value="social" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Twitter className="h-5 w-5 mr-2 text-purple-400" />
                      Social Media Accounts
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Connect your social media profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {socialMedia.map((social, index) => (
                      <div
                        key={social.id}
                        className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">
                            Social Account {index + 1}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSocialMedia(index)}
                            className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white/90">Platform</Label>
                            <Select
                              value={social.platform}
                              onValueChange={(value) =>
                                updateSocialMedia(index, "platform", value)
                              }
                            >
                              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-white/20">
                                <SelectItem value="Twitter">Twitter</SelectItem>
                                <SelectItem value="Instagram">
                                  Instagram
                                </SelectItem>
                                <SelectItem value="YouTube">YouTube</SelectItem>
                                <SelectItem value="TikTok">TikTok</SelectItem>
                                <SelectItem value="Twitch">Twitch</SelectItem>
                                <SelectItem value="Discord">Discord</SelectItem>
                                <SelectItem value="LinkedIn">
                                  LinkedIn
                                </SelectItem>
                                <SelectItem value="Facebook">
                                  Facebook
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white/90">Handle</Label>
                            <Input
                              placeholder="@username"
                              value={social.handle}
                              onChange={(e) =>
                                updateSocialMedia(
                                  index,
                                  "handle",
                                  e.target.value
                                )
                              }
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white/90">URL</Label>
                            <Input
                              placeholder="https://platform.com/username"
                              value={social.url}
                              onChange={(e) =>
                                updateSocialMedia(index, "url", e.target.value)
                              }
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={social.isActive}
                            onCheckedChange={(checked) =>
                              updateSocialMedia(index, "isActive", checked)
                            }
                          />
                          <Label className="text-white/90">Active</Label>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={addSocialMedia}
                      className="w-full border-dashed border-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Social Media Account
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Mini-Blog Tab */}
              <TabsContent value="blog" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <MessageCircle className="h-5 w-5 mr-2 text-purple-400" />
                      Mini-Blog Updates
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Share updates and news with your supporters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {blogPosts.map((post, index) => (
                      <div
                        key={post.id}
                        className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white">
                              Post {index + 1}
                            </span>
                            <Badge
                              className={
                                post.isPublic
                                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                                  : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                              }
                            >
                              {post.isPublic ? "Public" : "Draft"}
                            </Badge>
                            {post.views > 0 && (
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                {post.views} views
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeBlogPost(index)}
                            className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-white/90">Post Title</Label>
                            <Input
                              placeholder="What's new?"
                              value={post.title}
                              onChange={(e) =>
                                updateBlogPost(index, "title", e.target.value)
                              }
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white/90">Content</Label>
                            <Textarea
                              placeholder="Share your update with your supporters..."
                              value={post.content}
                              onChange={(e) =>
                                updateBlogPost(index, "content", e.target.value)
                              }
                              rows={4}
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={post.isPublic}
                                onCheckedChange={(checked) =>
                                  updateBlogPost(index, "isPublic", checked)
                                }
                              />
                              <Label className="text-white/90">
                                Make this post public
                              </Label>
                            </div>
                            <span className="text-sm text-white/50">
                              Created:{" "}
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={addBlogPost}
                      className="w-full border-dashed border-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Post
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Goals Tab */}
              <TabsContent value="goals" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Target className="h-5 w-5 mr-2 text-purple-400" />
                      Funding Goals
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Set and manage your funding objectives
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {currentGoal ? (
                      <div className="p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/30">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-indigo-300">
                            Current Active Goal
                          </h3>
                          <Badge className="bg-indigo-600 text-white">
                            {currentGoal.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-white/90">Goal Title</Label>
                            <Input
                              value={currentGoal.title}
                              onChange={(e) =>
                                setCurrentGoal((prev) =>
                                  prev
                                    ? { ...prev, title: e.target.value }
                                    : null
                                )
                              }
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white/90">Description</Label>
                            <Textarea
                              value={currentGoal.description || ""}
                              onChange={(e) =>
                                setCurrentGoal((prev) =>
                                  prev
                                    ? { ...prev, description: e.target.value }
                                    : null
                                )
                              }
                              rows={3}
                              className="bg-white/5 border-white/20 text-white resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-white/90">
                                Target Amount ($)
                              </Label>
                              <Input
                                type="number"
                                value={currentGoal.targetAmount}
                                onChange={(e) =>
                                  setCurrentGoal((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          targetAmount: Number(e.target.value),
                                        }
                                      : null
                                  )
                                }
                                className="bg-white/5 border-white/20 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white/90">
                                Current Amount ($)
                              </Label>
                              <Input
                                type="number"
                                value={currentGoal.currentAmount}
                                readOnly
                                className="bg-gray-800/50 border-white/10 text-white/60"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white/90">Progress</Label>
                            <div className="w-full bg-white/10 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    (currentGoal.currentAmount /
                                      currentGoal.targetAmount) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-sm text-indigo-300">
                              <span>
                                ${currentGoal.currentAmount.toFixed(2)} raised
                              </span>
                              <span>
                                {Math.round(
                                  (currentGoal.currentAmount /
                                    currentGoal.targetAmount) *
                                    100
                                )}
                                % complete
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-indigo-500/20">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={currentGoal.isActive}
                                  onCheckedChange={(checked) =>
                                    setCurrentGoal((prev) =>
                                      prev
                                        ? { ...prev, isActive: checked }
                                        : null
                                    )
                                  }
                                />
                                <Label className="text-white/90">
                                  Goal is active
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={currentGoal.isPublic}
                                  onCheckedChange={(checked) =>
                                    setCurrentGoal((prev) =>
                                      prev
                                        ? { ...prev, isPublic: checked }
                                        : null
                                    )
                                  }
                                />
                                <Label className="text-white/90">
                                  Show on public profile
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Target className="h-16 w-16 text-white/20 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white/60 mb-2">
                          No Active Goal
                        </h3>
                        <p className="text-white/40 mb-6">
                          Create a funding goal to rally your community around a
                          project
                        </p>
                        <Button
                          onClick={() =>
                            setCurrentGoal({
                              id: `temp-${Date.now()}`,
                              title: "",
                              description: "",
                              targetAmount: 100,
                              currentAmount: 0,
                              isActive: true,
                              isPublic: true,
                            })
                          }
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Goal
                        </Button>
                      </div>
                    )}

                    <Alert className="bg-purple-500/10 border-purple-500/30">
                      <Target className="h-4 w-4 text-purple-400" />
                      <AlertDescription className="text-purple-300">
                        Goals with progress bars encourage more tips and help
                        supporters understand what they're contributing towards.
                        Make sure to update your supporters when you reach
                        milestones!
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Eye className="h-5 w-5 mr-2 text-purple-400" />
                  Live Preview
                </CardTitle>
                <CardDescription className="text-white/60">
                  How your profile looks to visitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="p-4 rounded-xl border-2 space-y-4"
                  style={{
                    backgroundColor: customTheme.backgroundColor,
                    borderColor: customTheme.primaryColor,
                    fontFamily: customTheme.fontFamily,
                  }}
                >
                  {/* Profile Header */}
                  <div className="text-center space-y-3">
                    <Avatar className="h-16 w-16 mx-auto">
                      <AvatarImage
                        src={profileData.avatarUrl || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {profileData.displayName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3
                        className="font-bold text-lg"
                        style={{ color: customTheme.primaryColor }}
                      >
                        {profileData.displayName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        @{profileData.tipTag}
                      </p>
                    </div>

                    <p
                      className="text-sm line-clamp-3"
                      style={{ color: customTheme.textColor }}
                    >
                      {profileData.bio}
                    </p>

                    <button
                      className="w-full py-2 px-4 rounded-lg text-white font-medium text-sm"
                      style={{ backgroundColor: customTheme.secondaryColor }}
                    >
                      <Heart className="h-4 w-4 mr-2 inline" />
                      Send a Tip
                    </button>
                  </div>

                  {/* Current Goal Preview */}
                  {currentGoal &&
                    currentGoal.isPublic &&
                    currentGoal.isActive && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">
                          {currentGoal.title}
                        </h4>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              backgroundColor: customTheme.primaryColor,
                              width: `${Math.min(
                                (currentGoal.currentAmount /
                                  currentGoal.targetAmount) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>${currentGoal.currentAmount}</span>
                          <span>${currentGoal.targetAmount}</span>
                        </div>
                      </div>
                    )}

                  {/* Links Preview */}
                  <div className="space-y-2">
                    {links
                      .filter((link) => link.title && link.url && link.isActive)
                      .slice(0, 3)
                      .map((link, index) => {
                        const IconComponent =
                          linkTypeIcons[
                            link.linkType as keyof typeof linkTypeIcons
                          ] || Globe;
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
                          >
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-3 w-3 text-gray-400" />
                              <span className="truncate">{link.title}</span>
                            </div>
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                          </div>
                        );
                      })}
                  </div>

                  {/* Blog Posts Preview */}
                  {blogPosts.filter((post) => post.isPublic && post.title)
                    .length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Latest Updates</h4>
                      {blogPosts
                        .filter((post) => post.isPublic && post.title)
                        .slice(0, 2)
                        .map((post, index) => (
                          <div
                            key={index}
                            className="p-2 bg-gray-50 rounded text-xs"
                          >
                            <div className="font-medium truncate">
                              {post.title}
                            </div>
                            <div className="text-gray-600 line-clamp-2 mt-1">
                              {post.content}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <Alert className="mt-4 bg-purple-500/10 border-purple-500/30">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <AlertDescription className="text-xs text-purple-300">
                    This preview updates in real-time as you make changes. Save
                    to apply changes to your live profile.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
