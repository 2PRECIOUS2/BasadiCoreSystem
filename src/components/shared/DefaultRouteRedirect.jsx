import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getDefaultRoute } from '../../utils/rbac';

const DefaultRouteRedirect = () => {
  const defaultRoute = getDefaultRoute();

  useEffect(() => {
    console.log('🔄 Redirecting user to default route:', defaultRoute);
  }, [defaultRoute]);

  return <Navigate to={defaultRoute} replace />;
};

export default DefaultRouteRedirect;