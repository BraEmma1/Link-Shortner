import crypto from 'crypto';
import Link from '../models/Link.js';

const RESERVED_SLUGS = ['api', 'health'];

const getBaseUrl = () =>
  (process.env.BASE_URL || 'https://thevaultzmedia.com').replace(/\/+$/, '');

const isHttpUrl = (value) => {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

// Stops links that point back at the short domain itself (redirect loops).
const pointsAtShortDomain = (value) => {
  try {
    return new URL(value).hostname === new URL(getBaseUrl()).hostname;
  } catch {
    return false;
  }
};

const generateSlug = async () => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = crypto.randomBytes(3).toString('hex');
    if (!(await Link.exists({ slug }))) return slug;
  }
  return null;
};

/**
 * @route  POST /api/shorten
 * @body   { targetUrl, customSlug? }
 */
export const createLink = async (req, res) => {
  try {
    const { targetUrl, customSlug } = req.body;

    if (typeof targetUrl !== 'string' || !isHttpUrl(targetUrl.trim())) {
      return res.status(400).json({ success: false, error: 'Please enter a valid http(s) URL' });
    }

    if (pointsAtShortDomain(targetUrl.trim())) {
      return res.status(400).json({ success: false, error: 'You cannot shorten a link that is already on this domain' });
    }

    let slug;
    if (customSlug) {
      slug = String(customSlug).toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
      if (slug.length < 2 || slug.length > 50) {
        return res.status(400).json({ success: false, error: 'Slug must be 2-50 characters long' });
      }
      if (RESERVED_SLUGS.includes(slug)) {
        return res.status(400).json({ success: false, error: 'That slug is reserved' });
      }
    } else {
      slug = await generateSlug();
      if (!slug) {
        return res.status(500).json({ success: false, error: 'Failed to generate a unique short URL' });
      }
    }

    const link = await Link.create({ slug, targetUrl: targetUrl.trim() });

    return res.status(201).json({
      success: true,
      link: {
        slug: link.slug,
        targetUrl: link.targetUrl,
        shortUrl: `${getBaseUrl()}/${link.slug}`,
        clicks: link.clicks,
        createdAt: link.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: 'Custom slug is already in use' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    console.error('Error creating link:', error);
    return res.status(500).json({ success: false, error: 'Server error while creating link' });
  }
};

/**
 * @route  GET /api/stats/:slug
 */
export const getStats = async (req, res) => {
  try {
    const slug = String(req.params.slug).toLowerCase();
    const link = await Link.findOne({ slug }).lean();

    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    return res.status(200).json({
      success: true,
      link: {
        slug: link.slug,
        targetUrl: link.targetUrl,
        shortUrl: `${getBaseUrl()}/${link.slug}`,
        clicks: link.clicks,
        createdAt: link.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ success: false, error: 'Server error while fetching stats' });
  }
};
