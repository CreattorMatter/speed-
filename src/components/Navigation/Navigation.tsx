import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  isActive: boolean;
  children: React.ReactNode;
  to: string;
}

const NavLink: React.FC<NavLinkProps> = ({ isActive, children, to }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                 ${isActive 
                   ? 'bg-white/10 text-white' 
                   : 'text-white/60 hover:text-white hover:bg-white/5'}`}
    >
      {children}
    </Link>
  );
};

export const Navigation = () => {
  return (
    <nav>
      <NavLink to="/products" isActive={false}>
        Productos
      </NavLink>
      <NavLink to="/promotions" isActive={false}>
        Promociones
      </NavLink>
      <NavLink to="/builder" isActive={false}>
        Builder
      </NavLink>
    </nav>
  );
}; 