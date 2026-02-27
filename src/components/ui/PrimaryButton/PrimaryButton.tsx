import React from 'react';
import clsx from 'clsx';

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  themeColor?: 'yellow' | 'blue' | 'stone';
};

export default function PrimaryButton({ children, onClick, disabled, className, themeColor = 'yellow' }: Props) {
  const theme = {
    yellow: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-400', shadow: 'shadow-yellow-900/10', text: 'text-black' },
    blue: { bg: 'bg-blue-700', hover: 'hover:bg-blue-600', shadow: 'shadow-blue-900/10', text: 'text-white' },
    stone: { bg: 'bg-stone-900', hover: 'hover:bg-stone-800', shadow: 'shadow-stone-900/10', text: 'text-white' },
  }[themeColor];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-md transition-all',
        disabled
          ? 'bg-stone-300 text-black cursor-not-allowed'
          : `${theme.bg} ${theme.text} ${theme.shadow} ${theme.hover} cursor-pointer`,
        className
      )}
    >
      {children}
    </button>
  );
}
