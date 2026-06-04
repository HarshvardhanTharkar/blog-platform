const mongoose = require('mongoose');

/**
 * Blog Schema
 * Each blog is authored by a User (ObjectId reference).
 * Tags are stored as an array of lowercase strings.
 * A text index on title + content enables MongoDB full-text search.
 */
const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [50, 'Content must be at least 50 characters'],
    },
    excerpt: {
      type: String,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => tags.map((t) => t.toLowerCase().trim()),
    },
    coverImage: {
      type: String,
      default: '',
    },
    published: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number, // minutes
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Full-text search index
BlogSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Regular indexes for common query patterns
BlogSchema.index({ author: 1, createdAt: -1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ published: 1, createdAt: -1 });

// Pre-save: auto-generate excerpt and read time
BlogSchema.pre('save', function (next) {
  // Auto-excerpt from content if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.replace(/<[^>]+>/g, '').substring(0, 200) + '...';
  }
  // Estimate read time (avg 200 words/min)
  if (this.content) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);
