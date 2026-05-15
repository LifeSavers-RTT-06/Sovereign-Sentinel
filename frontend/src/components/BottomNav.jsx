import React from 'react';
const navItems = [
  { href: '#dashboard', icon: '🏠', label: 'Home' },
  { href: '#inventory', icon: '📦', label: 'Items' },
  { href: '#add-supply', icon: '➕', label: 'Add' },
  { href: '#profile', icon: '👥', label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary mobile navigation">
      <div>
        {navItems.map((item) => (
          <a href={item.href} className="bottom-nav-link" key={item.href}>
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
