import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <img
      src="/logo.svg"
      alt="Logo"
      className={className}
    />
  );
}; 