
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getSecuritySettings, isTwoFactorVerified } from '@/lib/adminConfig';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser || currentUser.email !== 'falcondaniel37@gmail.com') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const security = getSecuritySettings();
  if (security.twoFactorEnabled && !isTwoFactorVerified()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
