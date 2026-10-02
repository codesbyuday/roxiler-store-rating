import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="app-container">
      <header className="navbar">
        <div className="nav-brand">
          <NavLink to="/" className="brand-logo">
            Store Rating Platform
          </NavLink>
          <span className="badge">Phase 1</span>
        </div>
        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            Home
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            Login
          </NavLink>
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>Store Rating Platform &bull; Phase 1 Foundation</p>
      </footer>
    </div>
  );
}
