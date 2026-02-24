import { cn } from '@/lib/utils';

const BrandLogo = ({ className, compact = false, showDescriptor = false, tone = 'default' }) => {
  const isInverse = tone === 'inverse';
  const monogramClasses = isInverse
    ? 'bg-white text-[#0B1F3B]'
    : 'bg-[#0B1F3B] text-[#F8F9FA] dark:bg-white dark:text-[#0B1F3B]';
  const primaryTextClasses = isInverse ? 'text-white' : 'text-[#0B1F3B] dark:text-white';
  const secondaryTextClasses = isInverse ? 'text-white/80' : 'text-[#334155] dark:text-white/80';
  const descriptorClasses = isInverse ? 'text-[#7ed9bd]' : 'text-[#1E6F5C] dark:text-[#7ed9bd]';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('inline-flex h-9 w-9 items-center justify-center rounded-lg', monogramClasses)}>
        <span
          className="translate-y-[1px] font-bold tracking-[0.02em]"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: compact ? '1rem' : '1.08rem' }}
        >
          BC
        </span>
      </div>

      <div className="leading-none">
        {compact ? (
          <div className="flex flex-col">
            <span
              className={cn('text-[1.14rem] font-semibold leading-[1.03] tracking-[0.01em]', primaryTextClasses)}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Bienestar
            </span>
            <span
              className={cn('mt-0.5 text-[0.8rem] font-medium leading-none', secondaryTextClasses)}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              en Claro
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            <p
              className={cn('text-[1.9rem] font-semibold tracking-[0.01em]', primaryTextClasses)}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Bienestar <span className={cn('font-medium', secondaryTextClasses)}>en Claro</span>
            </p>
            {showDescriptor ? (
              <p
                className={cn('text-[0.74rem] uppercase tracking-[0.08em]', descriptorClasses)}
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Plataforma editorial en salud metabólica
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
