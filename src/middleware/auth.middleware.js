const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/customError');
const User = require('../modules/user/user.model');
const { ADMIN, ORGANIZER, EXHIBITOR } = require('../constants/roles');
const permissions = require('../constants/permissions');

const auth = (...requiredElements) => async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new ApiError(401, 'Please authenticate');
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await User.findOne({ _id: decoded.sub, isActive: true });

        if (!user) {
            throw new ApiError(401, 'User not found or inactive');
        }

        if (requiredElements.length) {
            const hasRole = requiredElements.some(element => user.role === element);
            const hasPermission = requiredElements.some(element => user.permissions?.includes(element));
            
            // Role-based hierarchy for permissions
            let possessesPermission = hasRole || hasPermission;
            
            // Role-based hierarchy & Special Cases
            
            // 1. ADMIN: Full access except for event content management (assigned to Organizers)
            if (user.role === ADMIN) {
                possessesPermission = !requiredElements.includes(permissions.MANAGE_EVENTS);
            }

            // 2. ORGANIZER: Full access to manage their events and attendees
            if (user.role === ORGANIZER) {
                possessesPermission = true; 
            }

            // 3. EXHIBITOR: Limited to their booth operations
            if (user.role === EXHIBITOR) {
                const exhibitorPerms = [permissions.CHECK_IN_VISITORS, permissions.MANAGE_STAFF];
                if (requiredElements.some(el => exhibitorPerms.includes(el))) {
                    possessesPermission = true;
                }
            }

            if (!possessesPermission) {
                throw new ApiError(403, 'Forbidden');
            }
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            return next(error);
        }
        next(new ApiError(401, 'Please authenticate'));
    }
};

module.exports = auth;
