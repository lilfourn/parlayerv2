"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, TrendingUp, LineChart, Sparkles } from "lucide-react"
import { useState } from "react"

interface NBATabsProps {
  activeTab: 'teams' | 'players' | 'projections';
  onChange: (tab: 'teams' | 'players' | 'projections') => void;
  children?: React.ReactNode[];
}

const tabItems = [
  {
    value: "teams" as const,
    label: "Teams",
    icon: Trophy,
    description: "View team standings and stats"
  },
  {
    value: "players" as const,
    label: "Players",
    icon: LineChart,
    description: "Player stats and profiles"
  },
  {
    value: "projections" as const,
    label: "Projections",
    icon: Sparkles,
    description: "Future performance predictions"
  }
]

export function NBATabs({ children, activeTab, onChange }: NBATabsProps) {
  // Map of tab values to their content indices
  const tabContentMap = {
    teams: 0,
    players: 1,
    projections: 2
  }

  return (
    <div className="w-full space-y-4">
      <div className="max-w-[1400px] mx-auto mt-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "relative p-0 rounded-xl space-y-4",
            "bg-gradient-to-br from-gray-900/90 to-gray-900/50",
            "backdrop-blur-md border border-white/10",
            "shadow-xl shadow-black/20"
          )}
        >
          {/* Tabs Header */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-DEFAULT/20">
            {tabItems.map((item) => (
              <motion.button
                key={item.value}
                onClick={() => onChange(item.value)}
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

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {children && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                {children[tabContentMap[activeTab]]}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}