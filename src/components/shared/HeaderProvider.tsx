import React, { createContext, useContext } from 'react';

interface HeaderContextType {
  userEmail: string;
  userName: string;
}

const HeaderContext = createContext<HeaderContextType | null>(null);

export function HeaderProvider({ 
  children, 
  userEmail, 
  userName 
}: HeaderContextType & { children: React.ReactNode }) {
  return (
    <HeaderContext.Provider value={{ userEmail, userName }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
} 