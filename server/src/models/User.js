import mongoose from 'mongoose';

/**
 * User Schema - Maps WordPress users to the Link Shortener database.
 */
const userSchema = new mongoose.Schema(
  {
    // WordPress User ID (from JWT token) to establish identity sync
    wpUserId: {
      type: Number,
      required: [true, 'WordPress User ID is required'],
      unique: true,
      index: true,
    },
    // User's display name or full name
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    // User's email address
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    // User role within the application
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['admin', 'user'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
    },
    // Tracking user's last authentication/login time
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    // Automatically manage createdAt and updatedAt
    timestamps: true,
  }
);

// Pre-save hook or helper methods can be added here in the future
// Virtuals can also be added here if needed, for instance, to reference the user's links
userSchema.virtual('links', {
  ref: 'Link',
  localField: '_id',
  foreignField: 'userId',
});

// Compile and export the model
const User = mongoose.model('User', userSchema);

export default User;
