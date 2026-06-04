import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import userService from '../services/userService';
import BlogCard from '../components/BlogCard';
import Loader from '../components/Loader';

const AuthorProfile = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await userService.getAuthorProfile(id);
        setData(result);
      } catch (err) {
        setError(err.response?.data?.message || 'Author not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <Loader fullScreen text="Loading profile..." />;
  if (error) return (
    <div className="error-page">
      <h2>Author not found</h2>
      <p>{error}</p>
      <Link to="/" className="btn btn-primary">Back to home</Link>
    </div>
  );

  const { user, blogs, blogCount } = data;

  return (
    <div className="author-profile-page">
      <div className="author-hero">
        <div className="author-hero-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span>{user.name?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>
        <div className="author-hero-info">
          <h1>{user.name}</h1>
          {user.bio && <p className="author-bio">{user.bio}</p>}
          <div className="author-stats">
            <span><strong>{blogCount}</strong> articles</span>
            <span>Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
          </div>
        </div>
      </div>

      <div className="author-blogs-section">
        <h2>Articles by {user.name}</h2>
        {blogs.length === 0 ? (
          <div className="empty-state">
            <p>No published articles yet.</p>
          </div>
        ) : (
          <div className="blogs-grid">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={{ ...blog, author: user }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorProfile;
