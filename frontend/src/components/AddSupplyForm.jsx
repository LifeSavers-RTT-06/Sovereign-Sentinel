import React, { useState } from 'react';

const initialForm = {
  item: '',
  category: 'Food',
  quantity: '',
  unit: '',
  expiration: '',
};

const categories = ['Food', 'Water', 'Fuel', 'Medicine', 'Other'];

export default function AddSupplyForm({ onAddSupply }) {
  const [form, setForm] = useState(initialForm);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.item.trim() || !form.quantity || !form.unit.trim() || !form.expiration) {
      window.alert('Please fill in all fields before adding a supply.');
      return;
    }

    onAddSupply({
      itemName: form.item.trim(),
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit.trim(),
      expirationDate: form.expiration,
    });

    setForm(initialForm);
    document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="add-supply" className="panel form-panel" aria-labelledby="add-supply-heading">
      <h2 id="add-supply-heading">Add Supply</h2>
      <p className="section-description">
        Add supplies to your household inventory.
      </p>

      <form className="supply-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="item-name">Item name</label>
          <input
            id="item-name"
            type="text"
            placeholder="Example: Canned beans"
            className="mobile-input"
            value={form.item}
            onChange={(event) => updateField('item', event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            className="mobile-input"
            value={form.category}
            onChange={(event) => updateField('category', event.target.value)}
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="two-column-fields">
          <div>
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              placeholder="6"
              className="mobile-input"
              value={form.quantity}
              onChange={(event) => updateField('quantity', event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="unit">Unit</label>
            <input
              id="unit"
              type="text"
              placeholder="cans"
              className="mobile-input"
              value={form.unit}
              onChange={(event) => updateField('unit', event.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="expiration">Expiration date</label>
          <input
            id="expiration"
            type="date"
            className="mobile-input"
            value={form.expiration}
            onChange={(event) => updateField('expiration', event.target.value)}
          />
        </div>

        <button type="submit" className="primary-button">
          Add Supply
        </button>
      </form>
    </section>
  );
}
