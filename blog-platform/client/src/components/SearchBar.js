import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ onSearch, placeholder = 'Search articles...', inline = false }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (onSearch) {
      onSearch(query.trim());
    } else {
      navigate(`/?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      className={`search-bar ${inline ? 'search-bar-inline' : ''}`}
      onSubmit={handleSubmit}
    >
      <div className="search-input-wrapper">
        <span className="search-icon">⌕</span>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search blogs"
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            onClick={() => {
              setQuery('');
              if (onSearch) onSearch('');
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      <button type="submit" className="btn btn-primary search-submit">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
