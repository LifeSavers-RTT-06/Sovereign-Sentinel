import React from 'react';
const cards = [
  { label: 'Total', value: '24', helper: 'Supplies' },
  { label: 'Urgent', value: '3', helper: 'Expiring soon', tone: 'danger' },
  { label: 'Food', value: '5', helper: 'Days covered' },
  { label: 'Household', value: '4', helper: 'People' },
];

export default function SummaryCards() {
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
            Your current food inventory covers <strong>5 days</strong>. Your 14-day goal is
            missing <strong className="danger-text"> 9 days</strong>.
          </p>
        </div>
        <span className="restock-pill">Restock</span>
      </section>
    </>
  );
}
