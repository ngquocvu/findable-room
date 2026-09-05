import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon-only';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

const sizeMap = {
  xs: { icon: 20, text: 'text-sm', badge: 'text-[9px]' },
  sm: { icon: 26, text: 'text-base', badge: 'text-[10px]' },
  md: { icon: 34, text: 'text-lg', badge: 'text-[11px]' },
  lg: { icon: 42, text: 'text-xl', badge: 'text-xs' },
  xl: { icon: 54, text: 'text-2xl', badge: 'text-xs' },
};

export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
      aria-label="RoomFindable 3D Logo"
      role="img"
    >
      <defs>
        {/* Soft shadow */}
        <filter id="logo-drop-shadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2a301a" floodOpacity="0.16" />
        </filter>

        {/* Ambient Gradients */}
        <linearGradient id="wall-left-grad" x1="6" y1="12" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#72834b" />
          <stop offset="100%" stopColor="#556434" />
        </linearGradient>

        <linearGradient id="wall-right-grad" x1="24" y1="12" x2="42" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9fb074" />
          <stop offset="100%" stopColor="#7a8d51" />
        </linearGradient>

        <linearGradient id="floor-grad" x1="24" y1="20" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ede7dc" />
          <stop offset="100%" stopColor="#dcd4c5" />
        </linearGradient>

        <linearGradient id="pin-grad" x1="24" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Base Isometric Room Box */}
      <g filter="url(#logo-drop-shadow)">
        {/* Isometric Floor Plane */}
        <path
          d="M24 24L40 33L24 42L8 33L24 24Z"
          fill="url(#floor-grad)"
          stroke="#c8bfb0"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Floor Grid Accents (Representing 3D room floor tiles) */}
        <path
          d="M16 28.5L32 37.5M32 28.5L16 37.5"
          stroke="#b8ad9c"
          strokeWidth="0.8"
          strokeDasharray="2 2"
          opacity="0.6"
        />

        {/* Left Room Wall */}
        <path
          d="M8 15L24 24V42L8 33V15Z"
          fill="url(#wall-left-grad)"
          stroke="#475429"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Left Wall Storage Shelf / Drawer */}
        <path
          d="M11 20L19 24.5V28.5L11 24V20Z"
          fill="#445226"
          opacity="0.75"
        />
        <line x1="11" y1="22" x2="19" y2="26.5" stroke="#a4b57e" strokeWidth="0.8" opacity="0.6" />

        {/* Right Room Wall */}
        <path
          d="M40 15L24 24V42L40 33V15Z"
          fill="url(#wall-right-grad)"
          stroke="#5d6c38"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Right Wall Shelf / Storage Slot */}
        <path
          d="M37 20L29 24.5V28.5L37 24V20Z"
          fill="#6b7c44"
          opacity="0.75"
        />
        <line x1="37" y1="22" x2="29" y2="26.5" stroke="#c2d19f" strokeWidth="0.8" opacity="0.6" />
      </g>

      {/* Floating Smart Beacon / Item Finder Pin */}
      <g className="animate-pulse">
        {/* Radar Ring 1 */}
        <ellipse cx="24" cy="27" rx="6" ry="3" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.4" />
        <ellipse cx="24" cy="27" rx="3.5" ry="1.8" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.7" />

        {/* Pin Body */}
        <path
          d="M24 10C21.79 10 20 11.79 20 14C20 16.8 24 21.5 24 21.5C24 21.5 28 16.8 28 14C28 11.79 26.21 10 24 10Z"
          fill="url(#pin-grad)"
          stroke="#b45309"
          strokeWidth="0.8"
        />
        {/* Pin Center Sparkle Core */}
        <circle cx="24" cy="14" r="1.8" fill="#fffdfa" />
      </g>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showTagline = true,
}) => {
  const currentSize = sizeMap[size];

  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <LogoIcon size={currentSize.icon} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      <div className="relative p-1 bg-gradient-to-br from-[#fbf9f4] to-[#ede8df] rounded-xl border border-[#e2ddd0] shadow-xs flex items-center justify-center shrink-0">
        <LogoIcon size={currentSize.icon} />
      </div>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-bold tracking-tight text-[#383829] ${currentSize.text}`}
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Room<span className="text-[#6f7e45]">Findable</span>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#8a9a5b]/15 text-[#5e6c38] font-bold text-[9px] tracking-wider uppercase">
            3D
          </span>
        </div>
        {showTagline && (
          <span className={`text-[#878374] font-medium tracking-tight truncate mt-0.5 ${currentSize.badge}`}>
            3D Room Storage & Inventory
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
