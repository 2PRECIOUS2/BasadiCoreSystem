import React from 'react';
import { 
  canCreateTimesheet, 
  canViewOwnTimesheets, 
  canViewAllTimesheets, 
  canApproveTimesheets, 
  canRejectTimesheets, 
  canEditAllTimesheets,
  canViewTimesheet,
  canEditTimesheet,
  getCurrentUser
} from '../../utils/rbac';

/**
 * Component that conditionally renders children based on timesheet permissions
 */
const TimesheetPermissionGate = ({ 
  permission, 
  timesheet = null,
  children, 
  fallback = null
}) => {
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;

  const checkPermission = () => {
    switch (permission) {
      case 'create':
        return canCreateTimesheet();
      
      case 'view_own':
        return canViewOwnTimesheets();
      
      case 'view_all':
        return canViewAllTimesheets();
      
      case 'approve':
        return canApproveTimesheets();
      
      case 'reject':
        return canRejectTimesheets();
      
      case 'edit_all':
        return canEditAllTimesheets();
      
      case 'view_timesheet':
        if (!timesheet) return false;
        return canViewTimesheet(timesheet, currentUserId);
      
      case 'edit_timesheet':
        if (!timesheet) return false;
        return canEditTimesheet(timesheet, currentUserId);
      
      default:
        return false;
    }
  };

  if (checkPermission()) {
    return children;
  }
  
  return fallback;
};

export default TimesheetPermissionGate;