import React, { useEffect, useMemo, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import AddSupplyForm from './components/AddSupplyForm.jsx';
import AlertBanner from './components/AlertBanner.jsx';
import BottomNav from './components/BottomNav.jsx';
import Header from './components/Header.jsx';
import HouseholdProfile from './components/HouseholdProfile.jsx';
import InventoryList from './components/InventoryList.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import { createSupply, deleteSupply, getSupplies, updateSupply } from './api/suppliesApi.js';

const demoSupplies = [
  {
    itemID: 'canned-beans',
    itemName: 'Canned Beans',
    category: 'Food',
    quantity: 6,
    unit: 'cans',
    expirationDate: '2026-05-20',
  },
  {
    itemID: 'bottled-water',
    itemName: 'Bottled Water',
    category: 'Water',
    quantity: 12,
    unit: 'gallons',
    expirationDate: '2026-06-01',
  },
];

function formatQuantity(quantity, unit) {
  if (quantity === undefined || quantity === null || quantity === '') {
    return 'N/A';
  }

  const quantityText = String(quantity);
  const unitText = unit ? String(unit).trim() : '';
  return unitText ? `${quantityText} ${unitText}` : quantityText;
}

function getSupplyStatus(expirationDate) {
  const parsedExpirationDate = parseExpirationDate(expirationDate);

  if (!parsedExpirationDate) {
    return { status: 'Unknown', statusClass: 'status-warning' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (parsedExpirationDate < today) {
    return { status: 'Expired', statusClass: 'status-danger' };
  }

  const urgentCutoff = new Date(today);
  urgentCutoff.setDate(today.getDate() + 14);

  if (parsedExpirationDate <= urgentCutoff) {
    return { status: 'Expires Soon', statusClass: 'status-danger' };
  }

  const watchCutoff = new Date(today);
  watchCutoff.setDate(today.getDate() + 30);

  if (parsedExpirationDate <= watchCutoff) {
    return { status: 'Watch', statusClass: 'status-warning' };
  }

  return { status: 'Good', statusClass: 'status-good' };
}

function getSupplyIdentifier(supply) {
  return supply?.itemID ?? supply?.itemId ?? supply?.id ?? '';
}

function toUiSupply(supply) {
  const expirationDate = supply.expirationDate ?? supply.expiration ?? supply.expiryDate ?? '';
  const itemID = getSupplyIdentifier(supply);
  const itemName = supply.itemName ?? supply.item ?? supply.name ?? 'Unnamed Item';
  const category = supply.category ?? 'Other';
  const quantity = supply.quantity ?? '';
  const unit = supply.unit ?? '';
  const { status, statusClass } = getSupplyStatus(expirationDate);

  return {
    ...supply,
    id: itemID,
    itemID,
    itemName,
    item: itemName,
    category,
    quantity,
    unit,
    displayQuantity: formatQuantity(quantity, unit),
    expiration: expirationDate || 'No expiration date',
    expirationDate,
    status,
    statusClass,
  };
}

function toSupplyApiPayload(supply) {
  return {
    itemName: supply.itemName.trim(),
    category: supply.category,
    quantity: Number(supply.quantity),
    unit: supply.unit.trim(),
    expirationDate: supply.expirationDate,
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
        setSupplies(demoSupplies.map(toUiSupply));
      } finally {
        setIsLoadingSupplies(false);
      }
    };

    loadSupplies();
  }, []);

  const urgentSupplyCount = useMemo(() => getUrgentSupplyCount(supplies), [supplies]);

  const addSupply = async (supply) => {
    setApiError('');

    try {
      const payload = toSupplyApiPayload(supply);
      const createdSupply = await createSupply(payload);
      setSupplies((currentSupplies) => [
        toUiSupply({ ...payload, ...(createdSupply ?? {}) }),
        ...currentSupplies,
      ]);
      return true;
    } catch (error) {
      console.error('Failed to create supply:', error);
      setApiError(`Unable to save supply: ${error.message}`);
      return false;
    }
  };

  const editSupply = async (itemID, updates) => {
    setApiError('');

    if (!itemID) {
      setApiError('Unable to update supply because it is missing an item identifier.');
      return false;
    }

    try {
      const payload = toSupplyApiPayload(updates);
      const updatedSupply = await updateSupply(itemID, payload);
      setSupplies((currentSupplies) =>
        currentSupplies.map((supply) =>
          getSupplyIdentifier(supply) === itemID
            ? toUiSupply({ ...supply, ...payload, ...(updatedSupply ?? {}), itemID })
            : supply,
        ),
      );
      return true;
    } catch (error) {
      console.error('Failed to update supply:', error);
      setApiError(`Unable to update supply: ${error.message}`);
      return false;
    }
  };

  const removeSupply = async (itemID) => {
    setApiError('');

    if (!itemID) {
      setApiError('Unable to delete supply because it is missing an item identifier.');
      return false;
    }

    try {
      await deleteSupply(itemID);
      setSupplies((currentSupplies) =>
        currentSupplies.filter((supply) => getSupplyIdentifier(supply) !== itemID),
      );
      return true;
    } catch (error) {
      console.error('Failed to delete supply:', error);
      setApiError(`Unable to delete supply: ${error.message}`);
      return false;
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
                {apiError && (
                  <div className="panel error-panel" role="alert">
                    {apiError}
                  </div>
                )}
                {isLoadingSupplies && <div className="panel loading-panel">Loading supplies…</div>}
                <AlertBanner urgentCount={urgentSupplyCount} />
                <SummaryCards supplies={supplies} urgentSupplyCount={urgentSupplyCount} />
              </section>

              <InventoryList supplies={supplies} onUpdateSupply={editSupply} onDeleteSupply={removeSupply} />
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
