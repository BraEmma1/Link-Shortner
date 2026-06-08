import mongoose from 'mongoose';
import QRCodeModel from '../models/QRCode.js';
import Link from '../models/Link.js';
import Analytics from '../models/Analytics.js';
import qrcodeLib from 'qrcode';

/**
 * @desc    Get all QR codes for the current user
 * @route   GET /api/v1/qrcodes
 * @access  Private
 */
export const getQRCodes = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const baseUrl = process.env.BASE_URL || 'https://thevaultzmedia.com';

    // 1. Fetch all links for user to handle legacy missing QR codes
    const links = await Link.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .lean();
      
    const total = await Link.countDocuments({ userId: req.user._id });

    // 2. Fetch all corresponding QR Code records in bulk to avoid N+1 query issue
    const linkIds = links.map((link) => link._id);
    const qrMetas = await QRCodeModel.find({ linkId: { $in: linkIds } }).lean();

    // Map by link ID for O(1) in-memory lookups
    const qrMetaMap = new Map();
    qrMetas.forEach((meta) => {
      qrMetaMap.set(meta.linkId.toString(), meta);
    });

    // 3. Map links to QR codes (creating metadata if it doesn't exist)
    const qrCodesData = await Promise.all(links.map(async (link) => {
      let qrMeta = qrMetaMap.get(link._id.toString());
      
      if (!qrMeta) {
        // Fallback: create metadata for legacy links
        const newQrMeta = await QRCodeModel.create({
          linkId: link._id,
          userId: req.user._id,
        });
        qrMeta = newQrMeta.toObject(); // Convert to plain object for consistency
      }

      // Generate base64 data URL on the fly for the preview
      const fullUrl = `${baseUrl}/${link.slug}`;
      const pngData = await qrcodeLib.toDataURL(fullUrl, {
        color: {
          dark: qrMeta.foregroundColor,
          light: qrMeta.backgroundColor
        },
        margin: qrMeta.margin,
        errorCorrectionLevel: qrMeta.errorCorrectionLevel
      });

      // Fetch scan count (optional: we can just use link.clicks, or specific QR code scans)
      const scans = link.clicks;

      return {
        _id: qrMeta._id,
        link: {
          _id: link._id,
          title: link.title || 'Untitled Link',
          slug: link.slug,
          shortUrl: fullUrl
        },
        metadata: {
          foregroundColor: qrMeta.foregroundColor,
          backgroundColor: qrMeta.backgroundColor,
          margin: qrMeta.margin,
          errorCorrectionLevel: qrMeta.errorCorrectionLevel
        },
        pngData,
        scans,
        createdAt: qrMeta.createdAt
      };
    }));

    return res.status(200).json({
      success: true,
      data: qrCodesData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return res.status(500).json({ success: false, error: 'Server Error while fetching QR codes' });
  }
};

/**
 * @desc    
 * @route   
 * @access  
 */
export const downloadQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 'png' or 'svg'

    const qrMeta = await QRCodeModel.findOne({ _id: id, userId: req.user._id }).populate('linkId').lean();
    if (!qrMeta || !qrMeta.linkId) {
      return res.status(404).json({ success: false, error: 'QR Code not found' });
    }

    const baseUrl = process.env.BASE_URL || 'https://thevaultzmedia.com';
    const fullUrl = `${baseUrl}/${qrMeta.linkId.slug}`;

    const options = {
      color: {
        dark: qrMeta.foregroundColor,
        light: qrMeta.backgroundColor
      },
      margin: qrMeta.margin,
      errorCorrectionLevel: qrMeta.errorCorrectionLevel
    };

    if (type === 'svg') {
      const svgString = await qrcodeLib.toString(fullUrl, { ...options, type: 'svg' });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="qrcode-${qrMeta.linkId.slug}.svg"`);
      return res.status(200).send(svgString);
    } else {
      // Default to PNG
      const pngBuffer = await qrcodeLib.toBuffer(fullUrl, { ...options, type: 'png' });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="qrcode-${qrMeta.linkId.slug}.png"`);
      return res.status(200).send(pngBuffer);
    }
  } catch (error) {
    console.error('Error downloading QR code:', error);
    return res.status(500).json({ success: false, error: 'Server Error while downloading QR code' });
  }
};
