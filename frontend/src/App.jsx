import React, { useEffect, useMemo, useState } from 'react';
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
    expirationDate: '2026-05-20',
    status: 'Expires Soon',
    statusClass: 'status-danger',
  },
  {
    id: 'bottled-water',
    item: 'Bottled Water',
    category: 'Water',
    quantity: '12 gallons',
    expiration: '2026-06-01',
    expirationDate: '2026-06-01',
    status: 'Watch',
    statusClass: 'status-warning',
  },
];

function toUiSupply(supply) {
  const expirationDate = supply.expirationDate ?? supply.expiration ?? '9999-12-31';

  return {
    id: supply.itemID ?? supply.id ?? crypto.randomUUID(),
    item: supply.item ?? supply.name ?? 'Unnamed Item',
    category: supply.category ?? 'Other',
    quantity: supply.quantity ?? 'N/A',
    expiration: expirationDate,
    expirationDate,
    status: supply.status ?? 'Good',
    statusClass: supply.statusClass ?? 'status-good',
  };
}

function parseExpirationDate(expirationDate) {
  if (!expirationDate) {
    return null;
  }

  const dateValue = String(expirationDate);
  const parsedDate = dateValue.includes('T')
    ? new Date(dateValue)
    : new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
}

function getUrgentSupplyCount(supplies) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const urgentCutoff = new Date(today);
  urgentCutoff.setDate(today.getDate() + 14);

  return supplies.filter((supply) => {
    const expirationDate = parseExpirationDate(supply.expirationDate ?? supply.expiration);
    return expirationDate && expirationDate >= today && expirationDate <= urgentCutoff;
  }).length;
}

export default function App() {
  const [supplies, setSupplies] = useState([]);
  const [isLoadingSupplies, setIsLoadingSupplies] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadSupplies = async () => {
      setIsLoadingSupplies(true);
      setApiError('');

      try {
        const data = await getSupplies();
        const normalizedSupplies = Array.isArray(data) ? data.map(toUiSupply) : [];
        setSupplies(normalizedSupplies);
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

  const urgentSupplyCount = useMemo(() => getUrgentSupplyCount(supplies), [supplies]);

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
                <AlertBanner urgentCount={urgentSupplyCount} />
                <SummaryCards supplies={supplies} urgentSupplyCount={urgentSupplyCount} />
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
