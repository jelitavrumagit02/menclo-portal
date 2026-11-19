import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  highlight?: boolean;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-red-50',
  highlight = false,
}: KpiCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-lg border p-5 shadow-sm hover:shadow-md transition-all duration-200',
      highlight ? 'border-primary/30 ring-1 ring-primary/10' : 'border-gray-200'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{title}</p>
          <p className={cn('text-2xl font-bold leading-none', highlight ? 'text-primary' : 'text-gray-900')}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>
          )}
          {trend && trendLabel && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
            )}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : trend === 'down' ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-lg flex-shrink-0', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>
    </div>
  );
}
