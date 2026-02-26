import React from 'react';
import Button from '@mui/material/Button';
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
    yellow: { bg: '#facc15', hover: '#fbbf24', shadow: 'rgba(113, 63, 18, 0.1)', text: '#000000' },
    blue: { bg: '#2563eb', hover: '#3b82f6', shadow: 'rgba(30, 58, 138, 0.2)', text: '#ffffff' },
    stone: { bg: '#1c1917', hover: '#292524', shadow: 'rgba(28, 25, 23, 0.2)', text: '#ffffff' },
  }[themeColor];

  return (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={disabled}
      sx={{
        backgroundColor: theme.bg,
        color: theme.text,
        boxShadow: `0 10px 20px -10px ${theme.shadow}`,
        transition: 'transform 0.35s ease, background-color 0.35s ease, box-shadow 0.35s ease',
        '&:hover': { backgroundColor: theme.hover, transform: 'scale(1.05)' },
        '&.Mui-disabled': { backgroundColor: '#d6d3d1', color: '#000000' },
      }}
      className={clsx(
        'px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all disabled:cursor-not-allowed cursor-pointer',
        className
      )}
    >
      {children}
    </Button>
  );
}
