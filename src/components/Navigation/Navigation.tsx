export const Navigation: React.FC = () => {
  return (
    <nav className="flex space-x-4">
      <NavLink
        to="/products"
        className={({ isActive }) =>
          `px-4 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-rose-500 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`
        }
      >
        Productos
      </NavLink>
      <NavLink
        to="/promotions"
        className={({ isActive }) =>
          `px-4 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-rose-500 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`
        }
      >
        Promociones
      </NavLink>
      <NavLink
        to="/builder"
        className={({ isActive }) =>
          `px-4 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-rose-500 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`
        }
      >
        Builder
      </NavLink>
    </nav>
  );
}; 