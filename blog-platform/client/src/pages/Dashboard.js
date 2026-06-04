import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMyBlogs } from '../hooks/useBlogs';
import BlogCard from '../components/BlogCard';
import Loader from '../components/Loader';
import blogService from '../services/blogService';

const Dashboard = () => {
  const { user } = useAuth();
  const { blogs, loading, error, removeBlog } = useMyBlogs();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setDeleting(id);
    try {
      await blogService.deleteBlog(id);
      removeBlog(id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete blog');
    } finally {
      setDeleting(null);
    }
  };

  const publishedCount = blogs.filter((b) => b.published).length;
  const draftCount = blogs.filter((b) => !b.published).length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Manage your articles and track your writing.</p>
        </div>
        <Link to="/blogs/create" className="btn btn-primary">
          ✦ New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{blogs.length}</div>
          <div className="stat-label">Total Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{publishedCount}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{draftCount}</div>
          <div className="stat-label">Drafts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {blogs.reduce((acc, b) => acc + (b.views || 0), 0)}
          </div>
          <div className="stat-label">Total Views</div>
        </div>
      </div>

      {/* My Posts */}
      <div className="dashboard-section">
        <h2>My Posts</h2>

        {loading ? (
          <Loader text="Loading your posts..." />
        ) : error ? (
          <div className="error-state"><p>{error}</p></div>
        ) : blogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <h3>No posts yet</h3>
            <p>Start writing your first article today.</p>
            <Link to="/blogs/create" className="btn btn-primary">
              Write your first post
            </Link>
          </div>
        ) : (
          <div className="blogs-grid">
            {blogs.map((blog) => (
              <div key={blog._id} style={{ position: 'relative' }}>
                {!blog.published && (
                  <span className="draft-badge">Draft</span>
                )}
                {deleting === blog._id && (
                  <div className="card-overlay"><Loader /></div>
                )}
                <BlogCard
                  blog={blog}
                  showActions
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
