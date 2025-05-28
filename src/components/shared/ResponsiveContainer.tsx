import React from 'react';
import { cn } from '../../utils/cn';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  center?: boolean;
}

export function ResponsiveContainer({ 
  children, 
  className, 
  size = 'lg',
  padding = 'md',
  center = true
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: 'max-w-sm xs:max-w-md sm:max-w-lg',
    md: 'max-w-md xs:max-w-lg sm:max-w-xl lg:max-w-2xl',
    lg: 'max-w-lg xs:max-w-xl sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl',
    xl: 'max-w-xl xs:max-w-2xl sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 xs:px-3 sm:px-4',
    md: 'px-3 xs:px-4 sm:px-6 lg:px-8',
    lg: 'px-4 xs:px-6 sm:px-8 lg:px-12'
  };

  return (
    <div className={cn(
      'w-full',
      sizeClasses[size],
      paddingClasses[padding],
      center && 'mx-auto',
      className
    )}>
      {children}
    </div>
  );
} 