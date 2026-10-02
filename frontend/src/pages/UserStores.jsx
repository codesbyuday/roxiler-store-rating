import { useState, useEffect } from 'react';
import * as api from '../services/api';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and sorting
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  // Rating action state
  const [activeRatingStore, setActiveRatingStore] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const fetchStores = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ ...filters, sortBy, order }).toString();
      const res = await api.get(`/user/stores?${query}`);
      if (res.success) setStores(res.data.stores);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [sortBy, order]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const openRatingModal = (store) => {
    setActiveRatingStore(store);
    setRatingValue(store.userRating || 5);
    setRatingError('');
  };

  const closeRatingModal = () => {
    setActiveRatingStore(null);
    setRatingValue(5);
    setRatingError('');
  };

  const submitRating = async (e) => {
    e.preventDefault();
    setSubmittingRating(true);
    setRatingError('');

    try {
      if (activeRatingStore.userRating !== null) {
        // Modify
        await api.patch(`/user/stores/${activeRatingStore.id}/rating`, { rating: parseInt(ratingValue, 10) });
      } else {
        // Submit New
        await api.post(`/user/stores/${activeRatingStore.id}/rating`, { rating: parseInt(ratingValue, 10) });
      }
      
      closeRatingModal();
      fetchStores(); // Refresh list to reflect new ratings
    } catch (err) {
      setRatingError(err.message);
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div>
      <h2 className="title">Stores Directory</h2>
      <p className="subtitle">Browse stores and submit your ratings</p>

      <div className="card">
        <form onSubmit={applyFilters} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input type="text" className="form-control" style={{flex: 1, minWidth: '200px'}} placeholder="Search by Name" name="name" value={filters.name} onChange={handleFilterChange} />
          <input type="text" className="form-control" style={{flex: 1, minWidth: '200px'}} placeholder="Search by Address" name="address" value={filters.address} onChange={handleFilterChange} />
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="text-center" style={{ padding: '2rem' }}>Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="placeholder-box">No stores found.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('name'); setOrder(order === 'asc' ? 'desc' : 'asc'); }}>Name {sortBy === 'name' && (order === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('address'); setOrder(order === 'asc' ? 'desc' : 'asc'); }}>Address {sortBy === 'address' && (order === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('overallRating'); setOrder(order === 'asc' ? 'desc' : 'asc'); }}>Overall Rating {sortBy === 'overallRating' && (order === 'asc' ? '↑' : '↓')}</th>
                  <th>Your Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.address}</td>
                    <td>
                      <span className={`tag ${s.overallRating > 0 ? 'tag-green' : 'tag-orange'}`}>
                        ★ {s.overallRating.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      {s.userRating !== null ? (
                        <span style={{ color: '#047857', fontWeight: 600 }}>★ {s.userRating}</span>
                      ) : (
                        <span className="text-muted">Not rated</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => openRatingModal(s)}>
                        {s.userRating !== null ? 'Modify Rating' : 'Submit Rating'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeRatingStore && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>{activeRatingStore.userRating !== null ? 'Modify Rating' : 'Submit Rating'}</h3>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>for <strong>{activeRatingStore.name}</strong></p>
            
            {ratingError && <div className="alert alert-error">{ratingError}</div>}
            
            <form onSubmit={submitRating}>
              <div className="form-group">
                <label className="form-label">Select your rating (1-5)</label>
                <select className="form-control" value={ratingValue} onChange={(e) => setRatingValue(e.target.value)} required>
                  <option value={5}>★★★★★ (5 - Excellent)</option>
                  <option value={4}>★★★★☆ (4 - Good)</option>
                  <option value={3}>★★★☆☆ (3 - Average)</option>
                  <option value={2}>★★☆☆☆ (2 - Poor)</option>
                  <option value={1}>★☆☆☆☆ (1 - Terrible)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={closeRatingModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingRating}>
                  {submittingRating ? 'Saving...' : 'Save Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
