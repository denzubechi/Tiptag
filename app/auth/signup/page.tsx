"use client";

import type React from "react";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  Mail,
  CheckCircle,
  WalletIcon,
  Sparkles,
  ArrowRight,
  Zap,
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

export default function SignUpPage() {
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    tipTag: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: wallet connect, 2: form, 3: verification
  const [errors, setErrors] = useState<string[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate tip tag from display name
    if (name === "displayName") {
      const suggestedTag = value.toLowerCase().replace(/[^a-z0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        tipTag: suggestedTag,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!isConnected) newErrors.push("Please connect your wallet first");
    if (!formData.email) newErrors.push("Email is required");
    if (!formData.displayName) newErrors.push("Display name is required");
    if (!formData.tipTag) newErrors.push("Tip tag is required");
    if (formData.tipTag.length < 3)
      newErrors.push("Tip tag must be at least 3 characters");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          walletAddress: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors([data.error]);
        return;
      }

      setStep(3);
    } catch (error) {
      setErrors(["Failed to create account. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-blue-900/20" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-bounce" />
        </div>

        <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border-white/20 relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-2xl">
              <CheckCircle className="h-10 w-10 text-white animate-pulse" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-white/70 text-lg">
              We've sent a verification link to {formData.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-green-500/10 border-green-500/30">
              <Mail className="h-5 w-5 text-green-400" />
              <AlertDescription className="text-green-300">
                Click the verification link in your email to activate your
                account and start receiving tips!
              </AlertDescription>
            </Alert>
            <div className="text-center text-white/60">
              Didn't receive the email?
              <Button
                variant="link"
                className="p-0 ml-2 h-auto text-green-400 hover:text-green-300"
              >
                Resend verification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
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
      </div>

      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border-white/20 relative z-10 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <Heart className="h-10 w-10 text-purple-400 animate-pulse" />
              <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-lg animate-pulse" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Tiptag
            </span>
          </div>
          <CardTitle className="text-3xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-white/70 text-lg">
            Connect your wallet and start receiving tips today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Wallet Connection */}
          {!isConnected && (
            <div className="space-y-6">
              <Alert className="bg-purple-500/10 border-purple-500/30">
                <WalletIcon className="h-5 w-5 text-purple-400" />
                <AlertDescription className="text-purple-300">
                  Connect your wallet to create your Tiptag account. Your wallet
                  will be used to receive tips and manage your funds.
                </AlertDescription>
              </Alert>

              <div className="flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
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
            </div>
          )}

          {/* Step 2: Account Details Form */}
          {isConnected && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.length > 0 && (
                <Alert className="bg-red-500/10 border-red-500/30">
                  <AlertDescription className="text-red-300">
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Connected Wallet Display */}
              <div className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/30">
                <div className="flex items-center space-x-4">
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
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="creator@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl h-12"
                  />
                  <p className="text-xs text-white/50">
                    Used for notifications and account recovery
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white/90">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    placeholder="Your Creator Name"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    required
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipTag" className="text-white/90">
                    Your Tip Tag
                  </Label>
                  <div className="flex rounded-xl overflow-hidden">
                    <span className="inline-flex items-center px-4 bg-white/10 border border-r-0 border-white/20 text-white/70 text-sm">
                      get-tiptag.vercel.app/tip/
                    </span>
                    <Input
                      id="tipTag"
                      name="tipTag"
                      placeholder="yourname"
                      value={formData.tipTag}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500 focus:ring-purple-500/20 rounded-l-none h-12"
                      required
                    />
                  </div>
                  <p className="text-xs text-white/50">
                    This will be your unique tip page URL
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <Button
                  type="submit"
                  className="relative w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl h-14 text-lg font-medium transition-all duration-300 transform hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-3" />
                      Create Account
                      <ArrowRight className="h-5 w-5 ml-3" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center text-white/60">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-purple-400 hover:text-purple-300 transition-colors duration-300"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
