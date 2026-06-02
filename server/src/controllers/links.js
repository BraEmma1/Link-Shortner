import crypto from 'crypto';
import Link from '../models/Link.js';
import QRCode from '../models/QRCode.js';

/**
 * @desc    Create a shortened link
 * @route   POST /api/v1/links
 * @access  Private
 */
export const createLink = async (req, res) => {
  try {
    const { targetUrl, title, customSlug } = req.body;

    // Validate target URL
    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        error: 'Target URL is required',
      });
    }

    // Determine the slug
    let slug = customSlug;
    if (slug) {
      // Clean custom slug if provided
      slug = slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
      
      // Check if custom slug already exists
      const existingLink = await Link.findOne({ slug });
      if (existingLink) {
        return res.status(400).json({
          success: false,
          error: 'Custom slug is already in use',
        });
      }
    } else {
      // Auto-generate a unique slug
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 5) {
        slug = crypto.randomBytes(3).toString('hex'); // 6 chars
        const existing = await Link.findOne({ slug });
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (!isUnique) {
        return res.status(500).json({
          success: false,
          error: 'Failed to generate a unique short URL',
        });
      }
    }

    // Determine base URL (default or from env)
    const baseUrl = process.env.BASE_URL || 'https://thevaultzmedia.com';
    const shortUrl = `${baseUrl}/${slug}`;

    // Create the Link record
    const link = await Link.create({
      userId: req.user._id,
      title: title || '',
      slug,
      targetUrl,
    });

    // Automatically generate QRCode metadata for the new link
    await QRCode.create({
      linkId: link._id,
      userId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      link: {
        _id: link._id,
        title: link.title,
        slug: link.slug,
        targetUrl: link.targetUrl,
        shortUrl,
        clicks: link.clicks,
        status: link.status,
        createdAt: link.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating link:', error);
    
    // Check for mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Server Error while creating link',
    });
  }
};

/**
 * @desc    Get all links for the current user
 * @route   GET /api/v1/links
 * @access  Private
 */
export const getLinks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = { userId: req.user._id };

    // Search by title or slug
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { slug: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (req.query.status && req.query.status !== 'All Status') {
      query.status = req.query.status.toLowerCase();
    }

    const total = await Link.countDocuments(query);
    const links = await Link.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .lean();

    const baseUrl = process.env.BASE_URL || 'https://thevaultzmedia.com';

    // Map links to include shortUrl
    const formattedLinks = links.map(link => ({
      _id: link._id,
      title: link.title,
      slug: link.slug,
      targetUrl: link.targetUrl,
      clicks: link.clicks,
      status: link.status,
      createdAt: link.createdAt,
      shortUrl: `${baseUrl}/${link.slug}`
    }));

    return res.status(200).json({
      success: true,
      data: formattedLinks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error while fetching links'
    });
  }
};

/**
 * @desc    Update a link
 * @route   PATCH /api/v1/links/:id
 * @access  Private
 */
export const updateLink = async (req, res) => {
  try {
    let link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    // Ensure user owns the link
    if (link.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this link' });
    }

    // Fields to update
    const { title, targetUrl, status } = req.body;

    if (title !== undefined) link.title = title;
    if (targetUrl !== undefined) link.targetUrl = targetUrl;
    if (status !== undefined) link.status = status;

    await link.save();

    const baseUrl = process.env.BASE_URL || 'https://thevaultzmedia.com';

    return res.status(200).json({
      success: true,
      link: {
        _id: link._id,
        title: link.title,
        slug: link.slug,
        targetUrl: link.targetUrl,
        clicks: link.clicks,
        status: link.status,
        createdAt: link.createdAt,
        shortUrl: `${baseUrl}/${link.slug}`
      }
    });
  } catch (error) {
    console.error('Error updating link:', error);
    return res.status(500).json({ success: false, error: 'Server error while updating link' });
  }
};

/**
 * @desc    Delete a link
 * @route   DELETE /api/v1/links/:id
 * @access  Private
 */
export const deleteLink = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    // Ensure user owns the link
    if (link.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this link' });
    }

    // Cascade delete associated QR code and analytics data
    await Promise.all([
      link.deleteOne(),
      QRCode.deleteMany({ linkId: link._id }),
      Analytics.deleteMany({ linkId: link._id }),
    ]);

    return res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting link:', error);
    return res.status(500).json({ success: false, error: 'Server error while deleting link' });
  }
};
