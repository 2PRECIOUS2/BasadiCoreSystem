// middlewares/checkPermissions.js
export const checkPermissions = (requiredPermission) => {
    return (req, res, next) => {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = req.session.user;
        
        // Super admin has access to everything except timesheet creation
        if (user.loginType === 'super_admin') {
            // Block super admin from creating timesheets
            if (requiredPermission === 'timesheets_create') {
                return res.status(403).json({ 
                    message: 'Super admin cannot create timesheets',
                    userRole: user.role
                });
            }
            return next(); // Super admin access granted for everything else
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

// Middleware specifically for timesheet access control
export const checkTimesheetAccess = (action) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = req.session.user;
        const userId = user.id;

        // Define role-based timesheet permissions
        const getTimesheetPermissions = (role, loginType) => {
            if (loginType === 'super_admin') {
                return {
                    create: false,
                    view_own: false,
                    view_all: true,
                    approve: true,
                    reject: true,
                    edit_all: true
                };
            }

            const permissions = {
                administrator: {
                    create: true,
                    view_own: true,
                    view_all: true,
                    approve: false,
                    reject: false,
                    edit_all: false
                },
                admin: {
                    create: true,
                    view_own: true,
                    view_all: true,
                    approve: false,
                    reject: false,
                    edit_all: false
                },
                accountant: {
                    create: true,
                    view_own: true,
                    view_all: false,
                    approve: false,
                    reject: false,
                    edit_all: false
                },
                trainer: {
                    create: true,
                    view_own: true,
                    view_all: false,
                    approve: false,
                    reject: false,
                    edit_all: false
                },
                support: {
                    create: true,
                    view_own: true,
                    view_all: false,
                    approve: false,
                    reject: false,
                    edit_all: false
                }
            };

            return permissions[role.toLowerCase()] || {};
        };

        const userPermissions = getTimesheetPermissions(user.role, user.loginType);

        // Check specific action permissions
        switch (action) {
            case 'create':
                if (!userPermissions.create) {
                    return res.status(403).json({ 
                        message: 'Access denied. Cannot create timesheets',
                        userRole: user.role
                    });
                }
                break;
            
            case 'view_all':
                if (!userPermissions.view_all) {
                    return res.status(403).json({ 
                        message: 'Access denied. Cannot view all timesheets',
                        userRole: user.role
                    });
                }
                break;
            
            case 'approve':
                if (!userPermissions.approve) {
                    return res.status(403).json({ 
                        message: 'Access denied. Cannot approve timesheets',
                        userRole: user.role
                    });
                }
                break;
            
            case 'reject':
                if (!userPermissions.reject) {
                    return res.status(403).json({ 
                        message: 'Access denied. Cannot reject timesheets',
                        userRole: user.role
                    });
                }
                break;
            
            case 'edit_all':
                if (!userPermissions.edit_all) {
                    return res.status(403).json({ 
                        message: 'Access denied. Cannot edit all timesheets',
                        userRole: user.role
                    });
                }
                break;
            
            case 'view_own':
                if (!userPermissions.view_own && !userPermissions.view_all) {
                    return res.status(403).json({ 
                        message: 'Access denied. Cannot view timesheets',
                        userRole: user.role
                    });
                }
                // Add user ID to request for filtering own timesheets
                req.userCanViewAll = userPermissions.view_all;
                req.currentUserId = userId;
                break;
            
            default:
                return res.status(400).json({ message: 'Invalid timesheet action' });
        }

        // Add permissions to request object for use in controllers
        req.timesheetPermissions = userPermissions;
        req.currentUserId = userId;
        
        next();
    };
};