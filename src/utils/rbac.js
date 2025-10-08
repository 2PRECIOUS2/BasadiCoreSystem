// Role-Based Access Control (RBAC) Utility

// Define role permissions mapping
export const ROLE_PERMISSIONS = {
  super_admin: {
    dashboard: true,
    timesheets: true,
    projects: true,
    customers: true,
    orders: true,
    products: true,
    materials: true,
    employees: true,
    approval: true,
    reports: true,
    everything: true
  },
  
  administrator: {
    dashboard: true,
    timesheets: true,
    projects: true,
    customers: true,
    orders: true,
    products: true,
    materials: true,
    employees: false, // Admins cannot manage employees
    approval: false,  // Admins cannot approve/reject
    reports: true,
    everything: false
  },
  
  admin: {
    dashboard: true,
    timesheets: true,
    projects: true,
    customers: true,
    orders: true,
    products: true,
    materials: true,
    employees: false,
    approval: false,
    reports: true,
    everything: false
  },
  
  accountant: {
    dashboard: true,
    timesheets: true,
    projects: false,
    customers: true,  // Need customer access for billing
    orders: true,     // Need order access for financials
    products: false,
    materials: false,
    employees: false,
    approval: false,
    reports: true,
    everything: false
  },
  
  trainer: {
    dashboard: false,
    timesheets: true,
    projects: true,
    customers: false,
    orders: false,
    products: false,
    materials: false,
    employees: false,
    approval: false,
    reports: false,
    everything: false
  },
  
  support: {
    dashboard: false,
    timesheets: true,
    projects: true,
    customers: false,
    orders: false,
    products: false,
    materials: false,
    employees: false,
    approval: false,
    reports: false,
    everything: false
  }
};

/**
 * Get user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Get user role in normalized format
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  if (!user || !user.role) return null;
  
  // Normalize role to lowercase and handle variations
  const role = user.role.toLowerCase();
  
  // Handle role variations
  if (role === 'administrator') return 'administrator';
  if (role === 'admin') return 'admin';
  if (role === 'accountant') return 'accountant';
  if (role === 'trainer') return 'trainer';
  if (role === 'support') return 'support';
  if (user.loginType === 'super_admin') return 'super_admin';
  
  return role;
};

/**
 * Check if user has permission for a specific feature
 */
export const hasPermission = (permission) => {
  const role = getUserRole();
  if (!role) return false;
  
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  
  return permissions[permission] === true;
};

/**
 * Check if user can access a specific page/route
 */
export const canAccessPage = (page) => {
  return hasPermission(page);
};

/**
 * Get all permissions for current user
 */
export const getUserPermissions = () => {
  const role = getUserRole();
  if (!role) return {};
  
  return ROLE_PERMISSIONS[role] || {};
};

/**
 * Check if user is admin level (admin or super_admin)
 */
export const isAdminLevel = () => {
  const role = getUserRole();
  return role === 'super_admin' || role === 'administrator' || role === 'admin';
};

/**
 * Check if user is super admin
 */
export const isSuperAdmin = () => {
  const role = getUserRole();
  return role === 'super_admin';
};

/**
 * Get user display info
 */
export const getUserDisplayInfo = () => {
  const user = getCurrentUser();
  if (!user) return null;
  
  return {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.role,
    permissions: getUserPermissions()
  };
};

/**
 * Role-based redirect after login
 */
export const getDefaultRoute = () => {
  const role = getUserRole();
  
  switch (role) {
    case 'super_admin':
    case 'administrator':
    case 'admin':
    case 'accountant':
      return '/dashboard';
    case 'trainer':
    case 'support':
      return '/timesheet';
    default:
      return '/timesheet';
  }
};

/**
 * Get navigation items based on user role
 */
export const getNavigationItems = () => {
  const permissions = getUserPermissions();
  const navigationItems = [];
  
  // Dashboard
  if (permissions.dashboard) {
    navigationItems.push({
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'dashboard'
    });
  }
  
  // Timesheets (most roles have this)
  if (permissions.timesheets) {
    navigationItems.push({
      title: 'Timesheet',
      href: '/timesheet',
      icon: 'timesheet'
    });
  }
  
  // Projects
  if (permissions.projects) {
    navigationItems.push({
      title: 'Projects',
      href: '/projects',
      icon: 'projects'
    });
  }
  
  // Materials
  if (permissions.materials) {
    navigationItems.push({
      title: 'Material',
      href: '/material',
      icon: 'material'
    });
  }
  
  // Products
  if (permissions.products) {
    navigationItems.push({
      title: 'Products',
      href: '/products',
      icon: 'products'
    });
  }
  
  // Customers
  if (permissions.customers) {
    navigationItems.push({
      title: 'Customers',
      href: '/customers',
      icon: 'customers'
    });
  }
  
  // Orders
  if (permissions.orders) {
    navigationItems.push({
      title: 'Orders',
      href: '/orders',
      icon: 'orders'
    });
  }
  
  // Employees (only admin level)
  if (permissions.employees) {
    navigationItems.push({
      title: 'Employees',
      href: '/employees',
      icon: 'employees'
    });
  }
  
  return navigationItems;
};

export default {
  ROLE_PERMISSIONS,
  getCurrentUser,
  getUserRole,
  hasPermission,
  canAccessPage,
  getUserPermissions,
  isAdminLevel,
  isSuperAdmin,
  getUserDisplayInfo,
  getDefaultRoute,
  getNavigationItems
};