import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState } from "react"
import { ReactNode } from "react"

interface ThreeDCardProps {
  className?: string
  children?: React.ReactNode
  onClick?: () => void
  title: ReactNode
  subtitle?: string
  size?: 'sm' | 'md' | 'lg'
  ariaLabel?: string
}

export function ThreeDCard({ 
  className, 
  children, 
  onClick, 
  title,
  subtitle,
  size = 'md',
  ariaLabel
}: ThreeDCardProps) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    const rotateXValue = (mouseY / (rect.height / 2)) * -8
    const rotateYValue = (mouseX / (rect.width / 2)) * 8

    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || (typeof title === 'string' ? title : undefined)}
      className={cn(
        "relative h-full w-full cursor-pointer",
        "rounded-[24px]",
        "transform-gpu transition-all duration-150 ease-out",
        "hover:shadow-xl hover:shadow-black/20",
        "overflow-hidden",
        "focus:outline-none focus:ring-2 focus:ring-white/20",
        className
      )}
      style={{
        perspective: "1500px",
        transformStyle: "preserve-3d",
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Card Content Container */}
      <div className="relative h-full w-full p-6">
        {/* Title Section */}
        <div className="relative z-30">
          <div className={cn(
            "font-bold tracking-wide",
            size === 'lg' ? "text-2xl" : "text-xl",
            "text-white/90"
          )}>
            {title}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-white/60 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Image Container */}
        <div className={cn(
          "absolute transition-all duration-500",
          "icon-hover will-change-transform",
          size === 'lg' 
            ? "right-[-27%] bottom-[-25%] w-[140%] h-[140%]" 
            : "right-[-30%] bottom-[-25%] w-[130%] h-[120%]"
        )}>
          {children}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-transparent" />
      </div>
    </motion.div>
  )
}