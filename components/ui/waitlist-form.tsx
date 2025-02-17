'use client';

import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

interface FormData {
  email: string;
}

export function WaitlistForm() {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.code === 'P2002') {
          setError('email', {
            type: 'manual',
            message: 'This email is already on the waitlist',
          });
          return;
        }
        throw new Error('Failed to join waitlist');
      }

      setShowSuccess(true);
    } catch (error) {
      setError('email', {
        type: 'manual',
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-full max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex-1 relative">
        <input
          type="email"
          placeholder="Enter your email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50"
          disabled={isSubmitting || showSuccess}
        />
        {errors.email && (
          <span className="absolute -bottom-6 left-0 text-xs text-red-500">
            {errors.email.message}
          </span>
        )}
      </div>
      
      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isSubmitting ? (
              'Joining...'
            ) : (
              <>
                Join Waitlist
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        ) : (
          <motion.div
            className="px-6 py-3 rounded-lg bg-brand-600 text-white flex items-center justify-center min-w-[140px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5"
              stroke="currentColor"
              strokeWidth={3}
            >
              <motion.path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ 
                  duration: 0.4,
                  ease: "easeOut"
                }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
