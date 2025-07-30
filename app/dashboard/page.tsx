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
  Loader2,
  WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
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

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);

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
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Heart className="h-10 w-10 text-gray-400" />
              <span className="text-3xl font-bold text-white">tiptagI</span>
            </div>
            <CardTitle className="text-2xl text-white">
              Connect Your Wallet
            </CardTitle>
            <CardDescription className="text-gray-400">
              Connect your wallet to access your creator dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Wallet>
                <ConnectWallet className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 px-8 py-4 text-lg font-medium">
                  <WalletIcon className="h-6 w-6 mr-3" />
                  <span>Connect Wallet</span>
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
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-6" />
          <p className="text-gray-400 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4 text-lg">Error: {error}</p>
          <Button
            onClick={fetchDashboardData}
            className="bg-gray-800 hover:bg-gray-700 border-gray-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Heart className="h-8 w-8 text-gray-400" />
              <span className="text-2xl font-bold text-white">tiptagI</span>
              <Badge className="bg-gray-800 text-gray-300 border-gray-700">
                Dashboard
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/${dashboardData.user.tipTag}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
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
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Welcome back, {dashboardData.user.displayName}!
              </h1>
              <p className="text-gray-400 text-xl">
                Here's how your creator journey is progressing
              </p>
            </div>
            <Badge className="bg-gray-800 text-gray-300 border-gray-700 px-6 py-3 text-lg">
              Pro Creator
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Tips
              </CardTitle>
              <DollarSign className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                ${dashboardData.user.totalTipsReceived.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">All time earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Wallet Balance
              </CardTitle>
              <WalletIcon className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                ${dashboardData.user.walletBalance.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">Available to withdraw</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Tips Count
              </CardTitle>
              <Heart className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {dashboardData.user.totalTipCount}
              </div>
              <p className="text-xs text-gray-500">
                Avg: ${dashboardData.analytics.averageTip.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Profile Views
              </CardTitle>
              <Users className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {dashboardData.analytics.profileViews}
              </div>
              <p className="text-xs text-gray-500">
                Conversion: {dashboardData.analytics.conversionRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Management */}
        <Card className="mb-12 bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <WalletIcon className="h-6 w-6 text-gray-400" />
                <CardTitle className="text-gray-300 text-2xl">
                  Wallet Management
                </CardTitle>
              </div>
              <Badge className="bg-green-900 text-green-400 border-green-800">
                Connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-800 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <ArrowDownLeft className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-300">
                    Available Balance
                  </span>
                </div>
                <p className="text-2xl font-bold text-white mb-2">
                  ${dashboardData.user.walletBalance.toFixed(2)}
                </p>
                <Button
                  size="sm"
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white"
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

              <div className="p-6 bg-gray-800 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <ArrowUpRight className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-300">This Month</span>
                </div>
                <p className="text-2xl font-bold text-white mb-2">
                  ${dashboardData.analytics.monthlyTips.toFixed(2)}
                </p>
                <p className="text-gray-500 text-sm">Tips received</p>
              </div>

              <div className="p-6 bg-gray-800 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <WalletIcon className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-300">
                    Connected Wallet
                  </span>
                </div>
                <p className="text-2xl font-bold text-white mb-2">
                  {dashboardData.user.walletAddress.slice(0, 6)}...
                  {dashboardData.user.walletAddress.slice(-4)}
                </p>
                <Button
                  size="sm"
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white"
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
          <Card className="mb-12 bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-gray-400" />
                  <CardTitle className="text-gray-300 text-2xl">
                    Current Goal: {dashboardData.currentGoal.title}
                  </CardTitle>
                </div>
                <Badge className="bg-gray-800 text-gray-300 border-gray-700 text-lg px-4 py-2">
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
                    className="h-4 bg-gray-800"
                  />
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-400">
                    ${dashboardData.currentGoal.currentAmount} raised
                  </span>
                  <span className="font-semibold text-white">
                    ${dashboardData.currentGoal.targetAmount} goal
                  </span>
                </div>
                <div className="flex space-x-4">
                  <Link href="/dashboard/goals">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Goal
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const shareText = `Help me reach my goal: ${dashboardData.currentGoal?.title}! ${dashboardData.currentGoal?.currentAmount}/${dashboardData.currentGoal?.targetAmount} raised so far. Support me at https://tiptagi.com/tip/${dashboardData.user.tipTag}`;
                      navigator.share?.({ text: shareText }) ||
                        navigator.clipboard.writeText(shareText);
                    }}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Goal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-5 bg-gray-900 border-gray-800">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              <WalletIcon className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger
              value="community"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Community
            </TabsTrigger>
            <TabsTrigger
              value="sharing"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Sharing
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-white">
                    <Zap className="h-6 w-6 mr-3 text-gray-400" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your tiptagI presence
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">
                      Your Tip Link
                    </label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-4 py-3 bg-gray-800 rounded-xl text-sm font-mono text-gray-300 border border-gray-700">
                        tiptagi.com/tip/{dashboardData.user.tipTag}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyTipLink}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/${dashboardData.user.tipTag}`}>
                      <Button
                        className="w-full bg-gray-800 border border-gray-700 text-white hover:bg-gray-700"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </Link>
                    <Link href="/dashboard/profile">
                      <Button
                        className="w-full bg-gray-800 border border-gray-700 text-white hover:bg-gray-700"
                        size="sm"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>

                  <Link href="/dashboard/settings">
                    <Button
                      className="w-full bg-gray-800 border border-gray-700 text-white hover:bg-gray-700"
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
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-xl text-white">
                        <Gift className="h-6 w-6 mr-3 text-gray-400" />
                        Recent Tips
                      </CardTitle>
                      <Link href="/dashboard/tips">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                        >
                          View All
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                    <CardDescription className="text-gray-400">
                      Your latest supporter contributions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentTips.map((tip) => (
                        <div
                          key={tip.id}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                            tip.isHighlighted
                              ? "bg-yellow-900/20 border-yellow-800"
                              : "bg-gray-800 border-gray-700 hover:border-gray-600"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-semibold text-2xl text-white">
                                ${tip.amount.toFixed(2)}
                              </span>
                              <Badge
                                className={
                                  tip.isHighlighted
                                    ? "bg-yellow-900 text-yellow-400 border-yellow-800"
                                    : "bg-gray-800 text-gray-300 border-gray-700"
                                }
                              >
                                {tip.tipperName}
                              </Badge>
                              {tip.isHighlighted && (
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                              )}
                            </div>
                            {tip.message && (
                              <p className="text-gray-400 italic mb-2 text-sm">
                                "{tip.message}"
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
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
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Tips Over Time</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your earnings trend
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.tipsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "12px",
                          color: "#ffffff",
                        }}
                        formatter={(value) => [`$${value}`, "Tips"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#6B7280"
                        strokeWidth={3}
                        dot={{ fill: "#6B7280", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#9CA3AF" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Geographic Distribution */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    Geographic Distribution
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Where your supporters are from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.geographicData.map((country, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-xl"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: country.color }}
                          ></div>
                          <span className="text-gray-300 font-medium">
                            {country.country}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {country.percentage}%
                          </p>
                          <div className="w-16 bg-gray-700 rounded-full h-2 mt-1">
                            <div
                              className="bg-gray-500 h-2 rounded-full"
                              style={{ width: `${country.percentage}%` }}
                            ></div>
                          </div>
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
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-white">
                  <WalletIcon className="h-6 w-6 mr-3 text-gray-400" />
                  Transaction History
                </CardTitle>
                <CardDescription className="text-gray-400">
                  All your tips and withdrawals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700">
                          {transaction.type === "tip_received" ? (
                            <ArrowDownLeft className="h-5 w-5 text-gray-300" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-400">
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
                        <p className="font-semibold text-lg text-white">
                          {transaction.type === "tip_received" ? "+" : "-"}$
                          {transaction.amount.toFixed(2)}
                        </p>
                        <Badge
                          className={
                            transaction.status === "completed"
                              ? "bg-green-900 text-green-400 border-green-800"
                              : "bg-yellow-900 text-yellow-400 border-yellow-800"
                          }
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
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-white">
                    <Star className="h-6 w-6 mr-3 text-gray-400" />
                    Top Supporters
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your most generous supporters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.topTippers.map((tipper, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-xl"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full text-white text-lg font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {tipper.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {tipper.tipCount} tips
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white text-lg">
                            ${tipper.amount.toFixed(2)}
                          </p>
                          {tipper.badge && (
                            <Badge className="text-xs bg-gray-700 text-gray-300 border-gray-600">
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
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-white">
                    <MessageCircle className="h-6 w-6 mr-3 text-gray-400" />
                    Recent Messages
                  </CardTitle>
                  <CardDescription className="text-gray-400">
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
                          className="p-4 bg-gray-800 rounded-xl border-l-4 border-gray-600"
                        >
                          <p className="text-gray-300 italic mb-3 leading-relaxed">
                            "{tip.message}"
                          </p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
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
          <TabsContent value="sharing" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sharing Tools */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-white">
                    <Share2 className="h-6 w-6 mr-3 text-gray-400" />
                    Sharing Tools
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Promote your tip page across platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={copyTipLink}
                      className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 h-12"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 h-12"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700 h-12"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Get Embed Code
                  </Button>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">
                      Platform-Specific Shares
                    </label>
                    <div className="grid grid-cols-2 gap-3">
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
                          variant="outline"
                          size="sm"
                          onClick={platform.action}
                          className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                        >
                          {platform.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stream Integration */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-white">
                    <Zap className="h-6 w-6 mr-3 text-gray-400" />
                    Stream Integration
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Connect with streaming platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                    <div key={index} className="p-6 bg-gray-800 rounded-xl">
                      <h4 className="font-medium mb-2 text-white">
                        {integration.title}
                      </h4>
                      <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        {integration.description}
                      </p>
                      <Button
                        size="sm"
                        className="bg-gray-700 hover:bg-gray-600 text-white"
                      >
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
