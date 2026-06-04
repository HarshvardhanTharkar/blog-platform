import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import blogService from '../services/blogService';
import { useDebounce } from '../hooks/useBlogs';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (debouncedSearch.trim().length >= 2) {
          data = await blogService.searchBlogs(debouncedSearch, { page });
        } else {
          data = await blogService.getAllBlogs({ page, limit: 9 });
        }
        setBlogs(data.blogs);
        setPagination(data.pagination);
      } catch (err) {
        setError('Failed to load articles. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [debouncedSearch, page]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Est. 2024</div>
          <h1 className="hero-title">
            Stories worth<br />
            <em>reading.</em>
          </h1>
          <p className="hero-subtitle">
            Discover thoughtful articles, tutorials, and ideas from a growing community of writers.
          </p>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search articles, topics, authors..."
          />
        </div>
        <div className="hero-decoration">
          <div className="deco-circle deco-1" />
          <div className="deco-circle deco-2" />
          <div className="deco-line" />
        </div>
      </section>

      {/* Blog Grid */}
      <section className="blogs-section">
        <div className="section-header">
          {debouncedSearch ? (
            <h2>Results for <em>"{debouncedSearch}"</em></h2>
          ) : (
            <h2>Latest Articles</h2>
          )}
          {pagination && (
            <span className="results-count">{pagination.total} articles</span>
          )}
        </div>

        {loading ? (
          <Loader text="Loading articles..." />
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => setPage(1)}>Retry</button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <h3>No articles found</h3>
            <p>{debouncedSearch ? 'Try a different search term.' : 'Be the first to write!'}</p>
          </div>
        ) : (
          <div className="blogs-grid">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost"
              disabled={!pagination.hasPrev}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Previous
            </button>
            <span className="page-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className="btn btn-ghost"
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
