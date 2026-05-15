import React from 'react';
const profileDetails = [
  { label: 'Household Name', value: 'Carter Family' },
  { label: 'Household Size', value: '4 people' },
  { label: 'Preparedness Goal', value: '14 days' },
];

export default function HouseholdProfile() {
  return (
    <section id="profile" className="panel profile-panel" aria-labelledby="profile-heading">
      <h2 id="profile-heading">Household Profile</h2>
      <div className="profile-grid">
        {profileDetails.map((detail) => (
          <article className="profile-card" key={detail.label}>
            <p>{detail.label}</p>
            <strong>{detail.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
