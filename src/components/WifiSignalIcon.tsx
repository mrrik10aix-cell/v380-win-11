import React from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';

export interface WifiSignalIconProps {
  signalStrength: number; // 0-100
  pingMs?: number; // Latency in ms (e.g., 18ms)
  status?: 'online' | 'offline' | 'connecting';
  showLatency?: boolean;
  showPercentage?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'bars' | 'wifi' | 'badge' | 'full';
}

export const WifiSignalIcon: React.FC<WifiSignalIconProps> = ({
  signalStrength,
  pingMs,
  status = 'online',
  showLatency = true,
  showPercentage = false,
  showLabel = false,
  size = 'md',
  className = '',
  variant = 'badge',
}) => {
  const isOffline = status === 'offline';
  const isConnecting = status === 'connecting';

  // Compute latency if not explicitly provided
  const latency = isOffline
    ? 0
    : pingMs ?? Math.max(12, Math.round(220 - signalStrength * 1.9));

  // Determine signal tier based on strength and latency
  let tier: 'excellent' | 'good' | 'fair' | 'poor' | 'offline' = 'offline';
  if (isOffline) {
    tier = 'offline';
  } else if (signalStrength >= 80 && latency <= 45) {
    tier = 'excellent';
  } else if (signalStrength >= 60 && latency <= 90) {
    tier = 'good';
  } else if (signalStrength >= 35 && latency <= 180) {
    tier = 'fair';
  } else {
    tier = 'poor';
  }

  // Active signal bar count (0 to 4)
  const activeBars = isOffline
    ? 0
    : tier === 'excellent'
    ? 4
    : tier === 'good'
    ? 3
    : tier === 'fair'
    ? 2
    : 1;

  // Ensure safe size key
  const safeSize = (size && ['sm', 'md', 'lg'].includes(size) ? size : 'md') as 'sm' | 'md' | 'lg';

  // Style mappings according to connection tier
  const tierConfig = {
    excellent: {
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      barColor: 'bg-emerald-400',
      label: 'Excellent',
      dbm: '-48 dBm',
    },
    good: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      barColor: 'bg-blue-400',
      label: 'Good',
      dbm: '-62 dBm',
    },
    fair: {
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      barColor: 'bg-amber-400',
      label: 'Fair',
      dbm: '-75 dBm',
    },
    poor: {
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      barColor: 'bg-rose-400',
      label: 'Poor',
      dbm: '-88 dBm',
    },
    offline: {
      color: 'text-zinc-500',
      bgColor: 'bg-zinc-800/50',
      borderColor: 'border-zinc-800',
      barColor: 'bg-zinc-600',
      label: 'Offline',
      dbm: 'N/A',
    },
  }[tier] || {
    color: 'text-zinc-500',
    bgColor: 'bg-zinc-800/50',
    borderColor: 'border-zinc-800',
    barColor: 'bg-zinc-600',
    label: 'Offline',
    dbm: 'N/A',
  };

  // Size dimensions
  const iconSizesMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  const iconSizes = iconSizesMap[safeSize] || iconSizesMap.md;

  const barHeightsMap = {
    sm: ['h-1.5', 'h-2.5', 'h-3.5', 'h-4'],
    md: ['h-2', 'h-3', 'h-4', 'h-5'],
    lg: ['h-2.5', 'h-4', 'h-5', 'h-6'],
  };
  const barHeights = barHeightsMap[safeSize] || barHeightsMap.md;

  const textSizeMap = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };
  const textSize = textSizeMap[safeSize] || textSizeMap.md;

  // Render 4-Bar Signal Indicator SVG/HTML
  const renderBars = () => (
    <div
      className="flex items-end gap-[2px] h-4 px-0.5 justify-center shrink-0"
      title={`Signal Strength: ${isOffline ? '0%' : `${signalStrength}%`} (${tierConfig.label}) | Latency: ${
        isOffline ? 'Offline' : `${latency}ms`
      }`}
    >
      {[1, 2, 3, 4].map((barIndex) => {
        const isActive = barIndex <= activeBars;
        const heightClass = barHeights?.[barIndex - 1] || 'h-3';
        return (
          <span
            key={barIndex}
            className={`w-[3px] rounded-xs transition-all duration-300 ${heightClass} ${
              isActive ? tierConfig.barColor : 'bg-zinc-800'
            }`}
          />
        );
      })}
    </div>
  );

  if (isConnecting) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 ${textSize} ${className}`}
      >
        <Wifi className={`${iconSizes} animate-pulse`} />
        <span className="font-mono">Connecting...</span>
      </div>
    );
  }

  if (variant === 'wifi') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 ${tierConfig.color} ${className}`}
        title={`Signal: ${signalStrength}% | Latency: ${latency}ms`}
      >
        {isOffline ? (
          <WifiOff className={iconSizes} />
        ) : (
          <Wifi className={iconSizes} />
        )}
        {showPercentage && (
          <span className={`${textSize} font-mono font-semibold`}>
            {signalStrength}%
          </span>
        )}
        {showLatency && !isOffline && (
          <span className={`${textSize} font-mono opacity-80`}>
            {latency}ms
          </span>
        )}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 ${className}`}
        title={`Wi-Fi: ${signalStrength}% (${tierConfig.label}) | Latency: ${latency}ms`}
      >
        {renderBars()}
        {showPercentage && (
          <span className={`${textSize} font-mono font-semibold ${tierConfig.color}`}>
            {signalStrength}%
          </span>
        )}
        {showLatency && !isOffline && (
          <span className={`${textSize} font-mono text-zinc-400`}>
            {latency}ms
          </span>
        )}
      </div>
    );
  }

  // Default 'badge' or 'full' variant: a clean, responsive status pill
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all ${
        tierConfig.bgColor
      } ${tierConfig.borderColor} ${className}`}
      title={`V380 Network Latency: ${isOffline ? 'Offline' : `${latency}ms`} | Wi-Fi Signal: ${
        isOffline ? 'Disconnected' : `${signalStrength}% (${tierConfig.dbm})`
      }`}
    >
      {isOffline ? (
        <WifiOff className={`${iconSizes} text-zinc-500`} />
      ) : (
        renderBars()
      )}

      {showLabel && (
        <span className={`${textSize} font-bold ${tierConfig.color}`}>
          {tierConfig.label}
        </span>
      )}

      {showPercentage && !isOffline && (
        <span className={`${textSize} font-mono font-semibold ${tierConfig.color}`}>
          {signalStrength}%
        </span>
      )}

      {showLatency && !isOffline && (
        <span className={`${textSize} font-mono font-medium text-zinc-300 flex items-center gap-0.5`}>
          <Activity className="w-2.5 h-2.5 text-zinc-400" />
          {latency}ms
        </span>
      )}

      {isOffline && (
        <span className={`${textSize} font-mono font-semibold text-zinc-500`}>
          Offline
        </span>
      )}
    </div>
  );
};
