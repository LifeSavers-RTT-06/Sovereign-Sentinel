import React from 'react';

export default function Header({ userLabel, onSignOut }) {
  return (
    <header className="app-header">
      <div className="shell header-content">
        <div className="header-title">
          <p className="eyebrow">Emergency Preparedness</p>
          <h1>Sovereign Sentinel</h1>
          <p className="eyebrow header-user">Signed in as {userLabel}</p>
        </div>

        <div className="header-actions">
          <button type="button" className="sign-out-button" onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
