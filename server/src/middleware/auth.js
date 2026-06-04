import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Express middleware that verifies WordPress JWT tokens and attaches the 
 * corresponding MongoDB User record to `req.user`.
 *
 * Expects the request to have an Authorization header:
 *   Authorization: Bearer <token>
 *
 * On success: attaches `req.user` (MongoDB User document) and calls next().
 * On failure: returns a 401 JSON response.
 */
export const protect = async (req, res, next) => {
  let token;

  // Extract token from the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized — no token provided.',
    });
  }

  try {
    if (!process.env.WP_JWT_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Authentication configuration error: WP_JWT_SECRET is missing.',
      });
    }
    // Verify against the WordPress JWT secret
    const decoded = jwt.verify(token, process.env.WP_JWT_SECRET);
    
    // Extract wpUserId from the standard WP JWT plugin payload structures
    const wpUserIdStr = decoded.data?.user?.id || decoded.sub;
    if (!wpUserIdStr) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized — invalid token payload schema.',
      });
    }

    const wpUserId = parseInt(wpUserIdStr, 10);

    // Fetch full synced MongoDB User document
    const user = await User.findOne({ wpUserId });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized — user session synced in WordPress but local database record not found.',
      });
    }

    // Attach full mongoose User object to req.user for downstream middleware/routes usage
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Not authorized — invalid or expired token.',
    });
  }
};

/**
 * Optional verification of WordPress JWT tokens.
 * If token is present and valid, attaches user record to req.user.
 * Otherwise, lets request continue as anonymous (no req.user).
 */
export const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    if (!process.env.WP_JWT_SECRET) {
      return next();
    }
    const decoded = jwt.verify(token, process.env.WP_JWT_SECRET);
    const wpUserIdStr = decoded.data?.user?.id || decoded.sub;
    if (!wpUserIdStr) {
      return next();
    }

    const wpUserId = parseInt(wpUserIdStr, 10);
    const user = await User.findOne({ wpUserId });

    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    // Continue anonymously even if verification fails
    next();
  }
};
