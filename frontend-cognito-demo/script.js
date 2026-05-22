const POOL_DATA = {
  UserPoolId: 'us-east-1_eC3nvhZd8',
  ClientId: '6e9aoacduauq99vgd1l0f9nvok'
};

const API_BASE = "https://1aap5l8ly2.execute-api.us-east-1.amazonaws.com/prod";
const userPool = new AmazonCognitoIdentity.CognitoUserPool(POOL_DATA);
let currentUser = null;
let tempEmail = null;

function showLogin() {
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('signup-form').classList.add('hidden');
  document.getElementById('verify-form').classList.add('hidden');
}

function showSignup() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('signup-form').classList.remove('hidden');
  document.getElementById('verify-form').classList.add('hidden');
}

function showVerify(email) {
  tempEmail = email;
  document.getElementById('verify-email').textContent = email;
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('signup-form').classList.add('hidden');
  document.getElementById('verify-form').classList.remove('hidden');
}

function showApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  loadInventory();
}

function showAuth() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('app-screen').classList.add('hidden');
  showLogin();
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 5000);
}

function handleSignup() {
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  if (!email || !password) {
    showError('signup-error', 'Please fill in all fields');
    return;
  }

  if (password.length < 8) {
    showError('signup-error', 'Password must be at least 8 characters');
    return;
  }

  const attributeList = [
    new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email })
  ];

  userPool.signUp(email, password, attributeList, null, (err, result) => {
    if (err) {
      showError('signup-error', err.message || 'Signup failed');
      return;
    }
    showVerify(email);
  });
}

function handleVerify() {
  const code = document.getElementById('verify-code').value.trim();
  
  if (!code) {
    showError('verify-error', 'Please enter the verification code');
    return;
  }

  const userData = { Username: tempEmail, Pool: userPool };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.confirmRegistration(code, true, (err, result) => {
    if (err) {
      showError('verify-error', err.message || 'Verification failed');
      return;
    }
    document.getElementById('login-email').value = tempEmail;
    showLogin();
    alert('Email verified! Please sign in.');
  });
}

function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showError('login-error', 'Please fill in all fields');
    return;
  }

  const authenticationData = { Username: email, Password: password };
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  const userData = { Username: email, Pool: userPool };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: (result) => {
      currentUser = cognitoUser;
      const token = result.getIdToken().getJwtToken();
      localStorage.setItem('idToken', token);
      showApp();
    },
    onFailure: (err) => {
      showError('login-error', err.message || 'Login failed');
    }
  });
}

function handleLogout() {
  if (currentUser) {
    currentUser.signOut();
  }
  localStorage.removeItem('idToken');
  currentUser = null;
  showAuth();
}

function checkSession() {
  const cognitoUser = userPool.getCurrentUser();
  
  if (cognitoUser) {
    cognitoUser.getSession((err, session) => {
      if (err || !session.isValid()) {
        showAuth();
        return;
      }
      currentUser = cognitoUser;
      const token = session.getIdToken().getJwtToken();
      localStorage.setItem('idToken', token);
      showApp();
    });
  } else {
    showAuth();
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('idToken');
  return { 'Content-Type': 'application/json', 'Authorization': token };
}

async function loadInventory() {
  try {
    const res = await fetch(`${API_BASE}/supplies`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load supplies');
    const supplies = await res.json();
    renderInventory(supplies);
  } catch (e) {
    console.error(e);
    renderInventory([]);
  }
}

async function addSupply(item) {
  const res = await fetch(`${API_BASE}/supplies`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error('Failed to add supply');
  return res.json();
}

async function deleteSupply(itemID) {
  const res = await fetch(`${API_BASE}/supplies/${itemID}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete supply');
  return res.json();
}

function getStatusInfo(expiration) {
  if (!expiration) return { status: "No expiry", statusClass: "status-good" };
  const today = new Date();
  const exp = new Date(expiration);
  const diff = Math.ceil((exp - today) / 86400000);
  if (diff <= 7) return { status: "Expires Soon", statusClass: "status-danger" };
  if (diff <= 14) return { status: "Watch", statusClass: "status-warning" };
  return { status: "Good", statusClass: "status-good" };
}

function updateInventoryCount(count) {
  document.getElementById('inventory-count').textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
}

function renderInventory(supplies = []) {
  const list = document.getElementById('inventory-list');
  const filter = document.getElementById('category-filter').value;
  const filtered = filter === 'All' ? supplies : supplies.filter(s => s.category === filter);
  updateInventoryCount(filtered.length);

  if (!filtered.length) {
    list.innerHTML = '<div class="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center text-sm text-slate-500">No supplies yet. Add your first item below!</div>';
    return;
  }

  list.innerHTML = filtered.map(supply => {
    const { status, statusClass } = getStatusInfo(supply.expirationDate);
    return `
      <article class="inventory-card">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">${supply.itemName}</h3>
            <p class="text-sm text-slate-500 mt-1">${supply.category} • ${supply.quantity} ${supply.unit}</p>
          </div>
          <span class="status-pill ${statusClass}">${status}</span>
        </div>
        <div class="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
          <span class="text-sm text-slate-500">Expiration</span>
          <span class="text-sm font-semibold text-slate-900">${supply.expirationDate || '—'}</span>
        </div>
        <button onclick="handleDelete('${supply.itemID}')" class="mt-3 text-xs text-red-600 hover:underline">Remove item</button>
      </article>
    `;
  }).join('');
}

async function handleDelete(itemID) {
  if (!confirm('Remove this item from your inventory?')) return;
  try {
    await deleteSupply(itemID);
    await loadInventory();
  } catch (e) {
    alert('Failed to delete item: ' + e.message);
  }
}

function setInventoryPanelExpanded(isExpanded) {
  const toggle = document.getElementById('inventory-toggle');
  const panel = document.getElementById('inventory-panel');
  const icon = document.getElementById('inventory-toggle-icon');
  toggle.setAttribute('aria-expanded', String(isExpanded));
  panel.hidden = !isExpanded;
  icon.textContent = isExpanded ? '⌃' : '⌄';
}

function toggleInventoryPanel() {
  const isExpanded = document.getElementById('inventory-toggle').getAttribute('aria-expanded') === 'true';
  setInventoryPanelExpanded(!isExpanded);
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const itemName = document.getElementById('item-name').value.trim();
  const category = document.getElementById('category').value;
  const quantity = document.getElementById('quantity').value.trim();
  const unit = document.getElementById('unit').value.trim();
  const expirationDate = document.getElementById('expiration').value;

  if (!itemName || !quantity || !unit) {
    alert('Please fill in item name, quantity, and unit');
    return;
  }

  try {
    await addSupply({ itemName, category, quantity: Number(quantity), unit, expirationDate });
    await loadInventory();
    setInventoryPanelExpanded(true);
    event.target.reset();
    document.getElementById('inventory').scrollIntoView({ behavior: 'smooth' });
  } catch (e) {
    alert('Failed to add supply: ' + e.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkSession();
  document.getElementById('category-filter').addEventListener('change', () => loadInventory());
  document.getElementById('inventory-toggle').addEventListener('click', toggleInventoryPanel);
  document.getElementById('add-supply-form').addEventListener('submit', handleFormSubmit);
});
