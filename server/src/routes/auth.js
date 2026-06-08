import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const isMockMode = () =>
  !process.env.WP_URL ||
  process.env.WP_URL.includes('your-wordpress-site.com') ||
  process.env.NODE_ENV === 'test';

router.post('/wp-login', authLimiter, async (req, res, next) => {
  const { email, username, password } = req.body;
  const loginIdentifier = email || username;

  if (!loginIdentifier || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email/username and password',
    });
  }

  try {
    let wpResponseData;

    if (isMockMode()) {
      console.log('⚠️ [Auth] Running in mock development mode');
      const isMockAdmin = loginIdentifier.toLowerCase().includes('admin');
      const mockWpUserId = isMockAdmin ? 1 : 99;
      const mockEmail = loginIdentifier.includes('@') ? loginIdentifier : `${loginIdentifier}@vaultzlinks.io`;
      const mockName = isMockAdmin ? 'Admin User' : 'Standard User';
      const mockRoles = isMockAdmin ? ['administrator'] : ['subscriber'];

      const payload = {
        iss: 'mock-wordpress-authority',
        iat: Math.floor(Date.now() / 1000),
        nbf: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
        data: {
          user: {
            id: mockWpUserId.toString(),
            user_login: loginIdentifier,
            user_nicename: loginIdentifier.split('@')[0],
            user_email: mockEmail,
            display_name: mockName,
            user_role: mockRoles,
          },
        },
      };

      const jwtSecret = process.env.WP_JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev_jwt_mock_secret_fallback' : null);
      if (!jwtSecret) throw new Error('WP_JWT_SECRET is missing');

      const token = jwt.sign(payload, jwtSecret);

      wpResponseData = {
        token,
        user_email: mockEmail,
        user_nicename: loginIdentifier.split('@')[0],
        user_display_name: mockName,
        user_id: mockWpUserId,
        user_role: mockRoles,
      };
    } else {
      console.log(`🌐 [Auth] Proxying authentication request to WordPress at ${process.env.WP_URL}`);
      const wpTokenEndpoint = `${process.env.WP_URL}/wp-json/jwt-auth/v1/token`;

      const response = await fetch(wpTokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginIdentifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: data.message || 'WordPress authentication failed',
        });
      }

      wpResponseData = data;
    }

    const decodedToken = jwt.decode(wpResponseData.token);
    if (!decodedToken || !decodedToken.data || !decodedToken.data.user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid JWT received from authentication authority',
      });
    }

    const wpUser = decodedToken.data.user;
    const wpUserId = parseInt(wpUser.id, 10);
    const emailStr = wpUser.user_email || wpResponseData.user_email;
    const displayName = wpUser.display_name || wpResponseData.user_display_name || wpUser.user_login;
    const rolesArray = Array.isArray(wpUser.user_role) ? wpUser.user_role : [wpUser.user_role || 'subscriber'];
    const resolvedRole = rolesArray.includes('administrator') ? 'admin' : 'user';

    let user = await User.findOne({ wpUserId });

    if (!user) {
      console.log(`🆕 [Auth] Syncing new WordPress user into MongoDB: ${emailStr} (WP ID: ${wpUserId})`);
      user = await User.create({ wpUserId, name: displayName, email: emailStr, role: resolvedRole, lastLogin: new Date() });
    } else {
      console.log(`🔄 [Auth] Updating lastLogin timestamp for user: ${emailStr}`);
      user.lastLogin = new Date();
      user.name = displayName;
      user.email = emailStr;
      user.role = resolvedRole;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      token: wpResponseData.token,
      user: {
        id: user._id,
        wpUserId: user.wpUserId,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('WordPress JWT Auth Error:', error);
    return res.status(500).json({ success: false, error: 'Internal authentication server error' });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    return res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve user session' });
  }
});

export default router;
