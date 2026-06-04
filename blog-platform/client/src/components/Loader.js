import React from 'react';

const Loader = ({ fullScreen = false, size = 'md', text = '' }) => {
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className={`spinner spinner-${size}`} />
        {text && <p className="loader-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className="loader-wrapper">
      <div className={`spinner spinner-${size}`} />
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;
