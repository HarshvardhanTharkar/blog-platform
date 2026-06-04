import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useBlog } from '../hooks/useBlogs';
import { useAuth } from '../context/AuthContext';
import blogService from '../services/blogService';
import Loader from '../components/Loader';

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { blog, loading, error } = useBlog(id);
  const { user, isAuthenticated } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const isAuthor = isAuthenticated && user?._id === blog?.author?._id;
  const isAdmin = user?.role === 'admin';

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setDeleting(true);
    try {
      await blogService.deleteBlog(id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
      setDeleting(false);
    }
  };

  if (loading) return <Loader fullScreen text="Loading article..." />;

  if (error) {
    return (
      <div className="error-page">
        <h2>Article not found</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <article className="blog-article">
        {/* Cover Image */}
        {blog.coverImage && (
          <div className="article-cover">
            <img src={blog.coverImage} alt={blog.title} />
          </div>
        )}

        {/* Header */}
        <header className="article-header">
          <div className="article-tags">
            {blog.tags?.map((tag) => (
              <Link key={tag} to={`/?tag=${tag}`} className="tag tag-primary">
                {tag}
              </Link>
            ))}
          </div>

          <h1 className="article-title">{blog.title}</h1>

          <div className="article-meta">
            <Link to={`/authors/${blog.author?._id}`} className="article-author">
              <div className="author-avatar">
                {blog.author?.avatar ? (
                  <img src={blog.author.avatar} alt={blog.author.name} />
                ) : (
                  <span>{blog.author?.name?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="author-name">{blog.author?.name}</div>
                <div className="article-date">
                  {blog.createdAt && format(new Date(blog.createdAt), 'MMMM d, yyyy')}
                  {blog.updatedAt !== blog.createdAt && ' (updated)'}
                </div>
              </div>
            </Link>

            <div className="article-stats">
              <span>{blog.readTime} min read</span>
              <span>·</span>
              <span>{blog.views} views</span>
            </div>
          </div>

          {/* Author actions */}
          {(isAuthor || isAdmin) && (
            <div className="article-actions">
              <Link to={`/blogs/${id}/edit`} className="btn btn-ghost btn-sm">
                Edit
              </Link>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <span className="spinner spinner-sm" /> : 'Delete'}
              </button>
            </div>
          )}
        </header>

        {/* Content */}
        <div className="article-content">
          {blog.content?.split('\n').map((para, i) =>
            para.trim() ? <p key={i}>{para}</p> : <br key={i} />
          )}
        </div>

        {/* Footer */}
        <footer className="article-footer">
          <Link to={`/authors/${blog.author?._id}`} className="author-card-link">
            <div className="author-card">
              <div className="author-avatar author-avatar-lg">
                {blog.author?.avatar ? (
                  <img src={blog.author.avatar} alt={blog.author.name} />
                ) : (
                  <span>{blog.author?.name?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="author-card-name">{blog.author?.name}</div>
                <div className="author-card-bio">{blog.author?.bio || 'View author profile'}</div>
              </div>
            </div>
          </Link>

          <Link to="/" className="btn btn-ghost">← Back to articles</Link>
        </footer>
      </article>
    </div>
  );
};

export default BlogDetails;
