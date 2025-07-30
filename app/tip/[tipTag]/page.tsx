"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  DollarSign,
  CheckCircle,
  Loader2,
  Target,
  Sparkles,
  Mail,
  User,
  Zap,
  Star,
} from "lucide-react";
import { BasePayButton } from "@base-org/account-ui/react";
import { pay, getPaymentStatus } from "@base-org/account";

interface Creator {
  id: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  tipTag: string;
  totalTipCount: number;
  isVerified: boolean;
  walletAddress: string;
  customTheme?: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
  };
}

interface TippingGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  isActive: boolean;
  isPublic: boolean;
}

export default function TipPage() {
  const params = useParams();
  const tipTag = params.tipTag as string;

  const [creator, setCreator] = useState<Creator | null>(null);
  const [currentGoal, setCurrentGoal] = useState<TippingGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const predefinedAmounts = [5, 10, 20, 50];

  useEffect(() => {
    fetchCreatorData();
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [tipTag]);

  const fetchCreatorData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/creators/${tipTag}`);

      if (!response.ok) {
        throw new Error("Creator not found");
      }

      const data = await response.json();
      setCreator(data.creator);
      setCurrentGoal(data.currentGoal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getTipAmount = () => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return Number.parseFloat(customAmount);
    return 0;
  };
  const handlePayment = async () => {
    setPaymentLoading(true);
    setPaymentStatus(null);

    const tipAmount = getTipAmount();
    if (tipAmount <= 0 || !creator?.walletAddress) {
      setPaymentStatus({
        type: "error",
        message: "Invalid tip amount or recipient address.",
      });
      setPaymentLoading(false);
      return;
    }

    try {
      const paymentResult = await pay({
        amount: tipAmount.toFixed(2),
        to: creator.walletAddress,
        testnet: true,
        payerInfo: {
          requests: [
            { type: "email", optional: true },
            { type: "name", optional: true },
          ],
          callbackURL: `${window.location.origin}/api/payment-callback`,
        },
      });

      if (paymentResult.success) {
        const { id, payerInfoResponses } = paymentResult;
        setPaymentId(id || null);

        setPaymentStatus({
          type: "success",
          message: "Payment successful!",
          transactionHash: id,
          userInfo: payerInfoResponses,
        });

        try {
          await fetch("/api/tips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tipTag,
              amount: tipAmount,
              message,
              tipperName: payerInfoResponses?.name
                ? `${payerInfoResponses.name.firstName} ${payerInfoResponses.name.familyName}`
                : "Anonymous",
              tipperEmail: payerInfoResponses?.email || null,
              transactionHash: id,
              paymentProvider: "base-pay",
            }),
          });

          if (currentGoal && currentGoal.isActive) {
            setCurrentGoal((prev) =>
              prev
                ? {
                    ...prev,
                    currentAmount: prev.currentAmount + tipAmount,
                  }
                : null
            );
          }
        } catch (error) {
          console.error("Failed to record tip:", error);
        }
      } else {
        const { error } = paymentResult;
        setPaymentStatus({
          type: "error",
          message: `Payment failed: ${error || "Unknown error"}`,
        });
      }
    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      setPaymentStatus({
        type: "error",
        message: `Payment initiation failed: ${
          error.message || "An unexpected error occurred."
        }`,
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!paymentId) {
      setPaymentStatus({
        type: "error",
        message: "No payment ID found. Please make a payment first.",
      });
      return;
    }
    setPaymentLoading(true);
    try {
      const { status } = await getPaymentStatus({ id: paymentId });
      setPaymentStatus({ type: "info", message: `Payment status: ${status}` });
    } catch (error: any) {
      console.error("Status check failed:", error);
      setPaymentStatus({
        type: "error",
        message: `Status check failed: ${error.message || "An error occurred"}`,
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="text-center relative z-10">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-6" />
            <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
          </div>
          <p className="text-white/70 text-lg">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-gray-900/20" />
        </div>
        <Card className="w-full max-w-md text-center bg-white/5 backdrop-blur-xl border-white/20 relative z-10">
          <CardContent className="pt-8">
            <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Creator Not Found
            </h2>
            <p className="text-white/60 mb-6">
              The creator you're looking for doesn't exist or isn't available.
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus?.type === "success") {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-blue-900/20" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-bounce" />

          {/* Celebration particles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <Card className="w-full max-w-md text-center bg-white/5 backdrop-blur-xl border-white/20 relative z-10 shadow-2xl">
          <CardHeader>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-2xl animate-pulse">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Thank You!
            </CardTitle>
            <CardDescription className="text-white/70 text-lg">
              Your tip of ${getTipAmount().toFixed(2)} has been sent to{" "}
              {creator.displayName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-green-500/10 border-green-500/30">
              <Heart className="h-5 w-5 text-green-400 animate-pulse" />
              <AlertDescription className="text-green-300">
                Your support means the world to creators like{" "}
                {creator.displayName}!
              </AlertDescription>
            </Alert>

            {paymentStatus.transactionHash && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm text-white/60 mb-2">Transaction Hash:</p>
                <code className="text-xs break-all text-green-400 bg-black/20 p-2 rounded">
                  {paymentStatus.transactionHash}
                </code>
              </div>
            )}

            {paymentStatus.userInfo && (
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                <p className="text-sm font-medium text-blue-300 mb-3">
                  Payment Details:
                </p>
                <div className="space-y-2">
                  {paymentStatus.userInfo.email && (
                    <p className="text-xs text-blue-400 flex items-center">
                      <Mail className="h-3 w-3 mr-2" />
                      {paymentStatus.userInfo.email}
                    </p>
                  )}
                  {paymentStatus.userInfo.name && (
                    <p className="text-xs text-blue-400 flex items-center">
                      <User className="h-3 w-3 mr-2" />
                      {paymentStatus.userInfo.name.firstName}{" "}
                      {paymentStatus.userInfo.name.lastName}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center space-x-4 p-4 bg-white/5 rounded-xl">
              <Avatar className="h-16 w-16 ring-4 ring-purple-500/30">
                <AvatarImage src={creator.avatarUrl || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg">
                  {creator.displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold text-white text-lg">
                  {creator.displayName}
                </p>
                <p className="text-white/60">@{creator.tipTag}</p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm text-yellow-400">
                    Verified Creator
                  </span>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <Button
                onClick={() => window.location.reload()}
                className="relative w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl h-12 transition-all duration-300 transform hover:scale-105"
              >
                <Heart className="h-5 w-5 mr-2" />
                Send Another Tip
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const themeStyles = creator.customTheme
    ? {
        backgroundColor: creator.customTheme.backgroundColor,
        color: creator.customTheme.textColor,
        fontFamily: creator.customTheme.fontFamily,
      }
    : {};

  const paymentOptions = {
    amount: getTipAmount().toString(),
    to: creator.walletAddress,
    testnet: process.env.NODE_ENV !== "production",
    payerInfo: {
      requests: [
        { type: "email", optional: true },
        { type: "name", optional: true },
      ],
    },
  };

  return (
    <div
      className="min-h-screen bg-black text-white relative overflow-hidden p-4"
      style={themeStyles}
    >
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
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />

        {/* Floating hearts */}
        {[...Array(10)].map((_, i) => (
          <Heart
            key={i}
            className="absolute w-4 h-4 text-pink-400/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Creator Header */}
        <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="pt-8">
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-purple-500/30 shadow-2xl">
                  <AvatarImage src={creator.avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {creator.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-lg animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    {creator.displayName}
                  </h1>
                  {creator.isVerified && (
                    <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 animate-pulse">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-white/60 mb-3 text-lg">@{creator.tipTag}</p>
                <p className="text-white/80 leading-relaxed">{creator.bio}</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-6 p-4 bg-white/5 rounded-2xl">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-400 animate-pulse" />
                <span className="text-white/80">
                  {creator.totalTipCount} tips received
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-400 animate-bounce" />
                <span className="text-white/80">Active Creator</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Goal */}
        {currentGoal && currentGoal.isActive && currentGoal.isPublic && (
          <Card className="mb-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-xl border-indigo-500/30 shadow-2xl">
            <CardContent className="pt-8">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="h-6 w-6 text-indigo-400" />
                <h3 className="font-semibold text-indigo-300 text-xl">
                  {currentGoal.title}
                </h3>
                <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-indigo-200/80 mb-6 leading-relaxed">
                {currentGoal.description}
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <Progress
                    value={
                      (currentGoal.currentAmount / currentGoal.targetAmount) *
                      100
                    }
                    className="h-4 bg-white/10"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur animate-pulse" />
                </div>
                <div className="flex justify-between text-indigo-200">
                  <span className="font-medium">
                    ${currentGoal.currentAmount.toFixed(2)} raised
                  </span>
                  <span className="font-bold">
                    {Math.round(
                      (currentGoal.currentAmount / currentGoal.targetAmount) *
                        100
                    )}
                    % of ${currentGoal.targetAmount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tip Form */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-2xl">
              <div className="relative">
                <DollarSign className="h-8 w-8 text-green-400" />
                <div className="absolute -inset-2 bg-green-500/20 rounded-full blur-lg animate-pulse" />
              </div>
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Send a Tip
              </span>
            </CardTitle>
            <CardDescription className="text-white/70 text-lg">
              Show your support with a financial tip. No account required - pay
              with any wallet or card!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Amount Selection */}
            <div className="space-y-4">
              <Label className="text-xl font-medium text-white/90">
                Choose Amount
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {predefinedAmounts.map((amount) => (
                  <div key={amount} className="relative group">
                    <div
                      className={`absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 transition duration-300 ${
                        selectedAmount === amount
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-75"
                      }`}
                    ></div>
                    <Button
                      type="button"
                      variant={
                        selectedAmount === amount ? "default" : "outline"
                      }
                      onClick={() => handleAmountSelect(amount)}
                      className={`relative h-16 text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                        selectedAmount === amount
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl"
                          : "bg-white/5 border-white/20 text-white hover:bg-white/10"
                      }`}
                    >
                      ${amount}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Label htmlFor="customAmount" className="text-white/90">
                  Or enter custom amount
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                  <Input
                    id="customAmount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="pl-12 text-xl h-16 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500 focus:ring-purple-500/20 rounded-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Optional Message */}
            <div className="space-y-3">
              <Label htmlFor="message" className="text-white/90">
                Message (Optional)
              </Label>
              <Textarea
                id="message"
                placeholder="Leave a supportive message for the creator..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500 focus:ring-purple-500/20 rounded-2xl resize-none"
              />
            </div>

            {/* Payment Status */}
            {paymentStatus && paymentStatus.type === "error" && (
              <Alert className="bg-red-500/10 border-red-500/30">
                <AlertDescription className="text-red-300">
                  {paymentStatus.message}
                </AlertDescription>
              </Alert>
            )}

            {paymentLoading && (
              <div className="text-center py-8">
                <div className="relative">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
                  <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                </div>
                <p className="text-white/70 text-lg">Processing payment...</p>
              </div>
            )}

            {getTipAmount() >= 1 && (
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative">
                    <BasePayButton colorScheme="dark" onClick={handlePayment} />
                  </div>
                </div>

                <Alert className="bg-green-500/10 border-green-500/30">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <AlertDescription className="text-green-300">
                    Secure payment powered by Base. Pay with any wallet, card,
                    or bank account. No tiptag account required!
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {getTipAmount() < 1 && (
              <Alert className="bg-yellow-500/10 border-yellow-500/30">
                <DollarSign className="h-5 w-5 text-yellow-400" />
                <AlertDescription className="text-yellow-300">
                  Please select or enter a tip amount of at least $1 to
                  continue.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 space-y-4">
          <div className="flex items-center justify-center space-x-4 text-white/60">
            <span>Powered by</span>
            <span className="font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              tiptag
            </span>
            <span>&</span>
            <span className="font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Base
            </span>
          </div>
          <p className="text-white/50">
            The most beautiful way for creators to receive tips
          </p>
        </div>
      </div>
    </div>
  );
}
