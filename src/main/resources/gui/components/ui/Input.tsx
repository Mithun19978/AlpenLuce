import { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm text-white/60 mb-1.5">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">{icon}</span>
        )}
        <input
          className={clsx(
            'w-full bg-black border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-white/20',
            error ? 'border-red-500/50 focus:border-red-500' : 'border-white/20 focus:border-gold',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
