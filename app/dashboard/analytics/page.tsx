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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Eye,
  Heart,
  Target,
  Loader2,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

interface AnalyticsData {
  totalRevenue: number;
  totalTips: number;
  profileViews: number;
  conversionRate: number;
  averageTipAmount: number;
  revenueGrowth: number;
  viewsGrowth: number;
  conversionGrowth: number;
  tipAmountGrowth: number;
  tipsOverTime: Array<{
    date: string;
    tips: number;
    amount: number;
    views: number;
  }>;
  topReferrers: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  deviceData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  geographicData: Array<{
    country: string;
    flag: string;
    percentage: number;
    tips: number;
    amount: number;
  }>;
  hourlyData: Array<{
    hour: string;
    tips: number;
  }>;
  topContent: Array<{
    title: string;
    views: number;
    tips: number;
    conversion: number;
  }>;
  goalPerformance: Array<{
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    status: string;
    completedAt?: string;
  }>;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(
        `/api/analytics/export?timeRange=${timeRange}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-${timeRange}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white/70">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load analytics data</p>
          <Button
            onClick={fetchAnalyticsData}
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
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-bounce" />
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
              <BarChart3 className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Advanced Analytics
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="text-white/80 border-white/20 hover:bg-white/10 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl border-purple-500/30 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-300/80">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">
                    ${analyticsData.totalRevenue.toFixed(2)}
                  </p>
                  <div className="flex items-center mt-2">
                    {analyticsData.revenueGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1 text-red-400" />
                    )}
                    <span
                      className={`text-sm ${
                        analyticsData.revenueGrowth >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {analyticsData.revenueGrowth >= 0 ? "+" : ""}
                      {analyticsData.revenueGrowth.toFixed(1)}% vs last period
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-purple-400/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border-blue-500/30 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300/80">Profile Views</p>
                  <p className="text-3xl font-bold text-white">
                    {analyticsData.profileViews.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    {analyticsData.viewsGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1 text-red-400" />
                    )}
                    <span
                      className={`text-sm ${
                        analyticsData.viewsGrowth >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {analyticsData.viewsGrowth >= 0 ? "+" : ""}
                      {analyticsData.viewsGrowth.toFixed(1)}% vs last period
                    </span>
                  </div>
                </div>
                <Eye className="h-8 w-8 text-blue-400/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl border-green-500/30 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300/80">Conversion Rate</p>
                  <p className="text-3xl font-bold text-white">
                    {analyticsData.conversionRate.toFixed(1)}%
                  </p>
                  <div className="flex items-center mt-2">
                    {analyticsData.conversionGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1 text-red-400" />
                    )}
                    <span
                      className={`text-sm ${
                        analyticsData.conversionGrowth >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {analyticsData.conversionGrowth >= 0 ? "+" : ""}
                      {analyticsData.conversionGrowth.toFixed(1)}% vs last
                      period
                    </span>
                  </div>
                </div>
                <Target className="h-8 w-8 text-green-400/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl border-orange-500/30 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-300/80">Avg. Tip Amount</p>
                  <p className="text-3xl font-bold text-white">
                    ${analyticsData.averageTipAmount.toFixed(2)}
                  </p>
                  <div className="flex items-center mt-2">
                    {analyticsData.tipAmountGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1 text-red-400" />
                    )}
                    <span
                      className={`text-sm ${
                        analyticsData.tipAmountGrowth >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {analyticsData.tipAmountGrowth >= 0 ? "+" : ""}
                      {analyticsData.tipAmountGrowth.toFixed(1)}% vs last period
                    </span>
                  </div>
                </div>
                <Heart className="h-8 w-8 text-orange-400/80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/5 backdrop-blur-sm border border-white/10">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-white/70"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="audience"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-white/70"
            >
              Audience
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-white/70"
            >
              Content
            </TabsTrigger>
            <TabsTrigger
              value="geography"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-white/70"
            >
              Geography
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-white/70"
            >
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Trend</CardTitle>
                  <CardDescription className="text-white/60">
                    Tips received over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.tipsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="date" stroke="#ffffff60" />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#ffffff",
                        }}
                        formatter={(value, name) => [
                          `$${value}`,
                          name === "amount" ? "Revenue" : "Tips",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Conversion Funnel */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">
                    Conversion Funnel
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    How visitors become tippers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <span className="font-medium text-blue-300">
                        Profile Views
                      </span>
                      <span className="text-2xl font-bold text-blue-400">
                        {analyticsData.profileViews.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                      <span className="font-medium text-purple-300">
                        Tip Page Views
                      </span>
                      <span className="text-2xl font-bold text-purple-400">
                        {Math.round(
                          analyticsData.profileViews * 0.26
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                      <span className="font-medium text-green-300">
                        Tips Completed
                      </span>
                      <span className="text-2xl font-bold text-green-400">
                        {analyticsData.totalTips}
                      </span>
                    </div>
                    <div className="text-center pt-4">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2">
                        Overall Conversion:{" "}
                        {analyticsData.conversionRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Peak Hours */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">
                    Peak Tipping Hours
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    When your audience is most active
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analyticsData.hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="hour" stroke="#ffffff60" />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#ffffff",
                        }}
                      />
                      <Bar
                        dataKey="tips"
                        fill="#06b6d4"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Device Usage</CardTitle>
                  <CardDescription className="text-white/60">
                    How supporters access your page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={analyticsData.deviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analyticsData.deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#ffffff",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {analyticsData.deviceData.map((device, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: device.color }}
                          ></div>
                          <span className="text-sm font-medium text-white">
                            {device.name}
                          </span>
                        </div>
                        <span className="text-sm text-white/60">
                          {device.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Traffic Sources</CardTitle>
                  <CardDescription className="text-white/60">
                    Where your visitors come from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topReferrers.map((source, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {source.source[0]}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {source.source}
                            </p>
                            <p className="text-sm text-white/60">
                              {source.visitors} visitors
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {source.percentage}%
                          </p>
                          <div className="w-16 bg-white/20 rounded-full h-2 mt-1">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${source.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Audience Insights */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">
                    Audience Insights
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Key demographics and behavior
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3 text-white">
                        Age Distribution
                      </h4>
                      <div className="space-y-2">
                        {[
                          {
                            range: "18-24",
                            percentage: 25,
                            color: "bg-blue-500",
                          },
                          {
                            range: "25-34",
                            percentage: 40,
                            color: "bg-purple-500",
                          },
                          {
                            range: "35-44",
                            percentage: 20,
                            color: "bg-green-500",
                          },
                          {
                            range: "45+",
                            percentage: 15,
                            color: "bg-orange-500",
                          },
                        ].map((age, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm text-white">
                              {age.range}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-white/20 rounded-full h-2">
                                <div
                                  className={`${age.color} h-2 rounded-full`}
                                  style={{ width: `${age.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm w-8 text-white/60">
                                {age.percentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 text-white">
                        Engagement Metrics
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                          <div className="text-xl font-bold text-blue-400">
                            2.4m
                          </div>
                          <div className="text-xs text-blue-300">
                            Avg. Session
                          </div>
                        </div>
                        <div className="text-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                          <div className="text-xl font-bold text-green-400">
                            3.2
                          </div>
                          <div className="text-xs text-green-300">
                            Pages/Session
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">
                  Top Performing Content
                </CardTitle>
                <CardDescription className="text-white/60">
                  Which parts of your profile drive the most engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topContent.map((content, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-white">
                          {content.title}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-white/60">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {content.views} views
                          </span>
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {content.tips} tips
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-400">
                          {content.conversion}%
                        </div>
                        <div className="text-xs text-white/50">conversion</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Geography Tab */}
          <TabsContent value="geography" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">
                    Geographic Distribution
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Where your supporters are located
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.geographicData.map((country, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{country.flag}</span>
                          <div>
                            <p className="font-medium text-white">
                              {country.country}
                            </p>
                            <p className="text-sm text-white/60">
                              ${country.amount.toFixed(2)} in tips
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {country.percentage}%
                          </p>
                          <div className="w-16 bg-white/20 rounded-full h-2 mt-1">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${country.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">
                    Time Zone Analysis
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    When your global audience is active
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        timezone: "EST (UTC-5)",
                        active: "8 PM - 11 PM",
                        percentage: 35,
                      },
                      {
                        timezone: "PST (UTC-8)",
                        active: "7 PM - 10 PM",
                        percentage: 25,
                      },
                      {
                        timezone: "GMT (UTC+0)",
                        active: "6 PM - 9 PM",
                        percentage: 20,
                      },
                      {
                        timezone: "CET (UTC+1)",
                        active: "7 PM - 10 PM",
                        percentage: 15,
                      },
                      {
                        timezone: "AEST (UTC+10)",
                        active: "8 PM - 11 PM",
                        percentage: 5,
                      },
                    ].map((tz, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-white">
                            {tz.timezone}
                          </span>
                          <span className="text-sm text-white/60">
                            {tz.percentage}%
                          </span>
                        </div>
                        <div className="text-sm text-white/60">
                          Peak: {tz.active}
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${tz.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Goal Performance</CardTitle>
                  <CardDescription className="text-white/60">
                    How your funding goals are performing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.goalPerformance.map((goal, index) => (
                      <div
                        key={goal.id}
                        className={`p-4 rounded-xl border ${
                          goal.status === "active"
                            ? "bg-green-500/10 border-green-500/30"
                            : goal.status === "completed"
                            ? "bg-blue-500/10 border-blue-500/30"
                            : "bg-purple-500/10 border-purple-500/30"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4
                            className={`font-semibold ${
                              goal.status === "active"
                                ? "text-green-300"
                                : goal.status === "completed"
                                ? "text-blue-300"
                                : "text-purple-300"
                            }`}
                          >
                            {goal.title}
                          </h4>
                          <Badge
                            className={
                              goal.status === "active"
                                ? "bg-green-600 text-white"
                                : goal.status === "completed"
                                ? "bg-blue-600 text-white"
                                : "bg-purple-600 text-white"
                            }
                          >
                            {goal.status}
                          </Badge>
                        </div>
                        <div
                          className={`text-2xl font-bold mb-1 ${
                            goal.status === "active"
                              ? "text-green-400"
                              : goal.status === "completed"
                              ? "text-blue-400"
                              : "text-purple-400"
                          }`}
                        >
                          ${goal.currentAmount.toFixed(2)} / $
                          {goal.targetAmount.toFixed(2)}
                        </div>
                        <div
                          className={`text-sm ${
                            goal.status === "active"
                              ? "text-green-300"
                              : goal.status === "completed"
                              ? "text-blue-300"
                              : "text-purple-300"
                          }`}
                        >
                          {goal.status === "completed" && goal.completedAt
                            ? `Completed on ${new Date(
                                goal.completedAt
                              ).toLocaleDateString()}`
                            : `${Math.round(
                                (goal.currentAmount / goal.targetAmount) * 100
                              )}% complete`}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Goal Analytics</CardTitle>
                  <CardDescription className="text-white/60">
                    Insights about your funding campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                        <div className="text-2xl font-bold text-purple-400">
                          {
                            analyticsData.goalPerformance.filter(
                              (g) => g.status === "completed"
                            ).length
                          }
                        </div>
                        <div className="text-sm text-purple-300">
                          Goals Completed
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                        <div className="text-2xl font-bold text-blue-400">
                          {analyticsData.goalPerformance.length > 0
                            ? Math.round(
                                (analyticsData.goalPerformance.filter(
                                  (g) => g.status === "completed"
                                ).length /
                                  analyticsData.goalPerformance.length) *
                                  100
                              )
                            : 0}
                          %
                        </div>
                        <div className="text-sm text-blue-300">
                          Success Rate
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-white">
                          Average Goal Size
                        </span>
                        <span className="font-bold text-white">
                          $
                          {analyticsData.goalPerformance.length > 0
                            ? (
                                analyticsData.goalPerformance.reduce(
                                  (sum, g) => sum + g.targetAmount,
                                  0
                                ) / analyticsData.goalPerformance.length
                              ).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-white">
                          Total Raised via Goals
                        </span>
                        <span className="font-bold text-green-400">
                          $
                          {analyticsData.goalPerformance
                            .reduce((sum, g) => sum + g.currentAmount, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <h4 className="font-medium mb-3 text-white">
                        Goal Impact
                      </h4>
                      <div className="text-sm text-white/60 space-y-1">
                        <p>• Goals increase tip frequency by 40%</p>
                        <p>• Average tip amount is 25% higher during goals</p>
                        <p>
                          • Profile views increase by 60% when goals are active
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
