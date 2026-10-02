import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.success) setStats(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <h2 className="title">Admin Dashboard</h2>
      <p className="subtitle">Overview of platform metrics</p>

      {stats && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalStores}</div>
            <div className="stat-label">Total Stores</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalRatings}</div>
            <div className="stat-label">Total Submitted Ratings</div>
          </div>
        </div>
      )}

      <div className="dashboard-stats" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Manage Users</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>View, add, and manage system users, administrators, and store owners.</p>
          <Link to="/admin/users" className="btn btn-primary">Go to Users</Link>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Manage Stores</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>View, add, and manage stores and their assigned owners.</p>
          <Link to="/admin/stores" className="btn btn-primary">Go to Stores</Link>
        </div>
      </div>
    </div>
  );
}
