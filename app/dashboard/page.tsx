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
  Menu,
  X,
  ChevronDown,
  Activity,
  Globe,
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

export default function SimpleDashboard() {
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

  // Mock data for demo purposes
  useEffect(() => {
    if (isConnected) {
      setTimeout(() => {
        setDashboardData({
          user: {
            displayName: "Alex Creator",
            tipTag: "alexcreator",
            totalTipsReceived: 2847.5,
            totalTipCount: 156,
            walletAddress: "0x1234567890123456789012345678901234567890",
            walletBalance: 1250.75,
          },
          analytics: {
            monthlyTips: 485.2,
            profileViews: 3420,
            conversionRate: 4.6,
            averageTip: 18.25,
          },
          currentGoal: {
            title: "New Equipment Fund",
            targetAmount: 5000,
            currentAmount: 3200,
            isActive: true,
          },
          recentTips: [
            {
              id: "1",
              amount: 25.0,
              message: "Love your content! Keep it up!",
              tipperName: "Sarah M.",
              createdAt: new Date().toISOString(),
              isHighlighted: true,
            },
            {
              id: "2",
              amount: 10.0,
              tipperName: "Mike D.",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              isHighlighted: false,
            },
          ],
          topTippers: [
            { name: "Sarah M.", amount: 125.5, tipCount: 8, badge: "Gold" },
            { name: "Mike D.", amount: 89.25, tipCount: 5, badge: "Silver" },
            { name: "Emma K.", amount: 67.0, tipCount: 4, badge: "Bronze" },
          ],
          tipsOverTime: [
            { date: "Jan", amount: 120 },
            { date: "Feb", amount: 180 },
            { date: "Mar", amount: 240 },
            { date: "Apr", amount: 320 },
            { date: "May", amount: 485 },
          ],
          geographicData: [
            { country: "United States", percentage: 45, color: "#6b7280" },
            { country: "Canada", percentage: 25, color: "#9ca3af" },
            { country: "United Kingdom", percentage: 20, color: "#d1d5db" },
            { country: "Others", percentage: 10, color: "#e5e7eb" },
          ],
          recentTransactions: [
            {
              id: "1",
              type: "tip_received",
              amount: 25.0,
              status: "completed",
              createdAt: new Date().toISOString(),
              description: "Tip from Sarah M.",
            },
            {
              id: "2",
              type: "withdrawal",
              amount: 100.0,
              status: "pending",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              description: "Withdrawal to wallet",
            },
          ],
        });
        setLoading(false);
      }, 1500);
    }
  }, [isConnected]);

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
    setTimeout(() => {
      setWithdrawalLoading(false);
      alert("Withdrawal initiated successfully!");
    }, 2000);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Heart className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">tiptagI</span>
            </div>
            <div>
              <CardTitle className="text-xl text-white">
                Connect Your Wallet
              </CardTitle>
              <CardDescription className="text-gray-400">
                Connect your wallet to access your creator dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Wallet>
                <ConnectWallet className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3">
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
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">Error: {error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Heart className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold">tiptagI</span>
              <Badge className="bg-green-900 text-green-300 border-green-700">
                Dashboard
              </Badge>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
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
                <ConnectWallet className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  <OnchainAvatar className="h-5 w-5" />
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
            <div className="md:hidden flex items-center space-x-2">
              <Wallet>
                <ConnectWallet className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2">
                  <OnchainAvatar className="h-4 w-4" />
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-400 hover:bg-gray-800"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4 space-y-2">
              <Link href={`/${dashboardData.user.tipTag}`}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, {dashboardData.user.displayName}!
              </h1>
              <p className="text-gray-400">
                Here's how your creator journey is progressing
              </p>
            </div>
            <Badge className="self-start md:self-auto bg-blue-900 text-blue-300 border-blue-700 px-4 py-2">
              <Trophy className="h-4 w-4 mr-2" />
              Pro Creator
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Earnings",
              value: `$${dashboardData.user.totalTipsReceived.toFixed(2)}`,
              subtitle: "All time",
              icon: DollarSign,
            },
            {
              title: "Available Balance",
              value: `$${dashboardData.user.walletBalance.toFixed(2)}`,
              subtitle: "Ready to withdraw",
              icon: WalletIcon,
            },
            {
              title: "Total Tips",
              value: dashboardData.user.totalTipCount.toString(),
              subtitle: `Avg: $${dashboardData.analytics.averageTip.toFixed(
                2
              )}`,
              icon: Heart,
            },
            {
              title: "Profile Views",
              value: dashboardData.analytics.profileViews.toLocaleString(),
              subtitle: `${dashboardData.analytics.conversionRate.toFixed(
                1
              )}% conversion`,
              icon: Eye,
            },
          ].map((stat, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Wallet Management */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <WalletIcon className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-white">Wallet Management</CardTitle>
              </div>
              <Badge className="self-start sm:self-auto bg-green-900 text-green-300 border-green-700">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                Connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <ArrowDownLeft className="h-4 w-4 text-green-400" />
                  <span className="font-medium text-white">
                    Available Balance
                  </span>
                </div>
                <p className="text-2xl font-bold text-white mb-2">
                  ${dashboardData.user.walletBalance.toFixed(2)}
                </p>
                <Button
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
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
              <div className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <ArrowUpRight className="h-4 w-4 text-blue-400" />
                  <span className="font-medium text-white">This Month</span>
                </div>
                <p className="text-2xl font-bold text-white mb-2">
                  ${dashboardData.analytics.monthlyTips.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">Tips received</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <WalletIcon className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-white">
                    Connected Wallet
                  </span>
                </div>
                <p className="text-lg font-bold text-white mb-2">
                  {dashboardData.user.walletAddress.slice(0, 6)}...
                  {dashboardData.user.walletAddress.slice(-4)}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-600 bg-transparent"
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

        {/* Current Goal */}
        {dashboardData.currentGoal && dashboardData.currentGoal.isActive && (
          <Card className="mb-8 bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-white">
                    Goal: {dashboardData.currentGoal.title}
                  </CardTitle>
                </div>
                <Badge className="self-start sm:self-auto bg-blue-900 text-blue-300 border-blue-700">
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
              <div className="space-y-4">
                <Progress
                  value={
                    (dashboardData.currentGoal.currentAmount /
                      dashboardData.currentGoal.targetAmount) *
                    100
                  }
                  className="h-3"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    ${dashboardData.currentGoal.currentAmount.toLocaleString()}{" "}
                    raised
                  </span>
                  <span className="font-semibold text-white">
                    ${dashboardData.currentGoal.targetAmount.toLocaleString()}{" "}
                    goal
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <Link href="/dashboard/goals" className="flex-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Goal
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    onClick={() => {
                      const shareText = `Help me reach my goal: ${dashboardData.currentGoal?.title}! $${dashboardData.currentGoal?.currentAmount}/$${dashboardData.currentGoal?.targetAmount} raised so far.`;
                      if (navigator.share) {
                        navigator.share({ text: shareText });
                      } else {
                        navigator.clipboard.writeText(shareText);
                      }
                    }}
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
          className="space-y-6"
        >
          {/* Mobile Tab Selector */}
          <div className="md:hidden">
            <Button
              variant="outline"
              className="w-full justify-between bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="flex items-center">
                {activeTab === "overview" && (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                {activeTab === "analytics" && (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                {activeTab === "transactions" && (
                  <WalletIcon className="h-4 w-4 mr-2" />
                )}
                {activeTab === "community" && (
                  <Users className="h-4 w-4 mr-2" />
                )}
                {activeTab === "sharing" && <Share2 className="h-4 w-4 mr-2" />}
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {mobileMenuOpen && (
              <div className="absolute mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg p-2 z-50">
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
                  <Button
                    key={tab.value}
                    variant="ghost"
                    className={`w-full justify-start mb-1 last:mb-0 ${
                      activeTab === tab.value
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                    onClick={() => {
                      setActiveTab(tab.value);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Tabs */}
          <TabsList className="hidden md:grid w-full grid-cols-5 bg-gray-800 border-gray-700">
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
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Zap className="h-5 w-5 mr-3 text-blue-500" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your tiptagI presence
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Your Tip Link
                    </label>
                    <div className="flex space-x-2">
                      <code className="flex-1 px-3 py-2 bg-gray-700 rounded text-sm font-mono text-gray-300 truncate">
                        tiptagi.com/tip/{dashboardData.user.tipTag}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyTipLink}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                      >
                        {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/${dashboardData.user.tipTag}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </Link>
                    <Link href="/dashboard/profile">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                  <Link href="/dashboard/settings">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Tips */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-white">
                        <Gift className="h-5 w-5 mr-3 text-green-500" />
                        Recent Tips
                      </CardTitle>
                      <Link href="/dashboard/tips">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
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
                          className={`p-4 rounded-lg border ${
                            tip.isHighlighted
                              ? "bg-yellow-900/20 border-yellow-700"
                              : "bg-gray-700 border-gray-600"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-xl font-bold text-white">
                                ${tip.amount.toFixed(2)}
                              </span>
                              <Badge className="bg-gray-600 text-gray-300">
                                {tip.tipperName}
                              </Badge>
                              {tip.isHighlighted && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                          </div>
                          {tip.message && (
                            <p className="text-gray-300 italic mb-2">
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
              {/* Tips Chart */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Tips Over Time</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your earnings trend
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData.tipsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          formatter={(value) => [`$${value}`, "Tips"]}
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "white",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Geographic Data */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-blue-500" />
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
                        className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: country.color }}
                          ></div>
                          <span className="text-white font-medium">
                            {country.country}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-600 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${country.percentage}%`,
                                backgroundColor: country.color,
                              }}
                            ></div>
                          </div>
                          <span className="text-gray-300 w-10 text-right">
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
          <TabsContent value="transactions">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Activity className="h-5 w-5 mr-3 text-blue-500" />
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
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            transaction.type === "tip_received"
                              ? "bg-green-600"
                              : "bg-blue-600"
                          }`}
                        >
                          {transaction.type === "tip_received" ? (
                            <ArrowDownLeft className="h-4 w-4 text-white" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "tip_received"
                              ? "text-green-400"
                              : "text-blue-400"
                          }`}
                        >
                          {transaction.type === "tip_received" ? "+" : "-"}$
                          {transaction.amount.toFixed(2)}
                        </p>
                        <Badge
                          className={
                            transaction.status === "completed"
                              ? "bg-green-900 text-green-300 border-green-700"
                              : "bg-yellow-900 text-yellow-300 border-yellow-700"
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
          <TabsContent value="community">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Trophy className="h-5 w-5 mr-3 text-yellow-500" />
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
                        className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white text-sm font-bold">
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
                          <p className="font-semibold text-white">
                            ${tipper.amount.toFixed(2)}
                          </p>
                          {tipper.badge && (
                            <Badge
                              className={
                                tipper.badge === "Gold"
                                  ? "bg-yellow-900 text-yellow-300 border-yellow-700"
                                  : tipper.badge === "Silver"
                                  ? "bg-gray-600 text-gray-300 border-gray-500"
                                  : "bg-orange-900 text-orange-300 border-orange-700"
                              }
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

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <MessageCircle className="h-5 w-5 mr-3 text-blue-500" />
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
                          className="p-4 bg-gray-700 rounded-lg border-l-4 border-blue-500"
                        >
                          <p className="text-white italic mb-2">
                            "{tip.message}"
                          </p>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>— {tip.tipperName}</span>
                            <span>
                              {new Date(tip.createdAt).toLocaleDateString()}
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
          <TabsContent value="sharing">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Share2 className="h-5 w-5 mr-3 text-green-500" />
                    Sharing Tools
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Promote your tip page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={copyTipLink}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Get Embed Code
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    {["Twitter", "Facebook", "Instagram", "Discord"].map(
                      (platform) => (
                        <Button
                          key={platform}
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                        >
                          {platform}
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Zap className="h-5 w-5 mr-3 text-blue-500" />
                    Stream Integration
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Connect with streaming platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      title: "Streamlabs Integration",
                      description: "Show tip alerts during streams",
                    },
                    {
                      title: "OBS Integration",
                      description: "Add notifications to your scenes",
                    },
                    {
                      title: "Custom Webhook",
                      description: "Send tips to any service",
                    },
                  ].map((integration, index) => (
                    <div key={index} className="p-4 bg-gray-700 rounded-lg">
                      <h4 className="font-medium text-white mb-1">
                        {integration.title}
                      </h4>
                      <p className="text-gray-400 text-sm mb-3">
                        {integration.description}
                      </p>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Connect
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
