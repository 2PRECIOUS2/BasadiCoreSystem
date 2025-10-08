import React from 'react';
import { hasPermission } from '../../utils/rbac';

/**
 * Component that conditionally renders children based on user permissions
 */
const PermissionGate = ({ 
  permission, 
  children, 
  fallback = null,
  requireAll = false,
  requireAny = false 
}) => {
  // Handle single permission
  if (permission && typeof permission === 'string') {
    if (hasPermission(permission)) {
      return children;
    }
    return fallback;
  }
  
  // Handle multiple permissions
  if (permission && Array.isArray(permission)) {
    if (requireAll) {
      // User must have ALL permissions
      const hasAllPermissions = permission.every(perm => hasPermission(perm));
      if (hasAllPermissions) {
        return children;
      }
    } else if (requireAny) {
      // User must have ANY of the permissions
      const hasAnyPermission = permission.some(perm => hasPermission(perm));
      if (hasAnyPermission) {
        return children;
      }
    }
    return fallback;
  }
  
  // No permission specified, don't render
  return fallback;
};

export default PermissionGate;