"use client";

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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  DollarSign,
  TrendingUp,
  Users,
  Settings,
  ExternalLink,
  Copy,
  Eye,
  Edit,
  BarChart3,
  Target,
  Share2,
  MessageCircle,
  Star,
  Gift,
  Zap,
  QrCode,
  Code,
  Trophy,
  Loader2,
  WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Rocket,
  Menu,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Name,
  Identity,
  EthBalance,
  Avatar as OnchainAvatar,
} from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";

interface DashboardData {
  user: {
    displayName: string;
    tipTag: string;
    avatarUrl?: string;
    totalTipsReceived: number;
    totalTipCount: number;
    walletAddress: string;
    walletBalance: number;
  };
  analytics: {
    monthlyTips: number;
    profileViews: number;
    conversionRate: number;
    averageTip: number;
  };
  currentGoal?: {
    title: string;
    targetAmount: number;
    currentAmount: number;
    isActive: boolean;
  };
  recentTips: Array<{
    id: string;
    amount: number;
    message?: string;
    tipperName: string;
    createdAt: string;
    isHighlighted: boolean;
  }>;
  topTippers: Array<{
    name: string;
    amount: number;
    tipCount: number;
    badge?: string;
  }>;
  tipsOverTime: Array<{
    date: string;
    amount: number;
  }>;
  geographicData: Array<{
    country: string;
    percentage: number;
    color: string;
  }>;
  recentTransactions: Array<{
    id: string;
    type: "tip_received" | "withdrawal";
    amount: number;
    status: "completed" | "pending";
    createdAt: string;
    description: string;
  }>;
}

