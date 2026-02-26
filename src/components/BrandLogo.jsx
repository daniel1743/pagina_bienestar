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
    <div className={cn('flex items-center gap-[18px] notranslate', className)} translate="no">
      <div
        className={cn('inline-flex h-11 w-11 items-center justify-center rounded-[8px] p-[10px] notranslate', monogramClasses)}
        translate="no"
      >
        <span
          className="translate-y-[1px] font-semibold notranslate"
          translate="no"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: compact ? '1rem' : '1.08rem',
            letterSpacing: '-0.5px',
          }}
        >
          BC
        </span>
      </div>

      <div className="leading-none">
        {compact ? (
          <div className="flex flex-col">
            <span
              className={cn('text-[1.14rem] font-semibold leading-[1.03]', primaryTextClasses)}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '-0.3px' }}
            >
              Bienestar
            </span>
            <span
              className={cn('mt-0.5 font-normal leading-none', secondaryTextClasses)}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '0.9em', letterSpacing: '0px' }}
            >
              en Claro
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            <p
              className={cn('text-[1.9rem] font-semibold', primaryTextClasses)}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '-0.3px' }}
            >
              Bienestar{' '}
              <span
                className={cn('font-normal', secondaryTextClasses)}
                style={{ fontSize: '0.9em', letterSpacing: '0px' }}
              >
                en Claro
              </span>
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
