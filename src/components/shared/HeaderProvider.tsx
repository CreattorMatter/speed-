import React, { createContext, useContext } from 'react';

interface HeaderContextType {
  userEmail: string;
  userName: string;
  userRole?: 'admin' | 'limited' | 'sucursal' | 'viewer';
}

const HeaderContext = createContext<HeaderContextType>({
  userEmail: '',
  userName: '',
  userRole: 'limited'
});

export const useHeader = () => useContext(HeaderContext);

interface HeaderProviderProps {
  children: React.ReactNode;
  userEmail: string;
  userName: string;
  userRole?: 'admin' | 'limited' | 'sucursal' | 'viewer';
}

export function HeaderProvider({ children, userEmail, userName, userRole = 'admin' }: HeaderProviderProps) {
  return (
    <HeaderContext.Provider value={{ userEmail, userName, userRole }}>
      {children}
    </HeaderContext.Provider>
  );
} 