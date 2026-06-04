import { useState, useEffect, useCallback, useRef } from 'react';
import blogService from '../services/blogService';

// ─── useDebounce ──────────────────────────────────────────────────────────────
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// ─── useBlogs ─────────────────────────────────────────────────────────────────
export const useBlogs = (params = {}) => {
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await blogService.getAllBlogs(params);
      setBlogs(data.blogs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { blogs, pagination, loading, error, refetch: fetchBlogs };
};

// ─── useBlog ──────────────────────────────────────────────────────────────────
export const useBlog = (id) => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const data = await blogService.getBlogById(id);
        setBlog(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Blog not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  return { blog, loading, error };
};

// ─── useMyBlogs ───────────────────────────────────────────────────────────────
export const useMyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await blogService.getMyBlogs();
      setBlogs(data.blogs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your blogs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyBlogs();
  }, [fetchMyBlogs]);

  const removeBlog = useCallback((id) => {
    setBlogs((prev) => prev.filter((b) => b._id !== id));
  }, []);

  return { blogs, pagination, loading, error, refetch: fetchMyBlogs, removeBlog };
};

// ─── useLocalStorage ──────────────────────────────────────────────────────────
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};
