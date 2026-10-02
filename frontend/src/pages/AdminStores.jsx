import { useState, useEffect } from 'react';
import * as api from '../services/api';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and sorting
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('id');
  const [order, setOrder] = useState('asc');

  // Add Store State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ ...filters, sortBy, order }).toString();
      const res = await api.get(`/admin/stores?${query}`);
      if (res.success) setStores(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      // Fetch all owners to populate the select dropdown
      const res = await api.get('/admin/users?role=owner');
      if (res.success) setOwners(res.data);
    } catch (err) {
      console.error('Failed to fetch owners', err);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchOwners();
  }, [sortBy, order]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    setAddError('');
    setIsAdding(true);
    try {
      const res = await api.post('/admin/stores', {
        ...newStore,
        ownerId: parseInt(newStore.ownerId, 10)
      });
      if (res.success) {
        setShowAddForm(false);
        setNewStore({ name: '', email: '', address: '', ownerId: '' });
        fetchStores();
      }
    } catch (err) {
      setAddError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="title">Stores</h2>
          <p className="subtitle" style={{ marginBottom: 0 }}>Manage registered stores</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Store'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Add New Store</h3>
          {addError && <div className="alert alert-error">{addError}</div>}
          <form onSubmit={handleAddStore} style={{ marginTop: '1rem' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input type="text" className="form-control" name="name" value={newStore.name} onChange={e => setNewStore({...newStore, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={newStore.email} onChange={e => setNewStore({...newStore, email: e.target.value})} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Address</label>
                <input type="text" className="form-control" name="address" value={newStore.address} onChange={e => setNewStore({...newStore, address: e.target.value})} required maxLength={400} />
              </div>
              <div className="form-group">
                <label className="form-label">Store Owner</label>
                <select className="form-control" name="ownerId" value={newStore.ownerId} onChange={e => setNewStore({...newStore, ownerId: e.target.value})} required>
                  <option value="">Select an Owner...</option>
                  {owners.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={isAdding}>
              {isAdding ? 'Saving...' : 'Save Store'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <form onSubmit={applyFilters} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem', alignItems: 'end' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Name</label>
            <input type="text" className="form-control" placeholder="Filter by Name" name="name" value={filters.name} onChange={handleFilterChange} />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Email</label>
            <input type="text" className="form-control" placeholder="Filter by Email" name="email" value={filters.email} onChange={handleFilterChange} />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Address</label>
            <input type="text" className="form-control" placeholder="Filter by Address" name="address" value={filters.address} onChange={handleFilterChange} />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ height: '40px' }}>Search</button>
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
                  <th>Address</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('overallRating'); setOrder(order === 'asc' ? 'desc' : 'asc'); }}>Overall Rating {sortBy === 'overallRating' && (order === 'asc' ? '↑' : '↓')}</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(s => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.name}</strong><br/>
                      <small className="text-muted">{s.email}</small>
                    </td>
                    <td>{s.address}</td>
                    <td>
                      <span className={`tag ${s.overallRating > 0 ? 'tag-green' : 'tag-orange'}`}>
                        ★ {s.overallRating.toFixed(1)}
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
