'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryCta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

/**
 * Reusable Empty State component with icon, title, description, and CTA.
 * Used when a list/table has no data yet (portfolio, orders, history, etc.)
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  secondaryCta,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-label={title}
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      {/* Decorative icon ring */}
      <div
        className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mb-4 shadow-inner"
        aria-hidden="true"
      >
        <Icon className="w-7 h-7 text-zinc-500" />
      </div>

      <h3 className="text-sm font-bold text-zinc-300 mb-1.5">{title}</h3>
      <p className="text-xs text-zinc-500 max-w-xs leading-relaxed mb-5">{description}</p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        {cta && (
          <>
            {cta.href ? (
              <Link
                href={cta.href}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                  cta.variant === 'secondary'
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-sm'
                }`}
              >
                {cta.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={cta.onClick}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                  cta.variant === 'secondary'
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-sm'
                }`}
              >
                {cta.label}
              </button>
            )}
          </>
        )}

        {secondaryCta && (
          <>
            {secondaryCta.href ? (
              <Link
                href={secondaryCta.href}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
              >
                {secondaryCta.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryCta.onClick}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
              >
                {secondaryCta.label}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
