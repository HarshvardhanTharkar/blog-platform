import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const BlogCard = ({ blog, onDelete, showActions = false }) => {
  const { _id, title, excerpt, author, tags, createdAt, readTime, views } = blog;

  return (
    <article className="blog-card">
      <div className="blog-card-body">
        <div className="blog-card-meta">
          {tags && tags.length > 0 && (
            <span className="tag tag-primary">{tags[0]}</span>
          )}
          <span className="read-time">{readTime} min read</span>
        </div>

        <h2 className="blog-card-title">
          <Link to={`/blogs/${_id}`}>{title}</Link>
        </h2>

        {excerpt && (
          <p className="blog-card-excerpt">{excerpt}</p>
        )}

        <div className="blog-card-footer">
          <div className="blog-card-author">
            <Link to={`/authors/${author?._id}`} className="author-link">
              <div className="author-avatar-sm">
                {author?.avatar ? (
                  <img src={author.avatar} alt={author.name} />
                ) : (
                  <span>{author?.name?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              <div className="author-info">
                <span className="author-name">{author?.name || 'Unknown Author'}</span>
                <span className="post-date">
                  {createdAt && format(new Date(createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </Link>
          </div>

          <div className="blog-card-stats">
            <span className="view-count">👁 {views || 0}</span>
            {showActions && (
              <div className="blog-card-actions">
                <Link to={`/blogs/${_id}/edit`} className="btn btn-sm btn-ghost">
                  Edit
                </Link>
                <button
                  onClick={() => onDelete && onDelete(_id)}
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
