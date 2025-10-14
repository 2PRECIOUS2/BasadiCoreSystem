import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Lock as LockIcon, Home as HomeIcon } from '@mui/icons-material';
import { canAccessPage, getCurrentUser, getDefaultRoute } from '../../utils/rbac';

/**
 * Higher-order component for protecting routes based on user permissions
 */
const withRoleProtection = (WrappedComponent, requiredPermission) => {
  return function ProtectedComponent(props) {
    const user = getCurrentUser();
    
    // Check if user is authenticated
    if (!user) {
      return <Navigate to="/auth/login" replace />;
    }
    
    // Check if user has required permission
    if (!canAccessPage(requiredPermission)) {
      return (
        <Box sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4
        }}>
          <Paper sx={{
            p: 6,
            textAlign: 'center',
            maxWidth: 500,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <LockIcon sx={{ 
              fontSize: 80, 
              color: '#e53e3e', 
              mb: 3 
            }} />
            
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              color: '#2d3748',
              mb: 2 
            }}>
              Access Denied
            </Typography>
            
            <Typography variant="body1" sx={{ 
              color: '#64748b',
              mb: 2 
            }}>
              You don't have permission to access this page.
            </Typography>
            
            <Typography variant="body2" sx={{ 
              color: '#64748b',
              mb: 4 
            }}>
              Required permission: <strong>{requiredPermission}</strong><br />
              Your role: <strong>{user.role}</strong>
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => window.location.href = getDefaultRoute()}
              sx={{
                py: 1.5,
                px: 4,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8, #667eea)',
                }
              }}
            >
              Go to Accessible Page
            </Button>
          </Paper>
        </Box>
      );
    }
    
    // User has permission, render the component
    return <WrappedComponent {...props} />;
  };
};

export default withRoleProtection;