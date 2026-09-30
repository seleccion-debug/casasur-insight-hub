import { useState } from 'react';

interface LogoProps {
  variant?: 'circle' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Fixed locations. If these files are absent from public/, an elegant
// serif fallback is rendered instead.
const CIRCLE_LOGO_URL = '/logo-casasur-circular.png';
const HORIZONTAL_LOGO_URL = '/logo-casasur-horizontal.png';

const CIRCLE_SIZES: Record<string, string> = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-20 w-20',
};

const HORIZONTAL_SIZES: Record<string, string> = {
  sm: 'h-8 max-w-[180px]',
  md: 'h-10 max-w-[220px]',
  lg: 'h-12 max-w-[260px]',
};

function CircleFallback({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-lg';
  return (
    <div
      className={`${CIRCLE_SIZES[size]} flex items-center justify-center rounded-full border border-gold bg-white`}
      aria-label="CasaSur"
    >
      <span className={`font-serif ${textSize} tracking-wide text-charcoal-900`}>C/S</span>
    </div>
  );
}

function HorizontalFallback({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  return (
    <div className="flex flex-col items-center" aria-label="CASASUR Hotel Collection">
      <span className={`font-serif ${textSize} tracking-[0.3em] text-charcoal-900`}>CASASUR</span>
      <span className="font-serif text-[0.6rem] uppercase tracking-[0.35em] text-gold">
        Hotel Collection®
      </span>
    </div>
  );
}

export default function Logo({ variant = 'circle', size = 'md', className = '' }: LogoProps) {
  const [failed, setFailed] = useState(false);
  const isCircle = variant === 'circle';

  if (failed) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {isCircle ? <CircleFallback size={size} /> : <HorizontalFallback size={size} />}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={isCircle ? CIRCLE_LOGO_URL : HORIZONTAL_LOGO_URL}
        alt="CasaSur Hotel Collection"
        className={`${isCircle ? CIRCLE_SIZES[size] : HORIZONTAL_SIZES[size]} object-contain`}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
