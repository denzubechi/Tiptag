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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Wallet,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";

interface WalletData {
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  recentTransactions: Array<{
    id: string;
    type: "tip_received" | "withdrawal" | "deposit";
    amount: number;
    status: "pending" | "completed" | "failed";
    createdAt: string;
    transactionHash?: string;
    description: string;
  }>;
  withdrawals: Array<{
    id: string;
    amount: number;
    walletAddress: string;
    status: "pending" | "processing" | "completed" | "failed";
    transactionHash?: string;
    createdAt: string;
    completedAt?: string;
    failureReason?: string;
  }>;
}

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawalResult, setWithdrawalResult] = useState<any>(null);

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const {
    sendTransaction,
    data: hash,
    error,
    isPending,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      setWithdrawAddress(address);
    }
  }, [isConnected, address]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wallet", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch wallet data");
      }

      const data = await response.json();
      setWalletData(data);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      alert("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawAddress) {
      alert("Please enter amount and wallet address");
      return;
    }

    const amount = Number.parseFloat(withdrawAmount);
    if (amount <= 0 || amount > (walletData?.availableBalance || 0)) {
      alert("Invalid withdrawal amount");
      return;
    }

    setWithdrawing(true);
    setWithdrawalResult(null);

    try {
      // First, initiate withdrawal in our database
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount,
          walletAddress: withdrawAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate withdrawal");
      }

      const result = await response.json();

      // If connected to wallet, send the actual transaction
      if (isConnected && address) {
        try {
          await sendTransaction({
            to: withdrawAddress as `0x${string}`,
            value: parseEther(amount.toString()),
          });

          setWithdrawalResult({
            type: "success",
            message: "Withdrawal initiated successfully!",
            withdrawalId: result.withdrawalId,
          });
        } catch (txError) {
          console.error("Transaction error:", txError);
          setWithdrawalResult({
            type: "error",
            message: "Transaction failed. Please try again.",
          });
        }
      } else {
        setWithdrawalResult({
          type: "success",
          message: "Withdrawal request submitted successfully!",
          withdrawalId: result.withdrawalId,
        });
      }

      // Refresh wallet data
      await fetchWalletData();
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdrawal error:", error);
      setWithdrawalResult({
        type: "error",
        message: "Failed to process withdrawal. Please try again.",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "pending":
      case "processing":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white/70">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load wallet data</p>
          <Button
            onClick={fetchWalletData}
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
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-bounce" />
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
              <Wallet className="h-6 w-6 text-green-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Wallet & Withdrawals
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                <Clock className="h-3 w-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl relative z-10">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl border-green-500/30 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300/80">Total Balance</p>
                  <p className="text-3xl font-bold text-white">
                    ${walletData.totalBalance.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border-blue-500/30 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300/80">Available</p>
                  <p className="text-3xl font-bold text-white">
                    ${walletData.availableBalance.toFixed(2)}
                  </p>
                </div>
                <ArrowUpRight className="h-8 w-8 text-blue-400/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border-yellow-500/30 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-300/80">Pending</p>
                  <p className="text-3xl font-bold text-white">
                    ${walletData.pendingBalance.toFixed(2)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl border-purple-500/30 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-300/80">Withdrawn</p>
                  <p className="text-3xl font-bold text-white">
                    ${walletData.totalWithdrawn.toFixed(2)}
                  </p>
                </div>
                <ArrowDownLeft className="h-8 w-8 text-purple-400/80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <ArrowDownLeft className="h-5 w-5 mr-2 text-green-400" />
                Withdraw Funds
              </CardTitle>
              <CardDescription className="text-white/60">
                Transfer your earnings to your wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet Connection Status */}
              {isConnected ? (
                <Alert className="bg-green-500/10 border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    Wallet connected: {address?.slice(0, 6)}...
                    {address?.slice(-4)}
                    {balance && (
                      <span className="block mt-1">
                        Balance:{" "}
                        {Number.parseFloat(balance.formatted).toFixed(4)}{" "}
                        {balance.symbol}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-yellow-500/10 border-yellow-500/30">
                  <Clock className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-300">
                    Connect your wallet for instant withdrawals, or enter a
                    wallet address for manual processing.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="withdrawAmount" className="text-white/90">
                  Amount to Withdraw
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    id="withdrawAmount"
                    type="number"
                    min="1"
                    max={walletData.availableBalance}
                    step="0.01"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-green-500"
                  />
                </div>
                <p className="text-xs text-white/50">
                  Available: ${walletData.availableBalance.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawAddress" className="text-white/90">
                  Wallet Address
                </Label>
                <Input
                  id="withdrawAddress"
                  placeholder="0x..."
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-green-500"
                />
                <p className="text-xs text-white/50">
                  Enter the wallet address where you want to receive your funds
                </p>
              </div>

              {withdrawalResult && (
                <Alert
                  className={
                    withdrawalResult.type === "success"
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }
                >
                  {withdrawalResult.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertDescription
                    className={
                      withdrawalResult.type === "success"
                        ? "text-green-300"
                        : "text-red-300"
                    }
                  >
                    {withdrawalResult.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <Button
                  onClick={handleWithdraw}
                  disabled={
                    withdrawing ||
                    isPending ||
                    isConfirming ||
                    !withdrawAmount ||
                    !withdrawAddress
                  }
                  className="relative w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-2xl h-12 transition-all duration-300 transform hover:scale-105"
                >
                  {withdrawing || isPending || isConfirming ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <ArrowDownLeft className="h-5 w-5 mr-2" />
                  )}
                  {withdrawing || isPending
                    ? "Processing..."
                    : isConfirming
                    ? "Confirming..."
                    : "Withdraw Funds"}
                </Button>
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/30">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    Transaction failed: {error.message}
                  </AlertDescription>
                </Alert>
              )}

              {isConfirmed && (
                <Alert className="bg-green-500/10 border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    Transaction confirmed! Your withdrawal has been processed.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription className="text-white/60">
                Your latest wallet activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {walletData.recentTransactions.length > 0 ? (
                  walletData.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                          {transaction.type === "tip_received" ? (
                            <ArrowUpRight className="h-5 w-5 text-green-400" />
                          ) : transaction.type === "withdrawal" ? (
                            <ArrowDownLeft className="h-5 w-5 text-blue-400" />
                          ) : (
                            <DollarSign className="h-5 w-5 text-purple-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-white/60">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-bold ${
                              transaction.type === "tip_received"
                                ? "text-green-400"
                                : "text-blue-400"
                            }`}
                          >
                            {transaction.type === "tip_received" ? "+" : "-"}$
                            {transaction.amount.toFixed(2)}
                          </span>
                          {getStatusIcon(transaction.status)}
                        </div>
                        {transaction.transactionHash && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(transaction.transactionHash!)
                            }
                            className="text-xs text-white/50 hover:text-white/80 p-0 h-auto"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Hash
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="h-16 w-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No transactions yet</p>
                    <p className="text-white/40 text-sm">
                      Your wallet activity will appear here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal History */}
        <Card className="mt-8 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Withdrawal History</CardTitle>
            <CardDescription className="text-white/60">
              Track all your withdrawal requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {walletData.withdrawals.length > 0 ? (
                walletData.withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20">
                        <ArrowDownLeft className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          ${withdrawal.amount.toFixed(2)} Withdrawal
                        </p>
                        <p className="text-sm text-white/60">
                          To: {withdrawal.walletAddress.slice(0, 6)}...
                          {withdrawal.walletAddress.slice(-4)}
                        </p>
                        <p className="text-xs text-white/50">
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getStatusColor(withdrawal.status)}>
                        {getStatusIcon(withdrawal.status)}
                        <span className="ml-1 capitalize">
                          {withdrawal.status}
                        </span>
                      </Badge>
                      {withdrawal.transactionHash && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(withdrawal.transactionHash!)
                            }
                            className="text-xs text-white/50 hover:text-white/80 p-1 h-auto"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Hash
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `https://basescan.org/tx/${withdrawal.transactionHash}`,
                                "_blank"
                              )
                            }
                            className="text-xs text-white/50 hover:text-white/80 p-1 h-auto"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      )}
                      {withdrawal.failureReason && (
                        <p className="text-xs text-red-400">
                          {withdrawal.failureReason}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ArrowDownLeft className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No withdrawals yet</p>
                  <p className="text-white/40 text-sm">
                    Your withdrawal history will appear here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
