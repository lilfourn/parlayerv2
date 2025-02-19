"use client"

import Link from "next/link"
import Image from "next/image"
import { ThreeDCard } from "@/components/dashboard/3d-card"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"
import { useNBAStore } from "@/store/nba-store"

interface SportCard {
  title: string
  subtitle: string
  icon: string
  gradient: string
  span: { row: number; col: number }
  href?: string
}

const sportsCards: SportCard[] = [
  {
    title: "Basketball",
    subtitle: "Live Games",
    icon: "/3d Sports Icons/3d-basketball.svg",
    gradient: "from-orange-500/20 via-orange-400/10 to-orange-300/5",
    span: { row: 1, col: 2 },
    href: "/dashboard/basketball"
  },
  {
    title: "Soccer",
    subtitle: "Match Stats",
    icon: "/3d Sports Icons/3d-soccer.svg",
    gradient: "from-blue-500/20 via-blue-400/10 to-blue-300/5",
    span: { row: 1, col: 1 }
  },
  {
    title: "Tennis",
    subtitle: "Tournament",
    icon: "/3d Sports Icons/3d-tennis.svg",
    gradient: "from-green-500/20 via-green-400/10 to-green-300/5",
    span: { row: 1, col: 1 }
  },
  {
    title: "Football",
    subtitle: "Game Analysis",
    icon: "/3d Sports Icons/3d-football.svg",
    gradient: "from-red-500/20 via-red-400/10 to-red-300/5",
    span: { row: 1, col: 2 }
  },
  {
    title: "Esports",
    subtitle: "Live Streams",
    icon: "/3d Sports Icons/headset.svg",
    gradient: "from-purple-500/20 via-purple-400/10 to-purple-300/5",
    span: { row: 1, col: 2 }
  }
]

export default function DashboardPage() {
  const [sidebarWidth, setSidebarWidth] = useState(72)
  const loadTeams = useNBAStore(state => state.loadTeams);

  useEffect(() => {
    const sidebar = document.querySelector('[class*="fixed left-0 top-0 h-screen"]')
    if (!sidebar) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSidebarWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(sidebar)
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  return (
    <motion.div 
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ 
        paddingLeft: `${sidebarWidth + 8}px`,
        paddingRight: '0.5rem',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 25%)',
        backgroundSize: '24px 24px'
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <div className="grid gap-4 sm:gap-6 auto-rows-[200px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {sportsCards.map((card, index) => {
          const gridClasses = {
            'col-span-1 sm:col-span-2 lg:col-span-2': card.span.col === 2,
            'col-span-1': card.span.col === 1
          }

          const CardContent = (
            <ThreeDCard 
              title={card.title}
              subtitle={card.subtitle}
              className={cn(
                "group relative",
                `bg-gradient-to-br ${card.gradient}`
              )}
              size={card.span.col === 2 ? "lg" : "md"}
              ariaLabel={`View ${card.title} ${card.subtitle}`}
            >
              <div className={cn(
                "absolute inset-0 transition-all duration-500",
                "icon-hover will-change-transform",
                card.span.col === 2 ? "-right-12 -bottom-10" : "-right-14 -bottom-12"
              )}>
                <Image
                  src={card.icon}
                  alt={`${card.title} Icon`}
                  fill
                  className={cn(
                    "object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]",
                    card.span.col === 2 ? "scale-[1.6]" : "scale-[1.4]",
                    "transform-gpu"
                  )}
                  priority={index < 4}
                />
              </div>
            </ThreeDCard>
          )

          return card.href ? (
            <Link 
              key={card.title} 
              href={card.href}
              className={cn(gridClasses)}
            >
              {CardContent}
            </Link>
          ) : (
            <div 
              key={card.title}
              className={cn(gridClasses)}
            >
              {CardContent}
            </div>
          )
        })}

        {/* View All Sports Card */}
        <ThreeDCard
          title={
            <div className="flex items-center gap-2">
              View All Sports
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          }
          subtitle="Explore More Games"
          className="group relative bg-gradient-to-br from-gray-500/20 via-gray-400/10 to-gray-300/5 col-span-1 sm:col-span-2 lg:col-span-2"
          size="lg"
          ariaLabel="View all sports"
        >
          <div className="absolute inset-0 transition-all duration-500 icon-hover will-change-transform -right-12 -bottom-10">
            <div className="relative w-full h-full">
              {sportsCards.map((card, index) => (
                <div
                  key={card.title}
                  className={cn(
                    "absolute w-[40%] h-[40%]",
                    "transition-all duration-500",
                    index === 0 && "right-[30%] top-[10%] scale-75",
                    index === 1 && "right-[10%] top-[30%] scale-75",
                    index === 2 && "right-[50%] top-[30%] scale-75",
                    index === 3 && "right-[20%] top-[50%] scale-75",
                    index === 4 && "right-[40%] top-[50%] scale-75",
                  )}
                >
                  <Image
                    src={card.icon}
                    alt={`${card.title} Icon`}
                    fill
                    className="object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.3)] transform-gpu"
                  />
                </div>
              ))}
            </div>
          </div>
        </ThreeDCard>

        {/* Trophy Card */}
        <ThreeDCard
          title="Results"
          subtitle="See earnings"
          className="group relative bg-gradient-to-br from-yellow-500/20 via-yellow-400/10 to-yellow-300/5 col-span-1"
          size="md"
          ariaLabel="View tournaments"
        >
          <div className={cn(
            "absolute inset-0 transition-all duration-500",
            "icon-hover will-change-transform",
            "-right-14 -bottom-12"
          )}>
            <Image
              src="/3d Sports Icons/3d-trophy.svg"
              alt="Trophy Icon"
              fill
              className={cn(
                "object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]",
                "scale-[1.4]",
                "transform-gpu"
              )}
              priority
            />
          </div>
        </ThreeDCard>

        {/* AI Assistant Card */}
        <ThreeDCard
          title="Betsy"
          subtitle="AI Betting"
          className="group relative bg-gradient-to-br from-cyan-500/20 via-cyan-400/10 to-cyan-300/5 col-span-1"
          size="md"
          ariaLabel="View AI assistant"
        >
          <div className={cn(
            "absolute inset-0 transition-all duration-500",
            "icon-hover will-change-transform",
            "-right-14 -bottom-12"
          )}>
            <Image
              src="/3d Sports Icons/3d-chatbot.svg"
              alt="Chatbot Icon"
              fill
              className={cn(
                "object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]",
                "scale-[1.4]",
                "transform-gpu"
              )}
              priority
            />
          </div>
        </ThreeDCard>
      </div>
    </motion.div>
  )
}