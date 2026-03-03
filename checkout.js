// ===== PICKUP-ONLY ITEMS =====
const PICKUP_ONLY_KEYWORDS = ["spring rolls", "samosa", "chicken wings", "fruit salad"];

function isPickupOnly(name) {
  return PICKUP_ONLY_KEYWORDS.some(k => name.toLowerCase().includes(k));
}

// ===== CART STATE (shared with localStorage) =====
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ===== CART CALCULATIONS =====
function getSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getDeliveryFee() {
  const sel = document.getElementById("delivery-area");
  if (!sel) return 0;
  return parseFloat(sel.value) || 0;
}

function isDeliverySelected() {
  const r = document.querySelector('input[name="orderType"]:checked');
  return r && r.value === "delivery";
}

function updateTotals() {
  const subtotal = getSubtotal();
  const deliveryFee = isDeliverySelected() ? getDeliveryFee() : 0;
  const total = subtotal + deliveryFee;

  document.getElementById("checkout-subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("checkout-total").textContent = total.toFixed(2);

  const feeRow = document.getElementById("delivery-fee-row");
  if (isDeliverySelected()) {
    feeRow.style.display = "flex";
    document.getElementById("delivery-fee-amount").textContent = deliveryFee.toFixed(2);
  } else {
    feeRow.style.display = "none";
  }
}

// ===== RENDER ORDER SUMMARY =====
function renderOrderSummary() {
  const container = document.getElementById("checkout-items");
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = `<p style="color:#C4161C; font-weight:600; padding:10px 0;">
      Your cart is empty. <a href="index.html" style="color:#C4161C;">← Go back</a>
    </p>`;
    updateTotals();
    return;
  }

  cart.forEach((item, index) => {
    const pickupOnly = isPickupOnly(item.name);
    const div = document.createElement("div");
    div.className = "checkout-item-row";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="checkout-item-details">
        <p class="checkout-item-name">
          ${item.name}
          ${pickupOnly ? '<span class="pickup-tag">Pickup Only</span>' : ''}
        </p>
        <p class="checkout-item-price">£${item.price.toFixed(2)} × ${item.quantity} = <strong>£${(item.price * item.quantity).toFixed(2)}</strong></p>
        <div class="checkout-qty-controls">
          <button class="checkout-qty-btn" onclick="checkoutDecrease(${index})">−</button>
          <span class="checkout-qty-display">${item.quantity}</span>
          <button class="checkout-qty-btn" onclick="checkoutIncrease(${index})">+</button>
        </div>
      </div>
      <button class="checkout-remove-btn" onclick="checkoutRemove(${index})" title="Remove">✕</button>
    `;
    container.appendChild(div);
  });

  updateTotals();
  checkPickupEnforcement();
}

// ===== CHECKOUT CART CONTROLS =====
function checkoutIncrease(index) {
  cart[index].quantity++;
  saveCart();
  renderOrderSummary();
}

function checkoutDecrease(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    cart.splice(index, 1);
  }
  saveCart();
  renderOrderSummary();
}

function checkoutRemove(index) {
  cart.splice(index, 1);
  saveCart();
  renderOrderSummary();
}

// ===== PICKUP ENFORCEMENT =====
function checkPickupEnforcement() {
  const hasPickupOnlyItem = cart.some(item => isPickupOnly(item.name));
  const deliveryRadio = document.getElementById("opt-delivery");
  const pickupRadio = document.getElementById("opt-pickup");
  const warning = document.getElementById("delivery-warning");

  if (hasPickupOnlyItem) {
    // Force pickup — disable delivery radio
    deliveryRadio.disabled = true;
    pickupRadio.checked = true;
    warning.style.display = "block";
    toggleOrderType("pickup");
  } else {
    deliveryRadio.disabled = false;
    warning.style.display = "none";
  }
}

// ===== ORDER TYPE TOGGLE =====
function toggleOrderType(type) {
  const deliveryFields = document.getElementById("delivery-fields");
  const pickupInfo = document.getElementById("pickup-info-section");
  const feeRow = document.getElementById("delivery-fee-row");

  if (type === "pickup") {
    // Show pickup info, hide delivery fields
    pickupInfo.style.display = "block";
    deliveryFields.style.display = "none";

    // Disable delivery inputs (not name/phone — those are outside delivery-fields)
    deliveryFields.querySelectorAll("input, select").forEach(el => el.disabled = true);

  } else {
    // delivery
    pickupInfo.style.display = "none";
    deliveryFields.style.display = "block";
    deliveryFields.querySelectorAll("input, select").forEach(el => el.disabled = false);
  }

  updateTotals();
}

// ===== INIT =====
renderOrderSummary();

// Set initial toggle state
const initialType = document.querySelector('input[name="orderType"]:checked').value;
toggleOrderType(initialType);

// Listen for radio changes
document.querySelectorAll('input[name="orderType"]').forEach(radio => {
  radio.addEventListener("change", () => toggleOrderType(radio.value));
});

// Update totals when delivery area changes
document.getElementById("delivery-area").addEventListener("change", updateTotals);

// ===== PLACE ORDER =====
document.getElementById("place-order").addEventListener("click", () => {
  const orderType = document.querySelector('input[name="orderType"]:checked').value;
  const fullName = document.getElementById("full-name").value.trim();
  const phone = document.getElementById("phone-number").value.trim();

  if (!fullName || !phone) {
    alert("Please enter your full name and phone number.");
    return;
  }

  if (orderType === "delivery") {
    const street = document.getElementById("street").value.trim();
    const city = document.getElementById("city").value.trim();
    const postcode = document.getElementById("postcode").value.trim();

    if (!street || !city || !postcode) {
      alert("Please complete all required delivery address fields.");
      return;
    }
  }

  alert("Order placed successfully! We will contact you shortly to confirm.");
});