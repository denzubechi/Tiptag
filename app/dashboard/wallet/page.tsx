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
        return "bg-green-900 text-green-400 border-green-800";
      case "pending":
      case "processing":
        return "bg-yellow-900 text-yellow-400 border-yellow-800";
      case "failed":
        return "bg-red-900 text-red-400 border-red-800";
      default:
        return "bg-gray-800 text-gray-400 border-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load wallet data</p>
          <Button
            onClick={fetchWalletData}
            className="bg-gray-800 hover:bg-gray-700 border-gray-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-gray-400" />
              <span className="text-xl font-semibold text-white">
                Wallet & Withdrawals
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <Badge className="bg-green-900 text-green-400 border-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge className="bg-yellow-900 text-yellow-400 border-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Balance</p>
                  <p className="text-3xl font-bold text-white">
                    ${walletData.totalBalance.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Available</p>
                  <p className="text-3xl font-bold text-white">
                    ${walletData.availableBalance.toFixed(2)}
                  </p>
                </div>
                <ArrowUpRight className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending</p>
                  <p className="text-3xl font-bold text-white">
                    ${walletData.pendingBalance.toFixed(2)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Withdrawn</p>
                  <p className="text-3xl font-bold text-white">
                    ${walletData.totalWithdrawn.toFixed(2)}
                  </p>
                </div>
                <ArrowDownLeft className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <ArrowDownLeft className="h-5 w-5 mr-2 text-gray-400" />
                Withdraw Funds
              </CardTitle>
              <CardDescription className="text-gray-400">
                Transfer your earnings to your wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet Connection Status */}
              {isConnected ? (
                <Alert className="bg-green-900/20 border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">
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
                <Alert className="bg-yellow-900/20 border-yellow-800">
                  <Clock className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-400">
                    Connect your wallet for instant withdrawals, or enter a
                    wallet address for manual processing.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="withdrawAmount" className="text-gray-300">
                  Amount to Withdraw
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="withdrawAmount"
                    type="number"
                    min="1"
                    max={walletData.availableBalance}
                    step="0.01"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Available: ${walletData.availableBalance.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawAddress" className="text-gray-300">
                  Wallet Address
                </Label>
                <Input
                  id="withdrawAddress"
                  placeholder="0x..."
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600"
                />
                <p className="text-xs text-gray-500">
                  Enter the wallet address where you want to receive your funds
                </p>
              </div>

              {withdrawalResult && (
                <Alert
                  className={
                    withdrawalResult.type === "success"
                      ? "bg-green-900/20 border-green-800"
                      : "bg-red-900/20 border-red-800"
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
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {withdrawalResult.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleWithdraw}
                disabled={
                  withdrawing ||
                  isPending ||
                  isConfirming ||
                  !withdrawAmount ||
                  !withdrawAddress
                }
                className="w-full bg-gray-800 hover:bg-gray-700 text-white h-12"
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

              {error && (
                <Alert className="bg-red-900/20 border-red-800">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    Transaction failed: {error.message}
                  </AlertDescription>
                </Alert>
              )}

              {isConfirmed && (
                <Alert className="bg-green-900/20 border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">
                    Transaction confirmed! Your withdrawal has been processed.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription className="text-gray-400">
                Your latest wallet activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {walletData.recentTransactions.length > 0 ? (
                  walletData.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700">
                          {transaction.type === "tip_received" ? (
                            <ArrowUpRight className="h-5 w-5 text-gray-300" />
                          ) : transaction.type === "withdrawal" ? (
                            <ArrowDownLeft className="h-5 w-5 text-gray-300" />
                          ) : (
                            <DollarSign className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">
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
                            className="text-xs text-gray-500 hover:text-gray-400 p-0 h-auto"
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
                    <Wallet className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No transactions yet</p>
                    <p className="text-gray-500 text-sm">
                      Your wallet activity will appear here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal History */}
        <Card className="mt-8 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Withdrawal History</CardTitle>
            <CardDescription className="text-gray-400">
              Track all your withdrawal requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {walletData.withdrawals.length > 0 ? (
                walletData.withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700">
                        <ArrowDownLeft className="h-6 w-6 text-gray-300" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          ${withdrawal.amount.toFixed(2)} Withdrawal
                        </p>
                        <p className="text-sm text-gray-400">
                          To: {withdrawal.walletAddress.slice(0, 6)}...
                          {withdrawal.walletAddress.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-500">
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
                            className="text-xs text-gray-500 hover:text-gray-400 p-1 h-auto"
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
                            className="text-xs text-gray-500 hover:text-gray-400 p-1 h-auto"
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
                  <ArrowDownLeft className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No withdrawals yet</p>
                  <p className="text-gray-500 text-sm">
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
