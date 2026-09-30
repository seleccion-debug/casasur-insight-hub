interface LogoProps {
  variant?: 'circle' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CIRCLE_LOGO_URL = '/assets/images/logo_CS_negro_sobre_blanco_(1).png';
const HORIZONTAL_LOGO_URL = '/assets/images/Casa_Sur_PNG_-_letras_negras_(1).png';

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

function LogoFallback({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${compact ? '' : 'flex-col'}`}>
      <span className={`${compact ? 'text-xl' : 'text-2xl'} font-serif tracking-wider text-charcoal-900`}>
        CASASUR
      </span>
      <span className={`${compact ? 'ml-2' : 'mt-1'} font-serif text-xs tracking-[0.25em] text-gold uppercase`}>
        Hotel Collection®
      </span>
    </div>
  );
}

export default function Logo({ variant = 'circle', size = 'md', className = '' }: LogoProps) {
  if (variant === 'circle') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <img
          src={CIRCLE_LOGO_URL}
          alt="CasaSur Hotel Collection"
          className={`${CIRCLE_SIZES[size]} object-contain`}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
            event.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden">
          <LogoFallback />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={HORIZONTAL_LOGO_URL}
        alt="CasaSur Hotel Collection"
        className={`${HORIZONTAL_SIZES[size]} object-contain`}
        onError={(event) => {
          event.currentTarget.style.display = 'none';
          event.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className="hidden">
        <LogoFallback compact />
      </div>
    </div>
  );
}
