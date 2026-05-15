import React, { useMemo, useState } from 'react';

const categories = ['All', 'Food', 'Water', 'Fuel', 'Medicine', 'Other'];

export default function InventoryList({ supplies }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [category, setCategory] = useState('All');

  const filteredSupplies = useMemo(() => {
    const sortedSupplies = [...supplies].sort((a, b) => a.expiration.localeCompare(b.expiration));
    return category === 'All'
      ? sortedSupplies
      : sortedSupplies.filter((supply) => supply.category === category);
  }, [category, supplies]);

  return (
    <section id="inventory" className="panel inventory-section">
      <button
        type="button"
        className="inventory-toggle"
        aria-expanded={isExpanded}
        aria-controls="inventory-panel"
        onClick={() => setIsExpanded((current) => !current)}
      >
        <span>
          <span className="section-title">Inventory</span>
          <span className="section-subtitle">Sorted by expiration date</span>
        </span>
        <span className="inventory-toggle-meta">
          <span className="count-pill">
            {filteredSupplies.length} {filteredSupplies.length === 1 ? 'item' : 'items'}
          </span>
          <span className="inventory-toggle-icon" aria-hidden="true">
            {isExpanded ? '⌃' : '⌄'}
          </span>
        </span>
      </button>

      {isExpanded && (
        <div id="inventory-panel" className="inventory-panel">
          <div className="filter-row">
            <label className="sr-only" htmlFor="category-filter">
              Filter inventory by category
            </label>
            <select
              id="category-filter"
              className="select-input compact"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="inventory-list">
            {filteredSupplies.length > 0 ? (
              filteredSupplies.map((supply) => <InventoryCard supply={supply} key={supply.id} />)
            ) : (
              <div className="empty-state">No supplies found for this category.</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function InventoryCard({ supply }) {
  return (
    <article className="inventory-card">
      <div className="inventory-card-header">
        <div>
          <h3>{supply.item}</h3>
          <p>
            {supply.category} • {supply.quantity}
          </p>
        </div>
        <span className={`status-pill ${supply.statusClass}`}>{supply.status}</span>
      </div>

      <div className="expiration-row">
        <span>Expiration</span>
        <strong>{supply.expiration}</strong>
      </div>
    </article>
  );
}
