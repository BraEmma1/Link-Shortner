import Link from '../models/Link.js';
import Analytics from '../models/Analytics.js';
import { UAParser } from 'ua-parser-js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const geoip = require('geoip-lite');

/**
 * @desc    Handle short link redirects
 * @route   GET /:slug
 * @access  Public
 */
export const handleRedirect = async (req, res) => {
  try {
    const { slug } = req.params;

    // Use .lean() for fastest possible database read
    const link = await Link.findOne({ slug, status: 'active' }).lean();

    if (!link) {
      // Return a fast custom 404 page
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Not Found</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc; color: #334155; }
            .container { text-align: center; max-width: 400px; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #0f172a; }
            p { color: #64748b; margin-bottom: 1.5rem; }
            a { color: #2563eb; text-decoration: none; font-weight: 500; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Link Not Found</h1>
            <p>The shortened link you are trying to access does not exist or has been deactivated.</p>
            <a href="${process.env.CLIENT_URL || 'https://thevaultzmedia.com'}">Go to Homepage</a>
          </div>
        </body>
        </html>
      `);
    }

    // 1. Immediately redirect the user to the target URL (High Performance)
    res.redirect(302, link.targetUrl);

    // 2. Perform background tracking (Non-blocking)

    // Parse user agent info with ua-parser-js
    const uaString = req.headers['user-agent'] || '';
    const parser = new UAParser(uaString);
    const result = parser.getResult();

    const browser = result.browser.name || 'Unknown';
    const os = result.os.name || 'Unknown';

    let device = 'Desktop';
    if (result.device.type === 'mobile') device = 'Mobile';
    else if (result.device.type === 'tablet') device = 'Tablet';
    else if (result.device.type === 'smarttv') device = 'SmartTV';

    // IP address
    const ipAddressRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    const ipAddress = typeof ipAddressRaw === 'string' ? ipAddressRaw.split(',')[0].trim() : ipAddressRaw;

    // GeoIP Lookup
    let country = 'Unknown';
    if (ipAddress && ipAddress !== 'Unknown' && ipAddress !== '::1' && ipAddress !== '127.0.0.1') {
      const geo = geoip.lookup(ipAddress);
      if (geo && geo.country) {
        country = geo.country;
      }
    }
    // Referrer
    const referrer = req.headers.referer || req.headers.referrer || 'Direct';

  // Increment click count (fire-and-forget)
  Link.updateOne({ _id: link._id }, { $inc: { clicks: 1 } }).catch(err => console.error('Failed to update clicks:', err));

  // Create Analytics record (fire-and-forget)
  Analytics.create({
    linkId: link._id,
    ipAddress,
    browser,
    os,
    device,
    referrer,
    country
  }).catch(err => console.error('Failed to create analytics:', err));

} catch (error) {
  console.error('Redirect error:', error);
  res.status(500).send('Internal Server Error');
}
};
