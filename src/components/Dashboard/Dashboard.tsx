import React from 'react';
import { Header } from '../shared/Header';
import { motion } from 'framer-motion';

interface DashboardProps {
  onLogout: () => void;
  onNewTemplate: () => void;
  onNewPoster: () => void;
  onProducts: () => void;
  onPromotions: () => void;
  onBack: () => void;
  userEmail: string;
  userName: string;
  onSettings: () => void;
  userRole: 'admin' | 'limited';
  onAnalytics: () => void;
}

export default function Dashboard({ 
  onLogout, 
  onNewTemplate, 
  onNewPoster, 
  onProducts, 
  onPromotions, 
  onBack, 
  userEmail, 
  userName,
  onSettings,
  userRole,
  onAnalytics
}: DashboardProps) {
  
  React.useEffect(() => {
    console.log('Dashboard recibió props:', {
      userEmail,
      userName,
      hasEmail: Boolean(userEmail),
      hasName: Boolean(userName),
      emailType: typeof userEmail,
      nameType: typeof userName
    });
  }, [userEmail, userName]);

  const headerProps = {
    onBack,
    onLogout,
    userEmail: userEmail || '',
    userName: userName || ''
  };

  console.log('Dashboard pasando props al Header:', headerProps);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header {...headerProps} />
      
      {/* resto del contenido ... */}
    </div>
  );
} 