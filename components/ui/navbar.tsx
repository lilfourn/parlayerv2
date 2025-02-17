'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-6">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "mx-auto max-w-5xl rounded-2xl",
          className
        )}
      >
        <div className="relative px-6 py-4">
          <div className="relative flex items-center justify-between">
            {/* Logo */}
            <Link 
              href="/" 
              className="relative flex items-center space-x-3 text-xl font-bold"
            >
              <span className="relative">
                <span className="relative bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 text-transparent bg-clip-text bg-[size:200%] animate-gradient">
                  Parlayer
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 blur-[2px] opacity-50 bg-clip-text text-transparent bg-[size:200%] animate-gradient select-none">
                  Parlayer
                </span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              <div className="hidden sm:flex items-center space-x-6">
                <NavLink href="/pricing">Pricing</NavLink>
                <NavLink href="/contact">Contact</NavLink>
              </div>

              {/* Get Started Button */}
              <button className="px-5 py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/20">
                Get Started
              </button>
            </div>
          </div>

          {/* Frosted Glass Effect with Multiple Layers */}
          <div className="absolute inset-0 -z-10">
            {/* Main background with blur */}
            <div className="absolute inset-0 bg-emerald-950/30 backdrop-blur-md rounded-2xl" />
            
            {/* Subtle border gradient */}
            <div className="absolute inset-0 rounded-2xl border border-emerald-800/20" />
            
            {/* Inner shadow */}
            <div className="absolute inset-0 rounded-2xl shadow-inner shadow-emerald-900/10" />
            
            {/* Outer glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/5 to-green-500/5 blur-xl rounded-2xl" />
          </div>
        </div>
      </motion.nav>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="relative px-3 py-2 text-sm font-medium text-emerald-300 hover:text-emerald-200 transition-colors"
    >
      {children}
      <div className="absolute inset-0 -z-10 scale-75 opacity-0 hover:opacity-100 hover:scale-100 transition-all duration-200">
        <div className="absolute inset-0 bg-emerald-900/20 rounded-lg" />
      </div>
    </Link>
  );
}
