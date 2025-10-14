import React from 'react';
import Menuitems from './MenuItems';
import { useLocation } from 'react-router';
import { Box, List } from '@mui/material';
import NavItem from './NavItem';
import NavGroup from './NavGroup/NavGroup';
import { hasPermission, getCurrentUser } from '../../../utils/rbac';

const SidebarItems = () => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const currentUser = getCurrentUser();

  // Permission mapping for menu items
  const getPermissionForMenuItem = (href) => {
    const permissionMap = {
      '/dashboard': 'dashboard',
      '/Material': 'materials',
      '/Products': 'products',
      '/Customers': 'customers',
      '/Orders': 'orders',
      '/Employees': 'employees',
      '/Projects': 'projects',
      '/Advertisement': 'advertisement',
      '/Timesheet': 'timesheets'
    };
    return permissionMap[href];
  };

  // Filter menu items based on user permissions
  const filterMenuItems = (items) => {
    if (!currentUser) return [];
    
    return items.filter(item => {
      // Always show subheaders/dividers
      if (item.subheader || item.navlabel) {
        return true;
      }
      
      // Check permission for regular menu items
      const requiredPermission = getPermissionForMenuItem(item.href);
      if (requiredPermission) {
        return hasPermission(requiredPermission);
      }
      
      // Show items that don't require specific permissions (like auth pages)
      return true;
    });
  };

  const filteredMenuItems = filterMenuItems(Menuitems);

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {filteredMenuItems.map((item) => {
          // {/********SubHeader**********/}
          if (item.subheader) {
            return <NavGroup item={item} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else {
            return (
              <NavItem item={item} key={item.id} pathDirect={pathDirect} />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