export default function EnhancedDashboardPage() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchDashboardData();
    }
  }, [isConnected]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyTipLink = () => {
    if (!dashboardData) return;
    navigator.clipboard.writeText(
      `https://tiptagi.com/tip/${dashboardData.user.tipTag}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdrawal = async (amount: number) => {
    if (!dashboardData || !isConnected) return;
    setWithdrawalLoading(true);
    try {
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          walletAddress: address,
        }),
        credentials: "include",
      });
      if (response.ok) {
        await fetchDashboardData();
        alert("Withdrawal initiated successfully!");
      } else {
        const error = await response.json();
        alert(`Withdrawal failed: ${error.message}`);
      }
    } catch (error) {
      alert("Withdrawal failed. Please try again.");
    } finally {
      setWithdrawalLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-bounce" />
        </div>
        <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border-white/20 relative z-10 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">tiptagI</span>
            </div>
            <CardTitle className="text-xl">Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to access your creator dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Wallet>
                <ConnectWallet className="w-full">
                  <WalletIcon className="h-5 w-5 mr-2" />
                  Connect Wallet
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <OnchainAvatar />
                    <Name />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownLink
                    icon="wallet"
                    href="https://keys.coinbase.com"
                  >
                    Wallet
                  </WalletDropdownLink>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-bounce" />
        </div>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/70">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-bounce" />
        </div>
        <div className="text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-bounce" />
      </div>
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur supports-[backdrop-filter]:bg-black/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">tiptagI</span>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                <Rocket className="h-3 w-3 mr-1" />
                Dashboard
              </Badge>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              <Link href={`/${dashboardData.user.tipTag}`}>
                <Button
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Wallet>
                <ConnectWallet>
                  <OnchainAvatar className="h-6 w-6" />
                  <Name />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <OnchainAvatar />
                    <Name />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownLink
                    icon="wallet"
                    href="https://keys.coinbase.com"
                  >
                    Wallet
                  </WalletDropdownLink>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-2">
                <Link href={`/${dashboardData.user.tipTag}`}>
                  <Button
                    className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-8 relative z-10">
        {/* Welcome Section */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Welcome back, {dashboardData.user.displayName}!
              </h1>
              <p className="text-white/70 text-sm sm:text-base">
                Here's how your creator journey is progressing
              </p>
            </div>
            <Badge variant="secondary" className="self-start sm:self-center">
              <Trophy className="h-4 w-4 mr-2" />
              Pro Creator
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              title: "Total Tips",
              value: `$${dashboardData.user.totalTipsReceived.toFixed(2)}`,
              subtitle: "All time earnings",
              icon: DollarSign,
            },
            {
              title: "Wallet Balance",
              value: `$${dashboardData.user.walletBalance.toFixed(2)}`,
              subtitle: "Available to withdraw",
              icon: WalletIcon,
            },
            {
              title: "Total Tips Count",
              value: dashboardData.user.totalTipCount.toString(),
              subtitle: `Avg: $${dashboardData.analytics.averageTip.toFixed(
                2
              )}`,
              icon: Heart,
            },
            {
              title: "Profile Views",
              value: dashboardData.analytics.profileViews.toString(),
              subtitle: `Conversion: ${dashboardData.analytics.conversionRate.toFixed(
                1
              )}%`,
              icon: Users,
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl relative z-10 hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-white/70" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {stat.value}
                </div>
                <p className="text-xs text-white/70">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Wallet Management */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <WalletIcon className="h-5 w-5" />
                <CardTitle>Wallet Management</CardTitle>
              </div>
              <Badge variant="outline" className="self-start sm:self-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Available Balance</span>
                </div>
                <p className="text-2xl font-bold">
                  ${dashboardData.user.walletBalance.toFixed(2)}
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    handleWithdrawal(dashboardData.user.walletBalance)
                  }
                  disabled={
                    withdrawalLoading || dashboardData.user.walletBalance <= 0
                  }
                >
                  {withdrawalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Withdraw All
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <ArrowUpRight className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">This Month</span>
                </div>
                <p className="text-2xl font-bold">
                  ${dashboardData.analytics.monthlyTips.toFixed(2)}
                </p>
                <p className="text-sm text-white/70">Tips received</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <WalletIcon className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Connected Wallet</span>
                </div>
                <p className="text-lg font-mono">
                  {dashboardData.user.walletAddress.slice(0, 6)}...
                  {dashboardData.user.walletAddress.slice(-4)}
                </p>
                <Button
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      dashboardData.user.walletAddress
                    )
                  }
                >
                  Copy Address
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Goal Progress */}
        {dashboardData.currentGoal && dashboardData.currentGoal.isActive && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <CardTitle>
                    Current Goal: {dashboardData.currentGoal.title}
                  </CardTitle>
                </div>
                <Badge variant="secondary">
                  {Math.round(
                    (dashboardData.currentGoal.currentAmount /
                      dashboardData.currentGoal.targetAmount) *
                      100
                  )}
                  % Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress
                value={
                  (dashboardData.currentGoal.currentAmount /
                    dashboardData.currentGoal.targetAmount) *
                  100
                }
                className="h-3"
              />
              <div className="flex justify-between text-sm">
                <span>${dashboardData.currentGoal.currentAmount} raised</span>
                <span className="font-semibold">
                  ${dashboardData.currentGoal.targetAmount} goal
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/dashboard/goals">
                  <Button
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Goal
                  </Button>
                </Link>
                <Button
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent"
                  onClick={() => {
                    const shareText = `Help me reach my goal: ${dashboardData.currentGoal?.title}! ${dashboardData.currentGoal?.currentAmount}/${dashboardData.currentGoal?.targetAmount} raised so far. Support me at https://tiptagi.com/tip/${dashboardData.user.tipTag}`;
                    navigator.share?.({ text: shareText }) ||
                      navigator.clipboard.writeText(shareText);
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-[500px] sm:min-w-0 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-2">
              {[
                { value: "overview", icon: BarChart3, label: "Overview" },
                { value: "analytics", icon: TrendingUp, label: "Analytics" },
                {
                  value: "transactions",
                  icon: WalletIcon,
                  label: "Transactions",
                },
                { value: "community", icon: Users, label: "Community" },
                { value: "sharing", icon: Share2, label: "Sharing" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs sm:text-sm data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-xl"
                >
                  <tab.icon className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Zap className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Manage your tiptagI presence
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Tip Link</label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono text-xs sm:text-sm overflow-hidden">
                        tiptagi.com/tip/{dashboardData.user.tipTag}
                      </code>
                      <Button
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent"
                      >
                        {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Link href={`/${dashboardData.user.tipTag}`}>
                      <Button
                        className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </Link>
                    <Link href="/dashboard/profile">
                      <Button
                        className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent"
                        size="sm"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                  <Link href="/dashboard/settings">
                    <Button
                      className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent"
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Tips */}
              <div className="lg:col-span-2">
                <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center text-lg">
                          <Gift className="h-5 w-5 mr-2" />
                          Recent Tips
                        </CardTitle>
                        <CardDescription>
                          Your latest supporter contributions
                        </CardDescription>
                      </div>
                      <Link href="/dashboard/tips">
                        <Button
                          className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent"
                          size="sm"
                        >
                          View All
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentTips.map((tip) => (
                        <div
                          key={tip.id}
                          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border space-y-2 sm:space-y-0 ${
                            tip.isHighlighted
                              ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800"
                              : "bg-muted/50"
                          }`}
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-lg">
                                ${tip.amount.toFixed(2)}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {tip.tipperName}
                              </Badge>
                              {tip.isHighlighted && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            {tip.message && (
                              <p className="text-white/70 italic text-sm">
                                "{tip.message}"
                              </p>
                            )}
                            <p className="text-xs text-white/70">
                              {new Date(tip.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tips Over Time */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
                <CardHeader>
                  <CardTitle>Tips Over Time</CardTitle>
                  <CardDescription>Your earnings trend</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData.tipsOverTime}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis
                          dataKey="date"
                          className="text-xs"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value) => [`$${value}`, "Tips"]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{
                            fill: "hsl(var(--primary))",
                            strokeWidth: 2,
                            r: 4,
                          }}
                          activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Geographic Distribution */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>
                    Where your supporters are from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.geographicData.map((country, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: country.color }}
                          ></div>
                          <span className="font-medium">{country.country}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-20 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${country.percentage}%`,
                                backgroundColor: country.color,
                              }}
                            ></div>
                          </div>
                          <span className="text-white/70 w-8 text-right text-sm">
                            {country.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <WalletIcon className="h-5 w-5 mr-2" />
                  Transaction History
                </CardTitle>
                <CardDescription>All your tips and withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-muted/50 rounded-lg space-y-2 sm:space-y-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            transaction.type === "tip_received"
                              ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                              : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                          }`}
                        >
                          {transaction.type === "tip_received" ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-white/70">
                            {new Date(transaction.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "tip_received"
                              ? "text-green-600 dark:text-green-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {transaction.type === "tip_received" ? "+" : "-"}$
                          {transaction.amount.toFixed(2)}
                        </p>
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Tippers */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Top Supporters
                  </CardTitle>
                  <CardDescription>
                    Your most generous supporters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.topTippers.map((tipper, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{tipper.name}</p>
                            <p className="text-xs text-white/70">
                              {tipper.tipCount} tips
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${tipper.amount.toFixed(2)}
                          </p>
                          {tipper.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {tipper.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Recent Messages
                  </CardTitle>
                  <CardDescription>
                    Messages from your supporters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentTips
                      .filter((tip) => tip.message)
                      .map((tip) => (
                        <div
                          key={tip.id}
                          className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary"
                        >
                          <p className="italic mb-2">"{tip.message}"</p>
                          <div className="flex justify-between items-center text-xs text-white/70">
                            <span>— {tip.tipperName}</span>
                            <span>
                              {new Date(tip.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sharing Tab */}
          <TabsContent value="sharing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sharing Tools */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="h-5 w-5 mr-2" />
                    Sharing Tools
                  </CardTitle>
                  <CardDescription>
                    Promote your tip page across platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent"
                      onClick={copyTipLink}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent">
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code
                    </Button>
                  </div>
                  <Button className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent">
                    <Code className="h-4 w-4 mr-2" />
                    Get Embed Code
                  </Button>
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Platform-Specific Shares
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          name: "Twitter",
                          action: () => {
                            const text = `Check out my tip page: https://tiptagi.com/tip/${dashboardData.user.tipTag}`;
                            window.open(
                              `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                text
                              )}`
                            );
                          },
                        },
                        {
                          name: "Facebook",
                          action: () => {
                            const text = `Check out my tip page: https://tiptagi.com/tip/${dashboardData.user.tipTag}`;
                            window.open(
                              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                text
                              )}`
                            );
                          },
                        },
                        { name: "Instagram", action: () => {} },
                        { name: "Discord", action: () => {} },
                      ].map((platform) => (
                        <Button
                          key={platform.name}
                          className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent"
                          size="sm"
                          onClick={platform.action}
                        >
                          {platform.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stream Integration */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Stream Integration
                  </CardTitle>
                  <CardDescription>
                    Connect with streaming platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      title: "Streamlabs Integration",
                      description: "Show tip alerts during your streams",
                      action: "Connect Streamlabs",
                    },
                    {
                      title: "OBS Integration",
                      description: "Add tip notifications to your scenes",
                      action: "Get OBS Code",
                    },
                    {
                      title: "Custom Webhook",
                      description: "Send tips to any service via webhook",
                      action: "Setup Webhook",
                    },
                  ].map((integration, index) => (
                    <div
                      key={index}
                      className="p-4 bg-muted/50 rounded-lg space-y-3"
                    >
                      <h4 className="font-medium">{integration.title}</h4>
                      <p className="text-white/70 text-sm">
                        {integration.description}
                      </p>
                      <Button size="sm" className="w-full">
                        {integration.action}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
