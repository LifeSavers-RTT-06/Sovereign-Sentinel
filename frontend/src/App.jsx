import React, { useEffect, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import AddSupplyForm from './components/AddSupplyForm.jsx';
import AlertBanner from './components/AlertBanner.jsx';
import BottomNav from './components/BottomNav.jsx';
import Header from './components/Header.jsx';
import HouseholdProfile from './components/HouseholdProfile.jsx';
import InventoryList from './components/InventoryList.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import { createSupply, getSupplies } from './api/suppliesApi.js';

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
];

function toUiSupply(supply) {
  return {
    id: supply.itemID ?? supply.id ?? crypto.randomUUID(),
    item: supply.item ?? supply.name ?? 'Unnamed Item',
    category: supply.category ?? 'Other',
    quantity: supply.quantity ?? 'N/A',
    expiration: supply.expiration ?? '9999-12-31',
    status: supply.status ?? 'Good',
    statusClass: supply.statusClass ?? 'status-good',
  };
}

export default function App() {
  const [supplies, setSupplies] = useState(demoSupplies);
  const [isLoadingSupplies, setIsLoadingSupplies] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadSupplies = async () => {
      setIsLoadingSupplies(true);
      setApiError('');

      try {
        const data = await getSupplies();
        const normalizedSupplies = Array.isArray(data) ? data.map(toUiSupply) : [];
        setSupplies(normalizedSupplies.length > 0 ? normalizedSupplies : demoSupplies);
      } catch (error) {
        console.error('Failed to load supplies:', error);
        setApiError('Unable to load live supplies right now. Showing demo data instead.');
        setSupplies(demoSupplies);
      } finally {
        setIsLoadingSupplies(false);
      }
    };

    loadSupplies();
  }, []);

  const addSupply = async (supply) => {
    try {
      const createdSupply = await createSupply(supply);
      setSupplies((currentSupplies) => [toUiSupply(createdSupply ?? supply), ...currentSupplies]);
    } catch (error) {
      console.error('Failed to create supply:', error);
      setApiError('Unable to save supply to API. Added locally only for this session.');
      setSupplies((currentSupplies) => [supply, ...currentSupplies]);
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <>
          <div className="app-shell">
            <Header
              userLabel={user?.signInDetails?.loginId ?? user?.username ?? 'Authenticated User'}
              onSignOut={signOut}
            />

            <main className="shell main-content">
              <section id="dashboard" className="dashboard-stack" aria-label="Dashboard overview">
                {apiError && <div className="panel">{apiError}</div>}
                {isLoadingSupplies && <div className="panel">Loading supplies…</div>}
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
      )}
    </Authenticator>
  );
}
