// middlewares/checkPermissions.js
export const checkPermissions = (requiredPermission) => {
    return (req, res, next) => {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = req.session.user;
        
        // Super admin has access to everything
        if (user.loginType === 'super_admin') {
            return next(); // Super admin access granted
        }

        // Check employee permissions
        if (!user.accessRights || !user.accessRights[requiredPermission]) {
            return res.status(403).json({ 
                message: `Access denied. Required permission: ${requiredPermission}`,
                userRole: user.role,
                userPermissions: user.accessRights
            });
        }

        next(); // Permission granted
    };
};