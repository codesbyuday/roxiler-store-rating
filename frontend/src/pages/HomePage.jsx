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
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <img src={heroImg} alt="Hero" style={{ maxWidth: '300px', marginBottom: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
      
      <h1 className="title" style={{ fontSize: '3rem', marginBottom: '1.5rem', fontWeight: '800', color: 'var(--primary-color)' }}>
        Store Rating Platform
      </h1>
      
      <p className="subtitle" style={{ fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
        Discover the best stores around you. Empower your community by submitting honest reviews, and help others make informed decisions.
      </p>
      
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
        <Link to="/login" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1.15rem', borderRadius: '8px' }}>Log In</Link>
        <Link to="/signup" className="btn btn-secondary" style={{ padding: '0.85rem 2.5rem', fontSize: '1.15rem', borderRadius: '8px' }}>Sign Up</Link>
      </div>

      <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>For Users</h3>
          <p className="text-muted">Browse through an extensive list of registered stores and seamlessly share your 1-to-5 star feedback.</p>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>For Owners</h3>
          <p className="text-muted">Access a dedicated dashboard to monitor your overall ratings and view honest feedback in real-time.</p>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>For Admins</h3>
          <p className="text-muted">Maintain high-quality standards by managing user accounts and safely assigning store ownerships.</p>
        </div>
      </div>
    </div>
  );
}
