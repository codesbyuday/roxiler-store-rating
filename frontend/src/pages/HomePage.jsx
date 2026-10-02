import React, { useEffect, useState } from 'react';
import { getHealthStatus } from '../services/api';

export default function HomePage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHealthStatus();
      setHealthData(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="card">
      <h1 className="title">Store Rating Platform</h1>
      <p className="subtitle">
        Phase 1 Foundation: React Frontend &amp; Express Backend initialized.
      </p>

      <div className="status-section">
        <h3>Backend API &amp; Connection Status</h3>
        {loading && <p className="loading">Checking backend connectivity...</p>}
        {error && (
          <div className="alert alert-error">
            <strong>Connection Notice:</strong> {error}
            <br />
            <button className="btn btn-secondary" onClick={fetchHealth} style={{ marginTop: '0.5rem' }}>
              Retry Connection
            </button>
          </div>
        )}
        {healthData && (
          <div className="alert alert-success">
            <p><strong>Status:</strong> {healthData.message}</p>
            <p><strong>Environment:</strong> {healthData.environment}</p>
            <p><strong>Server Timestamp:</strong> {healthData.timestamp}</p>
            <p>
              <strong>Database Status:</strong>{' '}
              <span className={`tag ${healthData.database?.status === 'connected' ? 'tag-green' : 'tag-orange'}`}>
                {healthData.database?.status}
              </span>
            </p>
            <small className="text-muted">{healthData.database?.details}</small>
          </div>
        )}
      </div>

      <div className="info-box">
        <h4>Phase 1 Status Checklist</h4>
        <ul>
          <li>✔ React frontend initialized with Vite &amp; React Router</li>
          <li>✔ Express backend initialized with CORS &amp; error middleware</li>
          <li>✔ Environment configuration &amp; DB connection pool foundation ready</li>
          <li>✔ Clean separation of concerns between frontend and backend</li>
          <li>⏳ Phase 2: PostgreSQL Schema &amp; Database Architecture (Next)</li>
        </ul>
      </div>
    </div>
  );
}
