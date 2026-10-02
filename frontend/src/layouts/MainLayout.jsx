import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/" className="brand-logo">StoreRating</Link>
          {user && <span className="badge">{user.role.toUpperCase()}</span>}
        </div>
        
        <div className="nav-links">
          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="nav-item">Dashboard</Link>
                  <Link to="/admin/users" className="nav-item">Users</Link>
                  <Link to="/admin/stores" className="nav-item">Stores</Link>
                </>
              )}
              {user.role === 'user' && (
                <>
                  <Link to="/user/stores" className="nav-item">Stores</Link>
                </>
              )}
              {user.role === 'owner' && (
                <>
                  <Link to="/owner/dashboard" className="nav-item">Dashboard</Link>
                </>
              )}
              <div className="nav-links" style={{marginLeft: '2rem'}}>
                <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }} title="Toggle Theme">
                  {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                </button>
                <Link to="/change-password" className="nav-item">Change Password</Link>
                <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
              </div>
            </>
          ) : (
            <>
              <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }} title="Toggle Theme">
                  {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
              </button>
              <Link to="/login" className="nav-item">Login</Link>
              <Link to="/signup" className="nav-item">Signup</Link>
            </>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Store Rating Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
