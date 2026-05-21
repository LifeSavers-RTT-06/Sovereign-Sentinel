import React from 'react';

export default function Header({ userLabel, onSignOut }) {
  const scrollToAddSupply = () => {
    document.getElementById('add-supply')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="app-header">
      <div className="shell header-content">
        <div>
          <p className="eyebrow">Emergency Preparedness</p>
          <h1>Sovereign Sentinel</h1>
          <p className="eyebrow">Signed in as {userLabel}</p>
        </div>

        <div>
          <button
            type="button"
            className="icon-button"
            aria-label="Add supply"
            onClick={scrollToAddSupply}
          >
            +
          </button>
          <button type="button" className="icon-button" aria-label="Sign out" onClick={onSignOut}>
            ↪
          </button>
        </div>
      </div>
    </header>
  );
}
