"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Home,
  Search,
  Briefcase,
  Trophy,
  ArrowLeft,
  Rocket,
} from "lucide-react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative  bg-backgroud overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-orb-404 orb-1"></div>
        <div className="floating-orb-404 orb-2"></div>
        <div className="floating-orb-404 orb-3"></div>
        <div className="floating-orb-404 orb-4"></div>

        <div className="shooting-star star-1"></div>
        <div className="shooting-star star-2"></div>
        <div className="shooting-star star-3"></div>
      </div>

      <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
        <div className="relative">
          <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text animate-pulse-glow">
            404
          </h1>
          <div className="absolute inset-0 text-9xl md:text-[12rem] font-bold text-purple-500/20 blur-xl animate-pulse">
            404
          </div>
        </div>

        <Card className="glass-card p-8 space-y-6 animate-fade-in-up">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Rocket className="w-16 h-16 text-purple-400 animate-bounce" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-ping"></div>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Lost in Space?
            </h2>

            <p className="text-lg text-gray-300 max-w-md mx-auto leading-relaxed">
              Looks like you've drifted into uncharted territory. The page
              you're looking for has vanished into the digital cosmos.
            </p>
          </div>
          {/* Navigation options */}
          <div className=" gap-4 mt-8">
            <Link href="/">
              <Button className="w-full glass-button text-white hover:text-white group transition-all duration-300">
                <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Return Home
              </Button>
            </Link>
          </div>
        </Card>

        <div
          className="glass-card p-4 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <p className="text-sm text-gray-400">
            <span className="text-purple-400 font-semibold">Fun Fact:</span> In
            space, no one can hear you 404.
          </p>
        </div>
      </div>

      <style jsx>{`
        .floating-orb-404 {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: float-404 8s ease-in-out infinite;
        }

        .orb-1 {
          width: 100px;
          height: 100px;
          background: radial-gradient(
            circle,
            rgba(147, 51, 234, 0.4) 0%,
            transparent 70%
          );
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 80px;
          height: 80px;
          background: radial-gradient(
            circle,
            rgba(236, 72, 153, 0.4) 0%,
            transparent 70%
          );
          top: 20%;
          right: 15%;
          animation-delay: 2s;
        }

        .orb-3 {
          width: 120px;
          height: 120px;
          background: radial-gradient(
            circle,
            rgba(59, 130, 246, 0.3) 0%,
            transparent 70%
          );
          bottom: 15%;
          left: 20%;
          animation-delay: 4s;
        }

        .orb-4 {
          width: 60px;
          height: 60px;
          background: radial-gradient(
            circle,
            rgba(168, 85, 247, 0.4) 0%,
            transparent 70%
          );
          bottom: 30%;
          right: 25%;
          animation-delay: 6s;
        }

        @keyframes float-404 {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(90deg);
          }
          50% {
            transform: translateY(-10px) translateX(-10px) rotate(180deg);
          }
          75% {
            transform: translateY(-30px) translateX(5px) rotate(270deg);
          }
        }

        .shooting-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 10px white;
        }

        .shooting-star::before {
          content: "";
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 1px;
          background: linear-gradient(90deg, white, transparent);
        }

        .star-1 {
          top: 20%;
          left: -50px;
          animation: shooting 3s linear infinite;
          animation-delay: 1s;
        }

        .star-2 {
          top: 60%;
          left: -50px;
          animation: shooting 3s linear infinite;
          animation-delay: 3s;
        }

        .star-3 {
          top: 80%;
          left: -50px;
          animation: shooting 3s linear infinite;
          animation-delay: 5s;
        }

        @keyframes shooting {
          0% {
            transform: translateX(-50px) translateY(0px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100vw + 50px)) translateY(-200px);
            opacity: 0;
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            text-shadow: 0 0 20px rgba(147, 51, 234, 0.5),
              0 0 40px rgba(147, 51, 234, 0.3), 0 0 60px rgba(147, 51, 234, 0.2);
          }
          50% {
            text-shadow: 0 0 30px rgba(147, 51, 234, 0.8),
              0 0 60px rgba(147, 51, 234, 0.5), 0 0 90px rgba(147, 51, 234, 0.3);
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
