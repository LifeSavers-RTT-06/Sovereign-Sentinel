import React, { useMemo, useState } from 'react';

const categories = ['All', 'Food', 'Water', 'Fuel', 'Medicine', 'Other'];
const editCategories = categories.filter((category) => category !== 'All');

function getSupplyIdentifier(supply) {
  return supply?.itemID ?? supply?.itemId ?? supply?.id ?? '';
}

function getInitialEditForm(supply) {
  return {
    itemName: supply.itemName ?? '',
    category: supply.category ?? 'Other',
    quantity: supply.quantity ?? '',
    unit: supply.unit ?? '',
    expirationDate: supply.expirationDate ?? '',
  };
}

export default function InventoryList({ supplies, onUpdateSupply, onDeleteSupply }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [category, setCategory] = useState('All');

  const filteredSupplies = useMemo(() => {
    const sortedSupplies = [...supplies].sort((a, b) =>
      (a.expirationDate || '').localeCompare(b.expirationDate || ''),
    );
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
              filteredSupplies.map((supply) => (
                <InventoryCard
                  supply={supply}
                  key={getSupplyIdentifier(supply) || `${supply.itemName}-${supply.expirationDate}`}
                  onUpdateSupply={onUpdateSupply}
                  onDeleteSupply={onDeleteSupply}
                />
              ))
            ) : (
              <div className="empty-state">No supplies found for this category.</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function InventoryCard({ supply, onUpdateSupply, onDeleteSupply }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => getInitialEditForm(supply));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemID = getSupplyIdentifier(supply);
  const formId = itemID || `${supply.itemName}-${supply.expirationDate}`.replace(/[^a-z0-9_-]/gi, '-');

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleStartEdit = () => {
    setForm(getInitialEditForm(supply));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setForm(getInitialEditForm(supply));
    setIsEditing(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.itemName.trim() || !form.quantity || !form.unit.trim() || !form.expirationDate) {
      window.alert('Please fill in all fields before saving this supply.');
      return;
    }

    setIsSaving(true);
    const didUpdate = await onUpdateSupply(itemID, form);
    setIsSaving(false);

    if (didUpdate) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete ${supply.itemName} from your inventory?`);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    const didDelete = await onDeleteSupply(itemID);

    if (!didDelete) {
      setIsDeleting(false);
    }
  };

  return (
    <article className="inventory-card">
      {isEditing ? (
        <form className="edit-supply-form" onSubmit={handleSave}>
          <div>
            <label htmlFor={`edit-item-name-${formId}`}>Item name</label>
            <input
              id={`edit-item-name-${formId}`}
              type="text"
              className="mobile-input"
              value={form.itemName}
              onChange={(event) => updateField('itemName', event.target.value)}
            />
          </div>

          <div>
            <label htmlFor={`edit-category-${formId}`}>Category</label>
            <select
              id={`edit-category-${formId}`}
              className="mobile-input"
              value={form.category}
              onChange={(event) => updateField('category', event.target.value)}
            >
              {editCategories.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="two-column-fields">
            <div>
              <label htmlFor={`edit-quantity-${formId}`}>Quantity</label>
              <input
                id={`edit-quantity-${formId}`}
                type="number"
                className="mobile-input"
                value={form.quantity}
                onChange={(event) => updateField('quantity', event.target.value)}
              />
            </div>

            <div>
              <label htmlFor={`edit-unit-${formId}`}>Unit</label>
              <input
                id={`edit-unit-${formId}`}
                type="text"
                className="mobile-input"
                value={form.unit}
                onChange={(event) => updateField('unit', event.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor={`edit-expiration-${formId}`}>Expiration date</label>
            <input
              id={`edit-expiration-${formId}`}
              type="date"
              className="mobile-input"
              value={form.expirationDate}
              onChange={(event) => updateField('expirationDate', event.target.value)}
            />
          </div>

          <div className="inventory-actions">
            <button type="submit" className="secondary-button" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="ghost-button" onClick={handleCancelEdit} disabled={isSaving}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="inventory-card-header">
            <div>
              <h3>{supply.itemName}</h3>
              <p>
                {supply.category} • {supply.displayQuantity}
              </p>
            </div>
            <span className={`status-pill ${supply.statusClass}`}>{supply.status}</span>
          </div>

          <div className="expiration-row">
            <span>Expiration</span>
            <strong>{supply.expiration}</strong>
          </div>

          <div className="inventory-actions">
            <button type="button" className="secondary-button" onClick={handleStartEdit}>
              Edit
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </>
      )}
    </article>
  );
}
