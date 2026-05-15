import React from 'react';
export default function Header() {
  const scrollToAddSupply = () => {
    document.getElementById('add-supply')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="app-header">
      <div className="shell header-content">
        <div>
          <p className="eyebrow">Emergency Preparedness</p>
          <h1>Sovereign Sentinel</h1>
        </div>

        <button
          type="button"
          className="icon-button"
          aria-label="Add supply"
          onClick={scrollToAddSupply}
        >
          +
        </button>
      </div>
    </header>
  );
}
