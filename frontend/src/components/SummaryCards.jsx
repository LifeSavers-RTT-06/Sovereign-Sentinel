import React from 'react';

export default function SummaryCards({ supplies, urgentSupplyCount }) {
  const foodSupplyCount = supplies.filter((supply) => supply.category === 'Food').length;
  const categoryCount = new Set(supplies.map((supply) => supply.category).filter(Boolean)).size;
  const cards = [
    { label: 'Total', value: supplies.length.toString(), helper: 'Supplies' },
    {
      label: 'Urgent',
      value: urgentSupplyCount.toString(),
      helper: 'Expiring soon',
      tone: 'danger',
    },
    { label: 'Food', value: foodSupplyCount.toString(), helper: 'Food supplies' },
    { label: 'Categories', value: categoryCount.toString(), helper: 'Supply types' },
  ];

  return (
    <>
      <section className="summary-grid" aria-label="Preparedness summary">
        {cards.map((card) => (
          <article className="summary-card" key={card.label}>
            <p className="summary-label">{card.label}</p>
            <p className={card.tone === 'danger' ? 'summary-value danger-text' : 'summary-value'}>
              {card.value}
            </p>
            <p className="summary-helper">{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="readiness-card" aria-labelledby="readiness-heading">
        <div>
          <h2 id="readiness-heading">Readiness Gap</h2>
          <p>
            {foodSupplyCount > 0
              ? `Your current food inventory includes ${foodSupplyCount} food ${
                  foodSupplyCount === 1 ? 'supply' : 'supplies'
                }. Review quantities against your 14-day goal.`
              : 'No food supplies are currently recorded. Add food inventory to compare against your 14-day goal.'}
          </p>
        </div>
        <span className="restock-pill">Restock</span>
      </section>
    </>
  );
}
