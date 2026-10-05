import mongoose from 'mongoose';

/**
 * Link Schema - a slug mapped to a target URL, plus a simple click counter.
 */
const linkSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-_]+$/,
        'Slug can only contain letters, numbers, hyphens, and underscores',
      ],
      minlength: [2, 'Slug must be at least 2 characters long'],
      maxlength: [50, 'Slug cannot exceed 50 characters'],
    },
    targetUrl: {
      type: String,
      required: [true, 'Target URL is required'],
      trim: true,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Links created before the strip-down may be 'inactive'/'expired'; those must not redirect.
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Link', linkSchema);
