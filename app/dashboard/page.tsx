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
  Sparkles,
  Trophy,
  Loader2,
  WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Rocket,
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isConnected) {
      fetchDashboardData();
    }
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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
      `https://tiptag.com/tip/${dashboardData.user.tipTag}`
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
        await fetchDashboardData(); // Refresh data
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
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-bounce" />
        </div>
        <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border-white/20 relative z-10 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="relative">
                <Heart className="h-10 w-10 text-purple-400 animate-pulse" />
                <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-lg animate-pulse" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                tiptag
              </span>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Connect Your Wallet
            </CardTitle>
            <CardDescription className="text-white/70">
              Connect your wallet to access your creator dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <Wallet>
                  <ConnectWallet className="relative bg-black border-0 rounded-2xl px-8 py-4 text-white hover:bg-white/10 transition-all duration-300">
                    <WalletIcon className="h-6 w-6 mr-3" />
                    <span className="text-lg font-medium">Launch Dashboard</span>
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
                      Connect
                    </WalletDropdownLink>
                    <WalletDropdownDisconnect />
                  </WalletDropdown>
                </Wallet>
              </div>
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
          <div
            className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
            style={{
              left: mousePosition.x - 192,
              top: mousePosition.y - 192,
              transition: "all 0.3s ease-out",
            }}
          />
        </div>
        <div className="text-center relative z-10">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-6" />
            <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
          </div>
          <p className="text-white/70 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4 text-lg">Error: {error}</p>
          <Button
            onClick={fetchDashboardData}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
          >
            Try Again
          </Button>
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
        <div
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: "all 0.3s ease-out",
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Enhanced Header */}
      <header className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-black/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Heart className="h-8 w-8 text-purple-400 group-hover:text-pink-400 transition-colors duration-300" />
                <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                tiptag
              </span>
              <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30 animate-pulse">
                <Rocket className="h-3 w-3 mr-1" />
                Dashboard
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/profile`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm bg-transparent"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
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
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Welcome back,
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {dashboardData.user.displayName}!
                </span>
                <Sparkles className="inline h-8 w-8 text-yellow-400 ml-4 animate-pulse" />
              </h1>
              <p className="text-white/70 text-xl">
                Here's how your creator journey is progressing
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 px-6 py-3 text-lg">
              <Trophy className="h-5 w-5 mr-2" />
              Pro Creator
            </Badge>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: "Total Tips",
              value: `$${dashboardData.user.totalTipsReceived.toFixed(2)}`,
              subtitle: "All time earnings",
              icon: DollarSign,
              gradient: "from-purple-500 to-pink-500",
              delay: "0s",
            },
            {
              title: "Wallet Balance",
              value: `$${dashboardData.user.walletBalance.toFixed(2)}`,
              subtitle: "Available to withdraw",
              icon: WalletIcon,
              gradient: "from-blue-500 to-cyan-500",
              delay: "0.1s",
            },
            {
              title: "Total Tips Count",
              value: dashboardData.user.totalTipCount.toString(),
              subtitle: `Avg: $${dashboardData.analytics.averageTip.toFixed(
                2
              )}`,
              icon: Heart,
              gradient: "from-green-500 to-emerald-500",
              delay: "0.2s",
            },
            {
              title: "Profile Views",
              value: dashboardData.analytics.profileViews.toString(),
              subtitle: `Conversion: ${dashboardData.analytics.conversionRate.toFixed(
                1
              )}%`,
              icon: Users,
              gradient: "from-orange-500 to-red-500",
              delay: "0.3s",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="group cursor-pointer"
              style={{ animationDelay: stat.delay }}
            >
              <Card
                className={`bg-transparent border border-gray-300 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-5 w-5 text-white/90 group-hover:scale-110 transition-transform duration-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <p className="text-xs text-white/80">{stat.subtitle}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Wallet Management */}
        <Card className="mb-12 bg-transparent border-blue-500/30 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <WalletIcon className="h-6 w-6 text-blue-400" />
                  <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-lg animate-pulse" />
                </div>
                <CardTitle className="text-blue-300 text-2xl">
                  Wallet Management
                </CardTitle>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 animate-pulse">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                Connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Available Balance",
                  value: `$${dashboardData.user.walletBalance.toFixed(2)}`,
                  icon: ArrowDownLeft,
                  color: "green",
                  action: "Withdraw All",
                },
                {
                  title: "This Month",
                  value: `$${dashboardData.analytics.monthlyTips.toFixed(2)}`,
                  icon: ArrowUpRight,
                  color: "blue",
                  subtitle: "Tips received",
                },
                {
                  title: "Connected Wallet",
                  value: `${dashboardData.user.walletAddress.slice(
                    0,
                    6
                  )}...${dashboardData.user.walletAddress.slice(-4)}`,
                  icon: WalletIcon,
                  color: "purple",
                  action: "Copy Address",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <item.icon
                      className={`h-5 w-5 text-${item.color}-400 group-hover:scale-110 transition-transform duration-300`}
                    />
                    <span className="font-medium text-white/90">
                      {item.title}
                    </span>
                  </div>
                  <p
                    className={`text-2xl font-bold text-${item.color}-400 mb-2`}
                  >
                    {item.value}
                  </p>
                  {item.subtitle && (
                    <p className="text-white/60 text-sm mb-4">
                      {item.subtitle}
                    </p>
                  )}
                  {item.action && (
                    <Button
                      size="sm"
                      className={`w-full bg-${item.color}-600 hover:bg-${item.color}-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105`}
                      onClick={() => {
                        if (item.action === "Withdraw All") {
                          handleWithdrawal(dashboardData.user.walletBalance);
                        } else if (item.action === "Copy Address") {
                          navigator.clipboard.writeText(
                            dashboardData.user.walletAddress
                          );
                        }
                      }}
                      disabled={
                        item.action === "Withdraw All" &&
                        (withdrawalLoading ||
                          dashboardData.user.walletBalance <= 0)
                      }
                    >
                      {withdrawalLoading && item.action === "Withdraw All" ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {item.action}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Goal Progress */}
        {dashboardData.currentGoal && dashboardData.currentGoal.isActive && (
          <Card className="mb-12 bg-transparent  border-indigo-500/30 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-indigo-400 animate-pulse" />
                  <CardTitle className="text-indigo-300 text-2xl">
                    Current Goal: {dashboardData.currentGoal.title}
                  </CardTitle>
                </div>
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-lg px-4 py-2">
                  {Math.round(
                    (dashboardData.currentGoal.currentAmount /
                      dashboardData.currentGoal.targetAmount) *
                      100
                  )}
                  % Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative">
                  <Progress
                    value={
                      (dashboardData.currentGoal.currentAmount /
                        dashboardData.currentGoal.targetAmount) *
                      100
                    }
                    className="h-4 bg-white/10"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur animate-pulse" />
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-white/80">
                    ${dashboardData.currentGoal.currentAmount} raised
                  </span>
                  <span className="font-semibold text-indigo-300">
                    ${dashboardData.currentGoal.targetAmount} goal
                  </span>
                </div>
                <div className="flex space-x-4">
                  <Link href="/dashboard/goals">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300 backdrop-blur-sm bg-transparent"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Goal
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const shareText = `Help me reach my goal: ${dashboardData.currentGoal?.title}! ${dashboardData.currentGoal?.currentAmount}/${dashboardData.currentGoal?.targetAmount} raised so far. Support me at https://tiptag.com/tip/${dashboardData.user.tipTag}`;
                      navigator.share?.({ text: shareText }) ||
                        navigator.clipboard.writeText(shareText);
                    }}
                    className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300 backdrop-blur-sm"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Goal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-2">
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
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-white/70 hover:text-white transition-all duration-300 rounded-xl"
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Zap className="h-6 w-6 mr-3 text-purple-400" />
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Quick Actions
                    </span>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Manage your tiptag presence
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/90">
                      Your Tip Link
                    </label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-4 py-3 bg-white/5 rounded-xl text-sm font-mono text-white/80 border border-white/10">
                        tiptag.com/tip/{dashboardData.user.tipTag}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyTipLink}
                        className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 bg-transparent"
                      >
                        {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/dashboard/profile`}>
                      <Button
                        className="w-full bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </Link>
                    <Link href="/dashboard/profile">
                      <Button
                        className="w-full bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Tips */}
              <div className="lg:col-span-2">
                <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-xl">
                        <Gift className="h-6 w-6 mr-3 text-green-400" />
                        <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                          Recent Tips
                        </span>
                      </CardTitle>
                      <Link href="/dashboard/tips">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 bg-transparent"
                        >
                          View All
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                    <CardDescription className="text-white/70">
                      Your latest supporter contributions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentTips.map((tip) => (
                        <div
                          key={tip.id}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                            tip.isHighlighted
                              ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-semibold text-2xl text-white">
                                ${tip.amount.toFixed(2)}
                              </span>
                              <Badge
                                className={`${
                                  tip.isHighlighted
                                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                    : "bg-white/10 text-white/80 border-white/20"
                                }`}
                              >
                                {tip.tipperName}
                              </Badge>
                              {tip.isHighlighted && (
                                <Star className="h-5 w-5 text-yellow-400 fill-current animate-pulse" />
                              )}
                            </div>
                            {tip.message && (
                              <p className="text-white/70 italic mb-2 text-sm">
                                "{tip.message}"
                              </p>
                            )}
                            <p className="text-xs text-white/50">
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
          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tips Over Time */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Tips Over Time</CardTitle>
                  <CardDescription className="text-white/70">
                    Your earnings trend
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.tipsOverTime}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                      <YAxis stroke="rgba(255,255,255,0.7)" />
                      <Tooltip
                        formatter={(value) => [`$${value}`, "Tips"]}
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "12px",
                          color: "white",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="url(#gradient)"
                        strokeWidth={3}
                        dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#ec4899" }}
                      />
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Geographic Distribution */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">
                    Geographic Distribution
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Where your supporters are from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.geographicData.map((country, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-4 h-4 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300"
                            style={{ backgroundColor: country.color }}
                          ></div>
                          <span className="text-white/90 font-medium">
                            {country.country}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-white/10 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${country.percentage}%`,
                                backgroundColor: country.color,
                              }}
                            ></div>
                          </div>
                          <span className="text-white/70 w-10 text-right font-medium">
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
          <TabsContent value="transactions" className="space-y-8">
            <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <WalletIcon className="h-6 w-6 mr-3 text-blue-400" />
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Transaction History
                  </span>
                </CardTitle>
                <CardDescription className="text-white/70">
                  All your tips and withdrawals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                            transaction.type === "tip_received"
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : "bg-gradient-to-r from-blue-500 to-cyan-500"
                          }`}
                        >
                          {transaction.type === "tip_received" ? (
                            <ArrowDownLeft className="h-5 w-5 text-white" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-white/60">
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
                          className={`font-semibold text-lg ${
                            transaction.type === "tip_received"
                              ? "text-green-400"
                              : "text-blue-400"
                          }`}
                        >
                          {transaction.type === "tip_received" ? "+" : "-"}$
                          {transaction.amount.toFixed(2)}
                        </p>
                        <Badge
                          className={`${
                            transaction.status === "completed"
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                          }`}
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
          <TabsContent value="community" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Tippers */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Trophy className="h-6 w-6 mr-3 text-yellow-400" />
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      Top Supporters
                    </span>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Your most generous supporters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.topTippers.map((tipper, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-transparent border border-gray-300 text-white text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {tipper.name}
                            </p>
                            <p className="text-xs text-white/60">
                              {tipper.tipCount} tips
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white text-lg">
                            ${tipper.amount.toFixed(2)}
                          </p>
                          {tipper.badge && (
                            <Badge
                              className={`text-xs ${
                                tipper.badge === "Gold"
                                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                  : tipper.badge === "Silver"
                                  ? "bg-gray-500/20 text-gray-300 border-gray-500/30"
                                  : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                              }`}
                            >
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
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <MessageCircle className="h-6 w-6 mr-3 text-blue-400" />
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Recent Messages
                    </span>
                  </CardTitle>
                  <CardDescription className="text-white/70">
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
                          className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border-l-4 border-blue-500 hover:border-purple-500 transition-all duration-300 group"
                        >
                          <p className="text-white/90 italic mb-3 leading-relaxed">
                            "{tip.message}"
                          </p>
                          <div className="flex justify-between items-center text-xs text-white/60">
                            <span className="group-hover:text-white/80 transition-colors duration-300">
                              — {tip.tipperName}
                            </span>
                            <span className="group-hover:text-white/80 transition-colors duration-300">
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
          <TabsContent value="sharing" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sharing Tools */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Share2 className="h-6 w-6 mr-3 text-green-400" />
                    <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      Sharing Tools
                    </span>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Promote your tip page across platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <Button
                        variant="outline"
                        onClick={copyTipLink}
                        className="relative w-full bg-black border-0 text-white hover:bg-white/10 transition-all duration-300 rounded-2xl h-12"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          /* generateQRCode() */
                        }}
                        className="relative w-full bg-black border-0 text-white hover:bg-white/10 transition-all duration-300 rounded-2xl h-12"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        QR Code
                      </Button>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        /* getEmbedCode() */
                      }}
                      className="relative w-full bg-black border-0 text-white hover:bg-white/10 transition-all duration-300 rounded-2xl h-12"
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Get Embed Code
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/90">
                      Platform-Specific Shares
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          name: "Twitter",
                          color: "from-blue-500 to-blue-600",
                          action: () => {
                            const text = `Check out my tip page: https://tiptag.com/tip/${dashboardData.user.tipTag}`;
                            window.open(
                              `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                text
                              )}`
                            );
                          },
                        },
                        {
                          name: "Facebook",
                          color: "from-blue-600 to-blue-700",
                          action: () => {
                            const text = `Check out my tip page: https://tiptag.com/tip/${dashboardData.user.tipTag}`;
                            window.open(
                              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                text
                              )}`
                            );
                          },
                        },
                        {
                          name: "Instagram",
                          color: "from-pink-500 to-rose-600",
                          action: () => {},
                        },
                        {
                          name: "Discord",
                          color: "from-indigo-500 to-purple-600",
                          action: () => {},
                        },
                      ].map((platform) => (
                        <div key={platform.name} className="relative group">
                          <div
                            className={`absolute -inset-1 bg-gradient-to-r ${platform.color} rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300`}
                          ></div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={platform.action}
                            className="relative w-full bg-black border-0 text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
                          >
                            {platform.name}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stream Integration */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Zap className="h-6 w-6 mr-3 text-purple-400" />
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Stream Integration
                    </span>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Connect with streaming platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    {
                      title: "Streamlabs Integration",
                      description: "Show tip alerts during your streams",
                      color: "from-purple-500/10 to-pink-500/10",
                      borderColor: "border-purple-500/30",
                      buttonColor: "from-purple-600 to-pink-600",
                      action: "Connect Streamlabs",
                    },
                    {
                      title: "OBS Integration",
                      description: "Add tip notifications to your scenes",
                      color: "from-blue-500/10 to-cyan-500/10",
                      borderColor: "border-blue-500/30",
                      buttonColor: "from-blue-600 to-cyan-600",
                      action: "Get OBS Code",
                    },
                    {
                      title: "Custom Webhook",
                      description: "Send tips to any service via webhook",
                      color: "from-green-500/10 to-emerald-500/10",
                      borderColor: "border-green-500/30",
                      buttonColor: "from-green-600 to-emerald-600",
                      action: "Setup Webhook",
                    },
                  ].map((integration, index) => (
                    <div
                      key={index}
                      className={`p-6 bg-gradient-to-r ${integration.color} rounded-2xl border ${integration.borderColor} hover:scale-105 transition-all duration-300 group`}
                    >
                      <h4 className="font-medium mb-2 text-white">
                        {integration.title}
                      </h4>
                      <p className="text-white/70 mb-4 text-sm leading-relaxed">
                        {integration.description}
                      </p>
                      <div className="relative">
                        <div
                          className={`absolute -inset-1 bg-gradient-to-r ${integration.buttonColor} rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300`}
                        ></div>
                        <Button
                          size="sm"
                          className={`relative bg-gradient-to-r ${integration.buttonColor} hover:scale-105 text-white rounded-xl transition-all duration-300 border-0`}
                        >
                          {integration.action}
                        </Button>
                      </div>
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
