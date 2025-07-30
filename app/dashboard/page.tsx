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
  Menu,
  X,
  ChevronDown,
  TrendingDown,
  Activity,
  Globe,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("tips");

  // Mock data for demo purposes
  useEffect(() => {
    if (isConnected) {
      // Simulate API call
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
            { country: "United States", percentage: 45, color: "#8b5cf6" },
            { country: "Canada", percentage: 25, color: "#ec4899" },
            { country: "United Kingdom", percentage: 20, color: "#06b6d4" },
            { country: "Others", percentage: 10, color: "#10b981" },
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

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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
    // Simulate withdrawal
    setTimeout(() => {
      setWithdrawalLoading(false);
      alert("Withdrawal initiated successfully!");
    }, 2000);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-slate-900" />
          <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 md:w-80 md:h-80 bg-blue-500/10 rounded-full blur-3xl animate-bounce" />
          <div className="absolute top-3/4 left-1/2 w-24 h-24 md:w-48 md:h-48 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-1000" />
        </div>

        <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border-white/20 relative z-10 shadow-2xl">
          <CardHeader className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="relative">
                <Heart className="h-8 w-8 md:h-10 md:w-10 text-purple-400 animate-pulse" />
                <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-lg animate-pulse" />
              </div>
              <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                tiptagI
              </span>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Connect Your Wallet
              </CardTitle>
              <CardDescription className="text-white/70 text-sm md:text-base">
                Connect your wallet to access your creator dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <Wallet>
                  <ConnectWallet className="relative bg-black border-0 rounded-2xl px-6 py-3 md:px-8 md:py-4 text-white hover:bg-white/10 transition-all duration-300">
                    <WalletIcon className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                    <span className="text-base md:text-lg font-medium">
                      Connect Wallet
                    </span>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden flex items-center justify-center p-4">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-slate-900" />
          <div
            className="absolute w-48 h-48 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
            style={{
              left: Math.max(0, mousePosition.x - 96),
              top: Math.max(0, mousePosition.y - 96),
              transition: "all 0.3s ease-out",
            }}
          />
        </div>
        <div className="text-center relative z-10 space-y-6">
          <div className="relative">
            <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-purple-400 mx-auto" />
            <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-white/70 text-lg md:text-xl">
              Loading your dashboard...
            </p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 text-white relative overflow-hidden flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <X className="h-8 w-8 text-red-400" />
          </div>
          <div className="space-y-2">
            <p className="text-red-400 text-lg font-medium">
              Oops! Something went wrong
            </p>
            <p className="text-white/70">{error}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-6 py-3"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const statCards = [
    {
      title: "Total Earnings",
      value: `$${dashboardData.user.totalTipsReceived.toFixed(2)}`,
      subtitle: "All time",
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-500",
      change: "+12.5%",
      changeType: "positive",
    },
    {
      title: "Available Balance",
      value: `$${dashboardData.user.walletBalance.toFixed(2)}`,
      subtitle: "Ready to withdraw",
      icon: WalletIcon,
      gradient: "from-blue-500 to-cyan-500",
      change: "+$125.50",
      changeType: "positive",
    },
    {
      title: "Total Tips",
      value: dashboardData.user.totalTipCount.toString(),
      subtitle: `Avg: $${dashboardData.analytics.averageTip.toFixed(2)}`,
      icon: Heart,
      gradient: "from-pink-500 to-rose-500",
      change: "+8",
      changeType: "positive",
    },
    {
      title: "Profile Views",
      value: dashboardData.analytics.profileViews.toLocaleString(),
      subtitle: `${dashboardData.analytics.conversionRate.toFixed(
        1
      )}% conversion`,
      icon: Eye,
      gradient: "from-purple-500 to-violet-500",
      change: "+156",
      changeType: "positive",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-slate-900 to-slate-900" />
        <div
          className="absolute w-32 h-32 md:w-96 md:h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{
            left: Math.max(0, mousePosition.x - 96),
            top: Math.max(0, mousePosition.y - 96),
            transition: "all 0.5s ease-out",
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-24 h-24 md:w-64 md:h-64 bg-blue-500/5 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 md:w-80 md:h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 left-1/2 w-20 h-20 md:w-48 md:h-48 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      {/* Mobile-First Header */}
      <header className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-black/30 sticky top-0">
        <div className="container mx-auto px-4 py-3 md:px-6 md:py-4">
          <div className="flex justify-between items-center">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="relative group">
                <Heart className="h-6 w-6 md:h-8 md:w-8 text-purple-400 group-hover:text-pink-400 transition-colors duration-300" />
                <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Tiptag
                </span>
                <Badge className="hidden md:flex bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30 animate-pulse">
                  <Rocket className="h-3 w-3 mr-1" />
                  Dashboard
                </Badge>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
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
              <Link href="/dashboard/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Wallet>
                <ConnectWallet className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl border-0">
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
            <div className="md:hidden flex items-center space-x-2">
              <Wallet>
                <ConnectWallet className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl border-0 px-3 py-2">
                  <OnchainAvatar className="h-5 w-5" />
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
                className="text-white hover:bg-white/10"
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
            <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4 space-y-3">
              <Link href={`/${dashboardData.user.tipTag}`}>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/20 text-white hover:bg-white/10 bg-transparent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/20 text-white hover:bg-white/10 bg-transparent"
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

      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 relative z-10">
        {/* Welcome Section - Mobile Optimized */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="space-y-2 md:space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                <span className="block bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Welcome back,
                </span>
                <span className="flex items-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {dashboardData.user.displayName}!
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-yellow-400 ml-2 md:ml-4 animate-pulse" />
                </span>
              </h1>
              <p className="text-white/70 text-base md:text-xl">
                Here's how your creator journey is progressing
              </p>
            </div>
            <Badge className="self-start md:self-auto bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 px-4 py-2 md:px-6 md:py-3 text-sm md:text-lg">
              <Trophy className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Pro Creator
            </Badge>
          </div>
        </div>

        {/* Enhanced Stats Cards - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card
                className={`bg-gradient-to-br ${stat.gradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden`}
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-xs md:text-sm font-medium text-white/90 truncate">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-white/90 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-1 md:space-y-2">
                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">
                      {stat.value}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/80 truncate">
                        {stat.subtitle}
                      </p>
                      <div
                        className={`flex items-center text-xs font-medium ${
                          stat.changeType === "positive"
                            ? "text-green-300"
                            : "text-red-300"
                        }`}
                      >
                        {stat.changeType === "positive" ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {stat.change}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Enhanced Wallet Management - Mobile First */}
        <Card className="mb-8 md:mb-12 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border-blue-500/30 shadow-2xl overflow-hidden">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <WalletIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
                  <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-lg animate-pulse" />
                </div>
                <CardTitle className="text-blue-300 text-lg md:text-2xl">
                  Wallet Management
                </CardTitle>
              </div>
              <Badge className="self-start sm:self-auto bg-green-500/20 text-green-300 border-green-500/30 animate-pulse">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                Connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  title: "Available Balance",
                  value: `$${dashboardData.user.walletBalance.toFixed(2)}`,
                  icon: ArrowDownLeft,
                  color: "green",
                  action: "Withdraw All",
                  actionColor: "bg-green-600 hover:bg-green-700",
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
                  actionColor: "bg-purple-600 hover:bg-purple-700",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 group space-y-3 md:space-y-4"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon
                      className={`h-4 w-4 md:h-5 md:w-5 text-${item.color}-400 group-hover:scale-110 transition-transform duration-300`}
                    />
                    <span className="font-medium text-white/90 text-sm md:text-base">
                      {item.title}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p
                      className={`text-lg md:text-2xl font-bold text-${item.color}-400 truncate`}
                    >
                      {item.value}
                    </p>
                    {item.subtitle && (
                      <p className="text-white/60 text-xs md:text-sm">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  {item.action && (
                    <Button
                      size="sm"
                      className={`w-full ${item.actionColor} text-white rounded-xl transition-all duration-300 transform hover:scale-105 text-xs md:text-sm`}
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
                        <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin mr-2" />
                      ) : null}
                      {item.action}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Goal Progress - Enhanced Mobile */}
        {dashboardData.currentGoal && dashboardData.currentGoal.isActive && (
          <Card className="mb-8 md:mb-12 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-xl border-indigo-500/30 shadow-2xl overflow-hidden">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 md:h-6 md:w-6 text-indigo-400 animate-pulse" />
                  <CardTitle className="text-indigo-300 text-lg md:text-2xl">
                    Goal: {dashboardData.currentGoal.title}
                  </CardTitle>
                </div>
                <Badge className="self-start sm:self-auto bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-sm md:text-lg px-3 py-1 md:px-4 md:py-2">
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
              <div className="space-y-4 md:space-y-6">
                <div className="relative">
                  <Progress
                    value={
                      (dashboardData.currentGoal.currentAmount /
                        dashboardData.currentGoal.targetAmount) *
                      100
                    }
                    className="h-3 md:h-4 bg-white/10"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur animate-pulse" />
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0 text-sm md:text-lg">
                  <span className="text-white/80">
                    ${dashboardData.currentGoal.currentAmount.toLocaleString()}{" "}
                    raised
                  </span>
                  <span className="font-semibold text-indigo-300">
                    ${dashboardData.currentGoal.targetAmount.toLocaleString()}{" "}
                    goal
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <Link href="/dashboard/goals" className="flex-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300 backdrop-blur-sm bg-transparent"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Goal
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300 backdrop-blur-sm bg-transparent"
                    onClick={() => {
                      const shareText = `Help me reach my goal: ${dashboardData.currentGoal?.title}! $${dashboardData.currentGoal?.currentAmount}/$${dashboardData.currentGoal?.targetAmount} raised so far. Support me at https://tiptagi.com/tip/${dashboardData.user.tipTag}`;
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

        {/* Enhanced Mobile-First Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 md:space-y-8"
        >
          {/* Mobile Tab Navigation */}
          <div className="md:hidden">
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-between bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
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
                  {activeTab === "sharing" && (
                    <Share2 className="h-4 w-4 mr-2" />
                  )}
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 z-50">
                  {[
                    { value: "overview", icon: BarChart3, label: "Overview" },
                    {
                      value: "analytics",
                      icon: TrendingUp,
                      label: "Analytics",
                    },
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
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          : "text-white/70 hover:text-white hover:bg-white/10"
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
          </div>

          {/* Desktop Tab Navigation */}
          <TabsList className="hidden md:grid w-full grid-cols-5 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-2">
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

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Quick Actions - Mobile Optimized */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <Zap className="h-5 w-5 md:h-6 md:w-6 mr-3 text-purple-400" />
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Quick Actions
                    </span>
                  </CardTitle>
                  <CardDescription className="text-white/70 text-sm md:text-base">
                    Manage your tiptagI presence
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/90">
                      Your Tip Link
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <code className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-white/5 rounded-xl text-xs md:text-sm font-mono text-white/80 border border-white/10 truncate">
                        tiptagi.com/tip/{dashboardData.user.tipTag}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link href={`/${dashboardData.user.tipTag}`}>
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
                  <Link href="/dashboard/settings">
                    <Button
                      className="w-full bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                      variant="outline"
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Tips - Enhanced Mobile Layout */}
              <div className="lg:col-span-2">
                <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <CardTitle className="flex items-center text-lg md:text-xl">
                        <Gift className="h-5 w-5 md:h-6 md:w-6 mr-3 text-green-400" />
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
                    <CardDescription className="text-white/70 text-sm md:text-base">
                      Your latest supporter contributions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentTips.map((tip) => (
                        <div
                          key={tip.id}
                          className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                            tip.isHighlighted
                              ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                              <div className="flex items-center space-x-3">
                                <span className="text-xl md:text-2xl font-bold text-white">
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
                              </div>
                              {tip.isHighlighted && (
                                <Star className="h-5 w-5 text-yellow-400 fill-current animate-pulse" />
                              )}
                            </div>
                            {tip.message && (
                              <p className="text-white/70 italic text-sm leading-relaxed">
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

          {/* Analytics Tab - Enhanced for Mobile */}
          <TabsContent value="analytics" className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Tips Over Time Chart */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg md:text-xl">
                    Tips Over Time
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Your earnings trend over the past months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData.tipsOverTime}>
                        <defs>
                          <linearGradient
                            id="colorGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#8b5cf6"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#8b5cf6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="rgba(255,255,255,0.7)"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="rgba(255,255,255,0.7)"
                          fontSize={12}
                          tickLine={false}
                        />
                        <Tooltip
                          formatter={(value) => [`$${value}`, "Tips"]}
                          contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.8)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "12px",
                            color: "white",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          fill="url(#colorGradient)"
                          dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: "#ec4899" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Geographic Distribution */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg md:text-xl flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-blue-400" />
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
                        <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                          <div
                            className="w-3 h-3 md:w-4 md:h-4 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                            style={{ backgroundColor: country.color }}
                          ></div>
                          <span className="text-white/90 font-medium text-sm md:text-base truncate">
                            {country.country}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
                          <div className="w-16 md:w-24 bg-white/10 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${country.percentage}%`,
                                backgroundColor: country.color,
                              }}
                            ></div>
                          </div>
                          <span className="text-white/70 w-8 md:w-10 text-right font-medium text-sm">
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
          <TabsContent value="transactions" className="space-y-6 md:space-y-8">
            <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center text-lg md:text-xl">
                  <Activity className="h-5 w-5 md:h-6 md:w-6 mr-3 text-blue-400" />
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
                      <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                        <div
                          className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ${
                            transaction.type === "tip_received"
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : "bg-gradient-to-r from-blue-500 to-cyan-500"
                          }`}
                        >
                          {transaction.type === "tip_received" ? (
                            <ArrowDownLeft className="h-4 w-4 md:h-5 md:w-5 text-white" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-white" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white text-sm md:text-base truncate">
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
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`font-semibold text-base md:text-lg ${
                            transaction.type === "tip_received"
                              ? "text-green-400"
                              : "text-blue-400"
                          }`}
                        >
                          {transaction.type === "tip_received" ? "+" : "-"}$
                          {transaction.amount.toFixed(2)}
                        </p>
                        <Badge
                          className={`text-xs ${
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
          <TabsContent value="community" className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Top Supporters */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <Trophy className="h-5 w-5 md:h-6 md:w-6 mr-3 text-yellow-400" />
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
                        <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm md:text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white text-sm md:text-base truncate">
                              {tipper.name}
                            </p>
                            <p className="text-xs text-white/60">
                              {tipper.tipCount} tips
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-white text-base md:text-lg">
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
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <MessageCircle className="h-5 w-5 md:h-6 md:w-6 mr-3 text-blue-400" />
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
                          <p className="text-white/90 italic mb-3 leading-relaxed text-sm md:text-base">
                            "{tip.message}"
                          </p>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0 text-xs text-white/60">
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

          {/* Sharing Tab - Enhanced Mobile */}
          <TabsContent value="sharing" className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Sharing Tools */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <Share2 className="h-5 w-5 md:h-6 md:w-6 mr-3 text-green-400" />
                    <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      Sharing Tools
                    </span>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Promote your tip page across platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <Button
                        variant="outline"
                        onClick={copyTipLink}
                        className="relative w-full bg-black border-0 text-white hover:bg-white/10 transition-all duration-300 rounded-2xl h-10 md:h-12"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <Button
                        variant="outline"
                        className="relative w-full bg-black border-0 text-white hover:bg-white/10 transition-all duration-300 rounded-2xl h-10 md:h-12"
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
                      className="relative w-full bg-black border-0 text-white hover:bg-white/10 transition-all duration-300 rounded-2xl h-10 md:h-12"
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
                          color: "from-blue-600 to-blue-700",
                          action: () => {
                            const url = `https://tiptagi.com/tip/${dashboardData.user.tipTag}`;
                            window.open(
                              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                url
                              )}`
                            );
                          },
                        },
                        {
                          name: "Instagram",
                          color: "from-pink-500 to-rose-600",
                          action: () => {
                            copyTipLink();
                          },
                        },
                        {
                          name: "Discord",
                          color: "from-indigo-500 to-purple-600",
                          action: () => {
                            copyTipLink();
                          },
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
                            className="relative w-full bg-black border-0 text-white hover:bg-white/10 transition-all duration-300 rounded-xl h-9"
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
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <Zap className="h-5 w-5 md:h-6 md:w-6 mr-3 text-purple-400" />
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Stream Integration
                    </span>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Connect with streaming platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
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
                      className={`p-4 md:p-6 bg-gradient-to-r ${integration.color} rounded-2xl border ${integration.borderColor} hover:scale-105 transition-all duration-300 group space-y-3 md:space-y-4`}
                    >
                      <h4 className="font-medium text-white text-sm md:text-base">
                        {integration.title}
                      </h4>
                      <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                        {integration.description}
                      </p>
                      <div className="relative">
                        <div
                          className={`absolute -inset-1 bg-gradient-to-r ${integration.buttonColor} rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300`}
                        ></div>
                        <Button
                          size="sm"
                          className={`relative bg-gradient-to-r ${integration.buttonColor} hover:scale-105 text-white rounded-xl transition-all duration-300 border-0 text-xs md:text-sm`}
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
