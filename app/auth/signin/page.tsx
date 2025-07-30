"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  WalletIcon,
  CheckCircle,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
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
  Avatar,
} from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";

export default function SignInPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSignIn = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      // Successful login
      router.push("/dashboard");
    } catch (error) {
      setError("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
        <div
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: "all 0.3s ease-out",
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border-white/20 relative z-10 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <Heart className="h-10 w-10 text-blue-400 animate-pulse" />
              <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-lg animate-pulse" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Tiptag
            </span>
          </div>
          <CardTitle className="text-3xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-white/70 text-lg">
            Connect your wallet to access your creator dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {!isConnected && (
            <>
              <Alert className="bg-blue-500/10 border-blue-500/30">
                <WalletIcon className="h-5 w-5 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  Sign in with the same wallet you used to create your Tiptag
                  account. Your wallet is your login credential.
                </AlertDescription>
              </Alert>

              <div className="flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <Wallet>
                    <ConnectWallet className="relative bg-black border-0 rounded-2xl px-8 py-4 text-white hover:bg-white/10 transition-all duration-300">
                      <WalletIcon className="h-6 w-6 mr-3" />
                      <span className="text-lg font-medium">
                        Connect Wallet
                      </span>
                    </ConnectWallet>
                    <WalletDropdown>
                      <Identity
                        className="px-4 pt-3 pb-2"
                        hasCopyAddressOnClick
                      >
                        <Avatar />
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
            </>
          )}

          {isConnected && (
            <>
              <div className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/30">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-green-300">
                      Wallet Connected
                    </p>
                    <p className="text-sm text-green-400/80">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  </div>
                  <Zap className="h-6 w-6 text-green-400 animate-pulse ml-auto" />
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <Button
                    onClick={handleSignIn}
                    className="relative w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl h-14 text-lg font-medium transition-all duration-300 transform hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-3" />
                        Sign In to Dashboard
                        <ArrowRight className="h-5 w-5 ml-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Alert className="bg-green-500/10 border-green-500/30">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <AlertDescription className="text-green-300">
                  Your wallet is connected and ready. Click above to access your
                  creator dashboard and manage your tips.
                </AlertDescription>
              </Alert>
            </>
          )}

          <div className="text-center text-white/60">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
            >
              Sign up
            </Link>
          </div>

          <div className="text-center text-white/50">
            <Link
              href="/auth/forgot-password"
              className="hover:text-white/70 transition-colors duration-300"
            >
              Need help accessing your account?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
