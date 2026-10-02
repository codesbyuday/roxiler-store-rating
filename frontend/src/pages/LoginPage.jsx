import React from 'react';

export default function LoginPage() {
  return (
    <div className="card">
      <h2 className="title">User Login</h2>
      <p className="subtitle">
        Authentication &amp; Role-based Login (Admin, Normal User, Store Owner)
      </p>

      <div className="placeholder-box">
        <div className="lock-icon">🔒</div>
        <h3>Phase 1 Placeholder</h3>
        <p>
          Full authentication, JWT issuance, and role-based login routing are scheduled for <strong>Phase 4</strong>.
        </p>
        <p className="text-muted">
          (Per assignment instructions, business logic and credentials are intentionally deferred to future phases.)
        </p>
      </div>
    </div>
  );
}
