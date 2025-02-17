"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You've been added to the waitlist.",
          duration: 5000,
        });
        setEmail("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Something went wrong",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="relative w-full max-w-lg">
        {/* Background effects */}
        <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 transform rounded-full bg-purple-500 opacity-10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 transform rounded-full bg-pink-500 opacity-10 blur-3xl" />
        
        {/* Content */}
        <motion.div 
          className="relative z-10 rounded-2xl bg-surface p-8 shadow-glow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col items-center text-center space-y-6">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-xl bg-transparent"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/Icons/discord-icon.svg"
                alt="Discord"
                width={54}
                height={54}
                className="text-white"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                Join the Discord
              </h1>
              <p className="text-text-secondary">
                Be the first to experience the accuracy of true in-depth analysis
              </p>
            </div>

            <div className="flex w-full max-w-sm flex-col space-y-3">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-surface-hover border-surface-active text-text-primary placeholder:text-text-secondary"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-medium"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Joining..." : "Get invite"}
              </Button>
            </div>

            <p className="text-xs text-text-secondary">
              We know you are busy and we will not spam you, promise :)
            </p>
          </form>
        </motion.div>
      </div>
    </main>
  );
}