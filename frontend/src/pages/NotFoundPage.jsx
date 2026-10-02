import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="card text-center">
      <h2>404 - Page Not Found</h2>
      <p className="subtitle">The page you requested does not exist.</p>
      <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
        Return to Home
      </Link>
    </div>
  );
}
