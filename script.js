const demoSupplies = [
  {
    item: "Canned Beans",
    category: "Food",
    quantity: "6 cans",
    expiration: "2026-05-20",
    status: "Expires Soon",
    statusClass: "status-danger"
  },
  {
    item: "Bottled Water",
    category: "Water",
    quantity: "12 gallons",
    expiration: "2026-06-01",
    status: "Watch",
    statusClass: "status-warning"
  },
  {
    item: "Ibuprofen",
    category: "Medicine",
    quantity: "1 bottle",
    expiration: "2026-06-10",
    status: "Watch",
    statusClass: "status-warning"
  },
  {
    item: "Propane Tank",
    category: "Fuel",
    quantity: "2 tanks",
    expiration: "2026-08-15",
    status: "Good",
    statusClass: "status-good"
  }
];

function updateInventoryCount(filteredCount) {
  const count = document.getElementById("inventory-count");
  count.textContent = `${filteredCount} ${filteredCount === 1 ? "item" : "items"}`;
}

function renderInventory() {
  const list = document.getElementById("inventory-list");
  const filter = document.getElementById("category-filter").value;
  list.innerHTML = "";

  const filteredSupplies = filter === "All"
    ? demoSupplies
    : demoSupplies.filter((supply) => supply.category === filter);

  updateInventoryCount(filteredSupplies.length);

  filteredSupplies.forEach((supply) => {
    const card = document.createElement("article");
    card.className = "inventory-card";

    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">${supply.item}</h3>
          <p class="text-sm text-slate-500 mt-1">${supply.category} • ${supply.quantity}</p>
        </div>
        <span class="status-pill ${supply.statusClass}">${supply.status}</span>
      </div>

      <div class="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
        <span class="text-sm text-slate-500">Expiration</span>
        <span class="text-sm font-semibold text-slate-900">${supply.expiration}</span>
      </div>
    `;

    list.appendChild(card);
  });

  if (filteredSupplies.length === 0) {
    list.innerHTML = `
      <div class="rounded-2xl bg-white border border-slate-200 p-4 text-center text-sm text-slate-500">
        No supplies found for this category.
      </div>
    `;
  }
}

function setInventoryPanelExpanded(isExpanded) {
  const toggle = document.getElementById("inventory-toggle");
  const panel = document.getElementById("inventory-panel");
  const icon = document.getElementById("inventory-toggle-icon");

  toggle.setAttribute("aria-expanded", String(isExpanded));
  panel.hidden = !isExpanded;
  icon.textContent = isExpanded ? "⌃" : "⌄";
}

function toggleInventoryPanel() {
  const toggle = document.getElementById("inventory-toggle");
  const isExpanded = toggle.getAttribute("aria-expanded") === "true";

  setInventoryPanelExpanded(!isExpanded);
}

function handleDemoFormSubmit(event) {
  event.preventDefault();

  const item = document.getElementById("item-name").value.trim();
  const category = document.getElementById("category").value;
  const quantity = document.getElementById("quantity").value.trim();
  const unit = document.getElementById("unit").value.trim();
  const expiration = document.getElementById("expiration").value;

  if (!item || !quantity || !unit || !expiration) {
    alert("Please fill in all fields before adding a demo item.");
    return;
  }

  demoSupplies.unshift({
    item,
    category,
    quantity: `${quantity} ${unit}`,
    expiration,
    status: "New",
    statusClass: "status-good"
  });

  renderInventory();
  setInventoryPanelExpanded(false);
  event.target.reset();

  document.getElementById("inventory").scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  renderInventory();

  document
    .getElementById("category-filter")
    .addEventListener("change", renderInventory);

  document
    .getElementById("inventory-toggle")
    .addEventListener("click", toggleInventoryPanel);

  document
    .getElementById("add-supply-form")
    .addEventListener("submit", handleDemoFormSubmit);
});
