"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home,
  Settings,
  Star,
  Trophy,
  Crown,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";

const menuItems = [
  { id: 1, icon: Home, label: 'Dashboard', href: '/dashboard', notification: 2 },
  { id: 2, icon: Star, label: 'Projections', href: '/dashboard/projections', notification: 5 },
  { id: 3, icon: Trophy, label: 'Analyze', href: '/dashboard/analyze' },
  { id: 4, icon: Crown, label: 'My Picks', href: '/dashboard/picks', notification: 3 },
  { id: 5, icon: Settings, label: 'Settings', href: '/dashboard/settings' }
];

const transitionConfig = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1],
};

const contentTransition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1],
};

const COLLAPSE_DELAY = 500; // 2 seconds in milliseconds
const EXPAND_DELAY = 150;

const Sidebar = () => {
  const { isExpanded, setIsExpanded, setWidth } = useSidebarStore();
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const expandTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!sidebarRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(sidebarRef.current);
    return () => resizeObserver.disconnect();
  }, [setWidth]);

  const handleMouseEnter = useCallback(() => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
    }
    expandTimer.current = setTimeout(() => {
      setIsExpanded(true);
    }, EXPAND_DELAY);
  }, [setIsExpanded]);

  const handleMouseLeave = useCallback(() => {
    if (expandTimer.current) {
      clearTimeout(expandTimer.current);
    }
    collapseTimer.current = setTimeout(() => {
      setIsExpanded(false);
    }, COLLAPSE_DELAY);
  }, [setIsExpanded]);

  return (
    <motion.div
      ref={sidebarRef}
      className="fixed left-0 top-0 h-screen bg-gray-900 text-white rounded-r-xl shadow-xl z-50 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={false}
      animate={{
        width: isExpanded ? '240px' : '72px',
      }}
      transition={transitionConfig}
    >
      <motion.div 
        className="p-4"
        animate={{ x: 0 }}
        transition={contentTransition}
      >
        <div className="flex items-center justify-center mb-8">
          <motion.div
            className={cn(
              "flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-800 transition-colors",
              isExpanded ? "w-full" : "w-fit"
            )}
            onClick={() => router.push('/dashboard')}
          >
            <Avatar className="h-10 w-10 border-2 border-purple-500 shrink-0">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>LF</AvatarFallback>
            </Avatar>
            <AnimatePresence mode="popLayout">
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ 
                    opacity: 1, 
                    width: "auto",
                  }}
                  exit={{ 
                    opacity: 0, 
                    width: 0,
                  }}
                  transition={contentTransition}
                  className="flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <span className="text-sm font-semibold">Luke Fournier</span>
                  <span className="text-xs text-gray-400">@lilfourn</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={cn(
                  "w-full flex items-center p-2 rounded-lg hover:bg-gray-800 group relative",
                  isActive ? "bg-gray-800 text-purple-400" : ""
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={cn(
                  "flex items-center justify-center shrink-0",
                  isExpanded ? "min-w-[48px]" : "w-full"
                )}>
                  <item.icon className={cn(
                    "w-6 h-6",
                    isActive ? "text-purple-400" : "text-gray-300 group-hover:text-purple-400"
                  )} />
                </div>
                
                <AnimatePresence mode="popLayout">
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ 
                        opacity: 1, 
                        width: "auto",
                      }}
                      exit={{ 
                        opacity: 0, 
                        width: 0,
                      }}
                      transition={contentTransition}
                      className={cn(
                        "ml-3 text-sm font-medium whitespace-nowrap overflow-hidden",
                        isActive ? "text-purple-400" : ""
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {item.notification && (
                  <AnimatePresence mode="popLayout">
                    {isExpanded ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={contentTransition}
                        className="ml-auto bg-purple-500 rounded-full px-2 py-0.5 text-xs font-semibold shrink-0"
                      >
                        {item.notification}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -right-1 top-0 w-2 h-2 bg-purple-500 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                )}
              </motion.button>
            );
          })}
        </nav>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;