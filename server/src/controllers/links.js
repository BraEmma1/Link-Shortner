import crypto from 'crypto';
import Link from '../models/Link.js';
import QRCode from '../models/QRCode.js';
import Analytics from '../models/Analytics.js';

const getBaseUrl = () =>
  (process.env.BASE_URL || 'https://thevaultzmedia.com').replace(/\/+$/, '');

export const createLink = async (req, res) => {
  try {
    const { targetUrl, title, customSlug } = req.body;

    if (!targetUrl) {
      return res.status(400).json({ success: false, error: 'Target URL is required' });
    }

    let slug = customSlug;

    if (slug) {
      slug = slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
      const existingLink = await Link.findOne({ slug });
      if (existingLink) {
        return res.status(400).json({ success: false, error: 'Custom slug is already in use' });
      }
    } else {
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 5) {
        slug = crypto.randomBytes(3).toString('hex');
        const existing = await Link.findOne({ slug });
        if (!existing) isUnique = true;
        attempts++;
      }

      if (!isUnique) {
        return res.status(500).json({ success: false, error: 'Failed to generate a unique short URL' });
      }
    }

    const shortUrl = `${getBaseUrl()}/${slug}`;

    const link = await Link.create({
      userId: req.user?._id,
      title: title || '',
      slug,
      targetUrl,
    });

    await QRCode.create({
      linkId: link._id,
      userId: req.user?._id,
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

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }

    return res.status(500).json({ success: false, error: 'Server Error while creating link' });
  }
};

export const getLinks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = { userId: req.user._id };

    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { slug: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.status && req.query.status !== 'All Status') {
      query.status = req.query.status.toLowerCase();
    }

    const total = await Link.countDocuments(query);
    const links = await Link.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .lean();

    const baseUrl = getBaseUrl();

    const formattedLinks = links.map((link) => ({
      _id: link._id,
      title: link.title,
      slug: link.slug,
      targetUrl: link.targetUrl,
      clicks: link.clicks,
      status: link.status,
      createdAt: link.createdAt,
      shortUrl: `${baseUrl}/${link.slug}`,
    }));

    return res.status(200).json({
      success: true,
      data: formattedLinks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    return res.status(500).json({ success: false, error: 'Server Error while fetching links' });
  }
};

export const updateLink = async (req, res) => {
  try {
    let link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    if (link.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this link' });
    }

    const { title, targetUrl, status } = req.body;

    if (title !== undefined) link.title = title;
    if (targetUrl !== undefined) link.targetUrl = targetUrl;
    if (status !== undefined) link.status = status;

    await link.save();

    const baseUrl = getBaseUrl();

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
        shortUrl: `${baseUrl}/${link.slug}`,
      },
    });
  } catch (error) {
    console.error('Error updating link:', error);
    return res.status(500).json({ success: false, error: 'Server error while updating link' });
  }
};

export const deleteLink = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    if (link.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this link' });
    }

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
