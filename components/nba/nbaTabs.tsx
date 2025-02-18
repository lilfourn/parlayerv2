"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, TrendingUp, LineChart } from "lucide-react"
import { useState } from "react"

interface NBATabsProps {
  children?: React.ReactNode
  defaultTab?: string
}

const tabItems = [
  {
    value: "teams",
    label: "Teams",
    icon: Trophy,
    description: "View team standings and stats"
  },
  {
    value: "stats",
    label: "Stats",
    icon: LineChart,
    description: "Player and team analytics"
  },
  {
    value: "projections",
    label: "Projections",
    icon: TrendingUp,
    description: "Future performance predictions"
  }
]

export function NBATabs({ children, defaultTab = "teams" }: NBATabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className="w-full space-y-4">
      {/* Floating Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-background/40">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-DEFAULT/20">
            {tabItems.map((item) => (
              <motion.button
                key={item.value}
                onClick={() => setActiveTab(item.value)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
                  "transition-all duration-300",
                  "hover:bg-surface-hover/30",
                  activeTab === item.value && "bg-surface-DEFAULT/40",
                  "group"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon 
                  className={cn(
                    "w-5 h-5",
                    "text-text-secondary group-hover:text-primary-light",
                    activeTab === item.value && "text-primary-light",
                    "transition-colors duration-300"
                  )}
                />
                <span className={cn(
                  "text-sm font-medium",
                  "text-text-secondary group-hover:text-text-primary",
                  activeTab === item.value && "text-text-primary",
                  "transition-colors duration-300"
                )}>
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1400px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "p-6",
              "bg-gray-900",
              "rounded-[24px]",
              "relative overflow-hidden",
              "transform-gpu transition-all duration-150 ease-out"
            )}
          >
            <div className="relative z-10">
              {activeTab === "teams" && children}
              {activeTab === "stats" && (
                <h2 className="text-2xl font-bold text-white/90 tracking-wide">NBA Stats</h2>
              )}
              {activeTab === "projections" && (
                <h2 className="text-2xl font-bold text-white/90 tracking-wide">NBA Projections</h2>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}