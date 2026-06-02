import mongoose from 'mongoose';

/**
 * Analytics Schema - Represents a click/visit event on a shortened link.
 */
const analyticsSchema = new mongoose.Schema(
  {
    // The link this analytic record belongs to
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Link',
      required: [true, 'Link ID is required'],
      index: true,
    },
    // Visitor's IP Address (anonymized/stored for geo/rate limits)
    ipAddress: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    // Country name or country code from geo lookup (e.g. "US", "Canada")
    country: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    // User agent browser (e.g. "Chrome", "Safari")
    browser: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    // User agent device type (e.g. "Desktop", "Mobile", "Tablet")
    device: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    // Operating system (e.g. "Windows", "Mac OS", "iOS", "Android")
    os: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    // Referrer URL or source (e.g. "https://twitter.com", "Direct")
    referrer: {
      type: String,
      trim: true,
      default: 'Direct',
    },
    // Specific timestamp of the click event
    clickedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    // We don't need updatedAt for analytical event logs, so only specify custom createdAt or use clickedAt
    timestamps: false,
  }
);

// Compound index for time-series range queries on specific links
analyticsSchema.index({ linkId: 1, clickedAt: -1 });

analyticsSchema.index({ linkId: 1, country: 1 });
analyticsSchema.index({ linkId: 1, device: 1 });
analyticsSchema.index({ linkId: 1, browser: 1 });
analyticsSchema.index({ linkId: 1, os: 1 });
analyticsSchema.index({ linkId: 1, referrer: 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
