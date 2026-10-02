import { useState, useEffect } from 'react';
import * as api from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and sorting
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('id');
  const [order, setOrder] = useState('asc');

  // Add User State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user', address: '' });
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // View Details State
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ ...filters, sortBy, order }).toString();
      const res = await api.get(`/admin/users?${query}`);
      if (res.success) setUsers(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [sortBy, order]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError('');
    setIsAdding(true);
    try {
      const res = await api.post('/admin/users', newUser);
      if (res.success) {
        setShowAddForm(false);
        setNewUser({ name: '', email: '', password: '', role: 'user', address: '' });
        fetchUsers();
      }
    } catch (err) {
      setAddError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      if (res.success) setSelectedUser(res.data);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="title">Users</h2>
          <p className="subtitle" style={{ marginBottom: 0 }}>Manage platform users</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Add New User</h3>
          {addError && <div className="alert alert-error">{addError}</div>}
          <form onSubmit={handleAddUser} style={{ marginTop: '1rem' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" name="name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required minLength={20} maxLength={60} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" name="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control" name="role" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="user">Normal User</option>
                  <option value="admin">Administrator</option>
                  <option value="owner">Store Owner</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input type="text" className="form-control" name="address" value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isAdding}>
              {isAdding ? 'Saving...' : 'Save User'}
            </button>
          </form>
        </div>
      )}

      {selectedUser && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>User Details</h3>
            <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Close</button>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> <span className={`tag ${selectedUser.role === 'admin' ? 'tag-orange' : 'tag-green'}`}>{selectedUser.role}</span></p>
            <p><strong>Address:</strong> {selectedUser.address || 'N/A'}</p>
            
            {selectedUser.role === 'owner' && (
              <div className="info-box">
                <h4>Associated Store Information</h4>
                {selectedUser.store ? (
                  <ul>
                    <li><strong>Store Name:</strong> {selectedUser.store.name}</li>
                    <li><strong>Overall Rating:</strong> {selectedUser.store.overallRating.toFixed(1)} / 5</li>
                  </ul>
                ) : (
                  <p>This owner does not have a store assigned yet.</p>
                )}
              </div>
            )}
          </div>
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
          <div>
            <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Role</label>
            <select className="form-control" name="role" value={filters.role} onChange={handleFilterChange}>
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-secondary" style={{ height: '40px' }}>Search</button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="text-center" style={{ padding: '2rem' }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div className="placeholder-box">No users found.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('name'); setOrder(order === 'asc' ? 'desc' : 'asc'); }}>Name {sortBy === 'name' && (order === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('email'); setOrder(order === 'asc' ? 'desc' : 'asc'); }}>Email {sortBy === 'email' && (order === 'asc' ? '↑' : '↓')}</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className="tag tag-green">{u.role}</span></td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => viewDetails(u.id)}>View</button>
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
