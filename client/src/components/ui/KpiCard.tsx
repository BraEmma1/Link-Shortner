import React from 'react';

interface KpiCardProps {
  /** Material Symbol icon name (e.g. 'link', 'ads_click') */
  icon: string;
  /** Card title label */
  title: string;
  /** Primary metric value (e.g. '2,405', '84.2K') */
  value: string;
  /** Badge text (e.g. '+12%', 'Stable') */
  badge?: string;
  /** Icon container background color class */
  iconBg?: string;
  /** Icon text color class */
  iconColor?: string;
  /** Badge style variant */
  badgeVariant?: 'success' | 'neutral' | 'warning';
}

const BADGE_STYLES: Record<string, string> = {
  success: 'bg-[#E6F6F0] text-success-green',
  neutral: 'bg-surface-variant text-secondary',
  warning: 'bg-[#FFF4E5] text-[#D97706]',
};

export default function KpiCard({
  icon,
  title,
  value,
  badge,
  iconBg = 'bg-surface-container',
  iconColor = 'text-tertiary',
  badgeVariant = 'success',
}: KpiCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-lg border border-border-light shadow-sm p-gutter flex flex-col hover:shadow-[0_4px_12px_rgba(39,58,100,0.05)] transition-shadow">
      {/* ── Header row: icon + badge ── */}
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}
        >
          <span className="material-symbols-outlined">{icon}</span>
        </div>

        {badge && (
          <span
            className={`font-label-sm text-label-sm flex items-center px-2 py-1 rounded-full gap-1 ${BADGE_STYLES[badgeVariant]}`}
          >
            {badgeVariant === 'success' && (
              <span className="material-symbols-outlined text-[14px]">
                trending_up
              </span>
            )}
            {badge}
          </span>
        )}
      </div>

      {/* ── Metric ── */}
      <p className="font-body-sm text-body-sm text-secondary mb-1">{title}</p>
      <h3 className="font-display-lg text-display-lg text-on-background">
        {value}
      </h3>
    </div>
  );
}
