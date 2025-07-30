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
import {
  Heart,
  Zap,
  Target,
  Palette,
  Share2,
  BarChart3,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Play,
  Shield,
  Globe,
  Coins,
  Rocket,
  ChevronDown,
} from "lucide-react";

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
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
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />

        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <header className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-black/50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="relative">
                <Heart className="h-7 w-7 sm:h-8 sm:w-8 text-purple-400 group-hover:text-pink-400 transition-colors duration-300" />
                <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Tiptag
              </span>
              <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 text-xs sm:text-sm animate-pulse">
                Beta
              </Badge>
            </div>
            <div className="flex space-x-2 sm:space-x-3">
              <Link href="/auth/signin">
                <Button
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2.5"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2.5">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 pt-16 pb-24 px-4 sm:pt-20 sm:pb-32 md:pt-24 md:pb-40 lg:pt-32 lg:pb-48">
        <div className="container mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 sm:px-6 sm:py-3 mb-6 sm:mb-8 border border-white/10">
              <Rocket className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 animate-bounce" />
              <span className="text-xs sm:text-sm font-medium text-white/80">
                The Future of Creator Support
              </span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent animate-pulse">
                Create,
              </span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Connect &
              </span>
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                &nbsp;Earn.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/70 mb-10 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-2">
              The most beautiful way to receive tips from your audience.
              <span className="text-purple-300"> No friction</span>,
              <span className="text-pink-300"> no barriers</span>,
              <span className="text-blue-300"> just pure support</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white text-base sm:text-lg px-8 py-4 sm:px-12 sm:py-5 md:px-14 md:py-6 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 group"
                >
                  <Heart className="h-5 w-5 mr-2 sm:h-6 sm:w-6 sm:mr-3 group-hover:animate-pulse" />
                  Start Creating
                  <ArrowRight className="h-5 w-5 ml-2 sm:h-6 sm:w-6 sm:ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/tip/nzubechi">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-8 py-4 sm:px-12 sm:py-5 md:px-14 md:py-6 rounded-2xl border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm group bg-transparent"
                >
                  <Play className="h-5 w-5 mr-2 sm:h-6 sm:w-6 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                  View Demo
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto px-4">
              {[
                {
                  value: "$7.4k+",
                  label: "Tips Processed",
                  icon: Coins,
                  color: "from-green-400 to-emerald-400",
                },
                {
                  value: "1k+",
                  label: "Active Creators",
                  icon: Users,
                  color: "from-blue-400 to-cyan-400",
                },
                {
                  value: "5k+",
                  label: "Tips Sent",
                  icon: Heart,
                  color: "from-pink-400 to-rose-400",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="group cursor-pointer"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10 transform hover:scale-105">
                    <stat.icon
                      className={`h-7 w-7 sm:h-8 sm:w-8 mx-auto mb-3 sm:mb-4 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}
                    />
                    <div
                      className={`text-3xl sm:text-4xl font-bold mb-1.5 sm:mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                    >
                      {stat.value}
                    </div>
                    <div className="text-white/60 text-sm sm:text-base group-hover:text-white/80 transition-colors duration-300">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-7 w-7 text-white/40" />
        </div>
      </section>

      <section className="relative z-10 py-24 px-4 sm:py-28 md:py-32 lg:py-40">
        <div className="container mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent leading-tight">
              Everything You Need
            </h2>
            <p className="text-base sm:text-lg text-white/60 max-w-3xl mx-auto px-2">
              Powerful tools designed to help creators build sustainable income
              streams
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description:
                  "Track your growth with beautiful insights and real-time data visualization",
                color: "from-blue-500 to-cyan-500",
                delay: "0s",
              },
              {
                icon: Target,
                title: "Interactive Goals",
                description:
                  "Set funding goals with progress bars that motivate your community",
                color: "from-green-500 to-emerald-500",
                delay: "0.1s",
              },
              {
                icon: Palette,
                title: "Custom Theming",
                description:
                  "Personalize your profile with stunning themes and custom branding",
                color: "from-purple-500 to-pink-500",
                delay: "0.2s",
              },
              {
                icon: Share2,
                title: "Sharing Tools",
                description:
                  "QR codes, embeds, and social sharing to promote everywhere",
                color: "from-orange-500 to-red-500",
                delay: "0.3s",
              },
              {
                icon: Zap,
                title: "Stream Integration",
                description:
                  "Real-time alerts for Streamlabs, OBS, and other platforms",
                color: "from-indigo-500 to-purple-500",
                delay: "0.4s",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description:
                  "Blockchain-powered payments with enterprise-grade security",
                color: "from-teal-500 to-cyan-500",
                delay: "0.5s",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group cursor-pointer"
                style={{ animationDelay: feature.delay }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-500 hover:bg-white/10 transform hover:scale-105 hover:-translate-y-2 h-full">
                  <CardHeader className="pb-4">
                    <div
                      className={`h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <feature.icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl text-white group-hover:text-white/90 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/60 group-hover:text-white/80 transition-colors duration-300 text-sm sm:text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-4 sm:py-28 md:py-32 lg:py-40">
        <div className="container mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent leading-tight">
              Simple. Powerful. Beautiful.
            </h2>
            <p className="text-base sm:text-lg text-white/60 px-2">
              Get started in minutes, grow for years
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                title: "Connect Wallet",
                description: "Link your crypto wallet in seconds",
                color: "from-purple-500 to-pink-500",
              },
              {
                step: "02",
                title: "Create Profile",
                description: "Design your stunning tip page",
                color: "from-blue-500 to-cyan-500",
              },
              {
                step: "03",
                title: "Share & Promote",
                description: "Spread the word across platforms",
                color: "from-green-500 to-emerald-500",
              },
              {
                step: "04",
                title: "Earn & Grow",
                description: "Watch your community support you",
                color: "from-orange-500 to-red-500",
              },
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div
                  className={`bg-gradient-to-r ${step.color} rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl`}
                >
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 text-white group-hover:text-white/90 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-white/60 group-hover:text-white/80 transition-colors duration-300 text-sm sm:text-base">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-4 sm:py-28 md:py-32 lg:py-40">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent leading-tight">
            Loved by Creators
          </h2>
          <p className="text-base sm:text-lg text-white/60 mb-12 sm:mb-16 px-2">
            Join thousands of creators already growing with Tiptag
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              {
                quote:
                  "The analytics dashboard completely changed how I understand my audience. I've increased my tips by 300%!",
                author: "Samuel Nzubechi",
                role: "Software Engineer",
                avatar: "S",
                color: "from-purple-400 to-pink-400",
              },
              {
                quote:
                  "The goal feature helped me raise $5,000 for new equipment in just 2 weeks. My community loves seeing the progress!",
                author: "Nkechi Enebeli",
                role: "Base Global Builder",
                avatar: "N",
                color: "from-blue-400 to-cyan-400",
              },
              {
                quote:
                  "The custom theming and embed features make my profile look incredibly professional. It's like having my own website!",
                author: "DefiDevrel",
                role: "Blockchain Developer",
                avatar: "D",
                color: "from-green-400 to-emerald-400",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-500 hover:bg-white/10 transform hover:scale-105 group"
              >
                <CardContent className="pt-6 sm:pt-8 px-6 pb-6">
                  <div className="flex items-center mb-4 sm:mb-6 justify-center sm:justify-start">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-white/80 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed group-hover:text-white transition-colors duration-300">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center justify-center sm:justify-start">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {testimonial.avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white text-sm sm:text-base group-hover:text-white/90 transition-colors duration-300">
                        {testimonial.author}
                      </p>
                      <p className="text-white/60 text-xs sm:text-sm group-hover:text-white/80 transition-colors duration-300">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 px-4 sm:py-24 md:py-32 lg:py-40">
        <div className="container mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-blue-900/20 backdrop-blur-xl rounded-3xl p-8 sm:p-12 md:p-16 lg:p-20 border border-white/10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight">
              Ready to Transform Your Creator Journey?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/70 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
              Join the next generation of creators building sustainable income
              streams with the most beautiful tip platform ever created.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-10 md:mb-12">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white text-base sm:text-lg px-8 py-4 sm:px-12 sm:py-5 md:px-14 md:py-6 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 group"
                >
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 group-hover:animate-spin" />
                  Start Free Today
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/demo/creator123">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-8 py-4 sm:px-12 sm:py-5 md:px-14 md:py-6 rounded-2xl border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm group bg-transparent"
                >
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  Explore Features
                </Button>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 md:space-x-8 text-sm sm:text-base text-white/60">
              {[
                { icon: CheckCircle, text: "Free to start" },
                { icon: CheckCircle, text: "No setup fees" },
                { icon: CheckCircle, text: "Cancel anytime" },
              ].map((item, index) => (
                <div key={index} className="flex items-center group">
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:text-white/80 transition-colors duration-300">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-12 px-4 sm:py-16 sm:px-6">
        <div className="container mx-auto text-center">
          <div className="md:grid-cols-1 grid gap-6 mb-8 sm:mb-12">
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Tiptag
                </span>
              </div>
              <p className="text-white/60 text-sm sm:text-base mb-6 leading-relaxed max-w-md">
                Empowering creators to build sustainable income streams through
                beautiful, frictionless tip experiences.
              </p>
              <div className="flex space-x-3 sm:space-x-4 justify-center">
                {["T", "I", "P"].map((letter, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold hover:scale-110 transition-transform duration-300 cursor-pointer"
                  >
                    {letter}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 sm:pt-8 flex flex-col md:flex-row justify-center items-center">
            <p className="text-white/40 text-xs sm:text-sm md:mr-4 md:mb-0 mb-2">
              © 2025 Tiptag. All rights reserved.
            </p>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <span className="text-xs sm:text-sm text-white/40">
                Made with
              </span>
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 animate-pulse" />
              <span className="text-xs sm:text-sm text-white/40">
                for creators
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
