import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBlog } from '../hooks/useBlogs';
import blogService from '../services/blogService';
import Loader from '../components/Loader';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { blog, loading: fetching, error: fetchError } = useBlog(id);

  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
    coverImage: '',
    published: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Populate form when blog is loaded
  useEffect(() => {
    if (blog && !initialized) {
      setForm({
        title: blog.title || '',
        content: blog.content || '',
        tags: (blog.tags || []).join(', '),
        coverImage: blog.coverImage || '',
        published: blog.published !== undefined ? blog.published : true,
      });
      setInitialized(true);

      // Authorization check
      if (blog.author?._id !== user?._id && user?.role !== 'admin') {
        navigate('/dashboard');
      }
    }
  }, [blog, initialized, user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const tagsArray = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const updated = await blogService.updateBlog(id, { ...form, tags: tagsArray });
      navigate(`/blogs/${updated._id}`);
    } catch (err) {
      const msg = err.response?.data?.errors
        ? err.response.data.errors.map((e) => e.message).join(', ')
        : err.response?.data?.message || 'Failed to update blog';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader fullScreen text="Loading post..." />;
  if (fetchError) return <div className="error-page"><p>{fetchError}</p></div>;

  return (
    <div className="editor-page">
      <div className="editor-header">
        <h1>Edit Post</h1>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <input
            name="title"
            type="text"
            className="form-input editor-title-input"
            placeholder="Your article title..."
            value={form.title}
            onChange={handleChange}
            required
            minLength={5}
          />
        </div>

        <div className="form-group">
          <textarea
            name="content"
            className="form-textarea editor-content"
            placeholder="Write your article..."
            value={form.content}
            onChange={handleChange}
            required
            minLength={50}
            rows={20}
          />
        </div>

        <div className="editor-sidebar">
          <div className="form-group">
            <label>Tags <small>(comma separated)</small></label>
            <input
              name="tags"
              type="text"
              className="form-input"
              placeholder="react, javascript"
              value={form.tags}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Cover Image URL</label>
            <input
              name="coverImage"
              type="url"
              className="form-input"
              placeholder="https://..."
              value={form.coverImage}
              onChange={handleChange}
            />
          </div>

          <div className="form-group form-check">
            <label className="check-label">
              <input
                name="published"
                type="checkbox"
                checked={form.published}
                onChange={handleChange}
              />
              <span>Published</span>
            </label>
          </div>

          <div className="editor-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(`/blogs/${id}`)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner spinner-sm" /> : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditBlog;
