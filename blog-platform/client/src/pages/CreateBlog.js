import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import blogService from '../services/blogService';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
    coverImage: '',
    published: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      const blog = await blogService.createBlog({
        ...form,
        tags: tagsArray,
      });
      navigate(`/blogs/${blog._id}`);
    } catch (err) {
      const msg = err.response?.data?.errors
        ? err.response.data.errors.map((e) => e.message).join(', ')
        : err.response?.data?.message || 'Failed to create blog';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="editor-page">
      <div className="editor-header">
        <h1>New Post</h1>
        <div className="editor-meta-info">
          <span>{wordCount} words</span>
          <span>~{readTime} min read</span>
        </div>
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
            placeholder="Write your article here... (markdown supported)"
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
              placeholder="react, javascript, webdev"
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
              <span>Publish immediately</span>
            </label>
          </div>

          <div className="editor-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span className="spinner spinner-sm" />
              ) : form.published ? (
                'Publish Post'
              ) : (
                'Save Draft'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;
