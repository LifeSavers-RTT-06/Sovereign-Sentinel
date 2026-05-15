import React from 'react';
import { useState } from 'react';
import AddSupplyForm from './components/AddSupplyForm.jsx';
import AlertBanner from './components/AlertBanner.jsx';
import BottomNav from './components/BottomNav.jsx';
import Header from './components/Header.jsx';
import HouseholdProfile from './components/HouseholdProfile.jsx';
import InventoryList from './components/InventoryList.jsx';
import SummaryCards from './components/SummaryCards.jsx';

const demoSupplies = [
  {
    id: 'canned-beans',
    item: 'Canned Beans',
    category: 'Food',
    quantity: '6 cans',
    expiration: '2026-05-20',
    status: 'Expires Soon',
    statusClass: 'status-danger',
  },
  {
    id: 'bottled-water',
    item: 'Bottled Water',
    category: 'Water',
    quantity: '12 gallons',
    expiration: '2026-06-01',
    status: 'Watch',
    statusClass: 'status-warning',
  },
  {
    id: 'ibuprofen',
    item: 'Ibuprofen',
    category: 'Medicine',
    quantity: '1 bottle',
    expiration: '2026-06-10',
    status: 'Watch',
    statusClass: 'status-warning',
  },
  {
    id: 'propane-tank',
    item: 'Propane Tank',
    category: 'Fuel',
    quantity: '2 tanks',
    expiration: '2026-08-15',
    status: 'Good',
    statusClass: 'status-good',
  },
  {
    id: 'toilet-paper',
    item: 'Toilet Paper',
    category: 'Other',
    quantity: '12 rolls',
    expiration: '2027-01-15',
    status: 'Good',
    statusClass: 'status-good',
  },
  {
    id: 'disinfecting-wipes',
    item: 'Disinfecting Wipes',
    category: 'Other',
    quantity: '4 packs',
    expiration: '2026-07-01',
    status: 'Good',
    statusClass: 'status-good',
  },
];

export default function App() {
  const [supplies, setSupplies] = useState(demoSupplies);

  const addSupply = (supply) => {
    setSupplies((currentSupplies) => [supply, ...currentSupplies]);
  };

  return (
    <>
      <div className="app-shell">
        <Header />

        <main className="shell main-content">
          <section id="dashboard" className="dashboard-stack" aria-label="Dashboard overview">
            <AlertBanner urgentCount={3} />
            <SummaryCards />
          </section>

          <InventoryList supplies={supplies} />
          <AddSupplyForm onAddSupply={addSupply} />
          <HouseholdProfile />
        </main>
      </div>

      <BottomNav />
    </>
  );
}
