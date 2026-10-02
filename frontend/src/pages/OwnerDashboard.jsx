import { useState, useEffect } from 'react';
import * as api from '../services/api';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/owner/dashboard');
        if (res.success) setData(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="text-center" style={{ padding: '3rem' }}>Loading dashboard...</div>;

  if (error) {
    return (
      <div className="card">
        <h2 className="title text-error">Dashboard Error</h2>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <h2 className="title">Owner Dashboard</h2>
      <p className="subtitle">Overview of your store's performance</p>

      <div className="dashboard-stats" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{data.store.name}</h3>
          <p className="text-muted">{data.store.address}</p>
        </div>
        <div className="stat-card">
          <div className="stat-value">★ {data.averageRating.toFixed(1)}</div>
          <div className="stat-label">Average Rating</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Submitted Ratings ({data.ratings.length})</h3>
        
        {data.ratings.length === 0 ? (
          <div className="placeholder-box">No ratings have been submitted for your store yet.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Rating Given</th>
                </tr>
              </thead>
              <tbody>
                {data.ratings.map((r, idx) => (
                  <tr key={idx}>
                    <td><strong>{r.userName}</strong></td>
                    <td>{r.userEmail}</td>
                    <td>
                      <span className={`tag ${r.rating >= 3 ? 'tag-green' : 'tag-orange'}`}>
                        ★ {r.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
