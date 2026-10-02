import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../services/api';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address
      });

      if (res.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h2 className="title text-center">Sign Up</h2>
      <p className="subtitle text-center">Create a Normal User account</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name (20-60 characters)</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={20}
            maxLength={60}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <small className="text-muted" style={{display: 'block', marginBottom: '1rem'}}>
          8-16 chars, 1 uppercase, 1 special character required.
        </small>

        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea
            name="address"
            className="form-control"
            rows="3"
            value={formData.address}
            onChange={handleChange}
            maxLength={400}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Registering...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}
