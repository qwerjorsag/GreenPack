import React from 'react';
import Button from '@mui/material/Button';
import clsx from 'clsx';

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export default function PrimaryButton({ children, onClick, disabled, className }: Props) {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-6 py-3 rounded-2xl bg-yellow-500 text-black font-bold uppercase tracking-widest text-sm shadow-md shadow-yellow-900/10 hover:bg-yellow-400 transition-all disabled:bg-stone-300 disabled:text-black disabled:cursor-not-allowed cursor-pointer',
        className
      )}
    >
      {children}
    </Button>
  );
}
