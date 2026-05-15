import React from 'react';
export default function AlertBanner({ urgentCount }) {
  return (
    <section className="alert-banner" aria-labelledby="attention-heading">
      <div className="alert-icon" aria-hidden="true">
        ⚠️
      </div>
      <div>
        <h2 id="attention-heading">{urgentCount} supplies need attention</h2>
        <p>These items expire within 14 days. Replace them before they become unusable.</p>
      </div>
    </section>
  );
}
