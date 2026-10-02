import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import heroImg from '../assets/hero.png';

export default function HomePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'owner') navigate('/owner/dashboard');
      else navigate('/user/stores');
    }
  }, [user, loading, navigate]);

  if (loading || user) return null; // Let the effect redirect

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <img src={heroImg} alt="Hero" style={{ maxWidth: '250px', marginBottom: '2rem', borderRadius: '12px' }} />
      <h1 className="title" style={{ fontSize: '2.5rem' }}>Store Rating Platform</h1>
      <p className="subtitle" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
        Discover the best stores around you, submit your reviews, and help the community make informed decisions.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/login" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>Login</Link>
        <Link to="/signup" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>Sign Up</Link>
      </div>
    </div>
  );
}
