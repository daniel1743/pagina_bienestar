import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const BrandLogo = ({ className, compact = false }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {!imageError ? (
        <img
          src="/images/logo.png"
          alt="Logo Bienestar en Claro"
          className={cn(
            'rounded-lg object-contain',
            compact ? 'h-8 w-8' : 'h-10 w-10',
          )}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="relative h-9 w-9 rounded-lg border border-emerald-500/30 bg-gradient-to-b from-emerald-500/15 to-emerald-500/5 shadow-sm shadow-emerald-500/10">
          <span className="absolute left-[7px] top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-600">
            {'<'}
          </span>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[48%] text-[10px] font-semibold text-slate-500">
            /
          </span>
          <span className="absolute right-[7px] top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-600">
            {'>'}
          </span>
        </div>
      )}

      <div className="leading-none">
        <p className={cn('font-semibold tracking-tight text-foreground text-[1.9rem]', compact && 'text-[1.1rem]')}>
          <span className="text-primary">Bienestar</span>{' '}
          <span className="font-medium text-foreground/85">en Claro</span>
        </p>
      </div>
    </div>
  );
};

export default BrandLogo;
