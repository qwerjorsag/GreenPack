import React from 'react';
import Paper from '@mui/material/Paper';
import clsx from 'clsx';

type Props = React.PropsWithChildren<{
  className?: string;
}>;

export default function SectionCard({ children, className }: Props) {
  return (
    <Paper
      elevation={0}
      className={clsx(
        'bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-stone-200',
        className
      )}
    >
      {children}
    </Paper>
  );
}
