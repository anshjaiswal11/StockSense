import React from 'react';

interface StockSenseLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
}

export const StockSenseLogo: React.FC<StockSenseLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  theme = 'light',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
      {/* Brand Icon SVG */}
      <div className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 ring-1 ring-emerald-500/30 transition-transform hover:scale-105 duration-200`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5 drop-shadow-xs"
        >
          {/* Isometric Inventory 3D Cube / Stock Matrix */}
          <path
            d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="opacity-70"
          />
          <path
            d="M20 4V20M20 20L34 12M20 20L6 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            className="opacity-60"
          />
          {/* Sense Pulse / Wave */}
          <path
            d="M12 21L17 26L23 15L28 20"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="20" r="2.5" fill="#34d399" />
        </svg>

        {/* Pulsing indicator dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse" />
      </div>

      {/* Brand Typography */}
      <div>
        <div className="flex items-center space-x-1.5">
          <span
            className={`font-black tracking-tight ${titleSizes[size]} ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            Stock<span className="text-emerald-600">Sense</span>
          </span>
          <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
            IMS 2.0
          </span>
        </div>
        {showSubtitle && (
          <p
            className={`text-[10px] font-medium tracking-tight ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Intelligent Inventory & Logistics
          </p>
        )}
      </div>
    </div>
  );
};

export const VerixLogo = StockSenseLogo;
