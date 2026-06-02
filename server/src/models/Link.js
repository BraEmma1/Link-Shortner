import mongoose from 'mongoose';

/**
 * Link Schema - Represents a shortened link redirect configuration.
 */
const linkSchema = new mongoose.Schema(
  {
    // The user who created and owns this link
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner User ID is required'],
      index: true,
    },
    // Descriptive title or label for the link
    title: {
      type: String,
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
      default: '',
    },
    // The short slug (e.g., "promo" in "vlz.link/promo")
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9-_]+$/,
        'Slug can only contain alphanumeric characters, hyphens, and underscores',
      ],
      minlength: [2, 'Slug must be at least 2 characters long'],
      maxlength: [50, 'Slug cannot exceed 50 characters'],
    },
    // The original long URL to redirect the user to
    targetUrl: {
      type: String,
      required: [true, 'Target URL is required'],
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
        'Please enter a valid target URL',
      ],
    },
    // Total click count counter
    clicks: {
      type: Number,
      default: 0,
      min: [0, 'Clicks cannot be negative'],
    },
    // Current status of the link
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['active', 'inactive', 'expired'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
  },
  {
    // Automatically manage createdAt and updatedAt
    timestamps: true,
  }
);

// Compound index for user queries sorted by creation time
linkSchema.index({ userId: 1, createdAt: -1 });

// Single index for slug lookups is already handled by `unique: true` in schema definition

// Virtual relationship to Analytics
linkSchema.virtual('analytics', {
  ref: 'Analytics',
  localField: '_id',
  foreignField: 'linkId',
});

// Virtual relationship to QRCodes
linkSchema.virtual('qrCode', {
  ref: 'QRCode',
  localField: '_id',
  foreignField: 'linkId',
  justOne: true,
});

const Link = mongoose.model('Link', linkSchema);

export default Link;
