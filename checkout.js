// ===== CONFIG =====
const STRIPE_PAYMENT_LINK  = "https://buy.stripe.com/8x228q73V2khaNE84Xc7u00";
const EMAILJS_PUBLIC_KEY   = "Mn288RG0feIE7MQhU";
const EMAILJS_SERVICE_ID   = "service_hbvxk7k";
const VENDOR_TEMPLATE_ID   = "template_order_vendor";    // create this in EmailJS
const CUSTOMER_TEMPLATE_ID = "template_order_customer";  // create this in EmailJS
const VENDOR_EMAIL         = "maajoskitchen@outlook.com";

// Init EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// ===== PICKUP-ONLY =====
const PICKUP_ONLY_KEYWORDS = ["spring rolls", "samosa", "chicken wings", "fruit salad"];
function isPickupOnly(name) {
  return PICKUP_ONLY_KEYWORDS.some(k => name.toLowerCase().includes(k));
}

// ===== CART =====
let cart = JSON.parse(localStorage.getItem("cart")) || [];
function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }

function getSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
function getDeliveryFee() {
  const sel = document.getElementById("delivery-area");
  return sel ? parseFloat(sel.value) || 0 : 0;
}
function isDeliverySelected() {
  const r = document.querySelector('input[name="orderType"]:checked');
  return r && r.value === "delivery";
}

function updateTotals() {
  const subtotal    = getSubtotal();
  const deliveryFee = isDeliverySelected() ? getDeliveryFee() : 0;
  const total       = subtotal + deliveryFee;
  document.getElementById("checkout-subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("checkout-total").textContent    = total.toFixed(2);
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
    container.innerHTML = `<p style="color:#C4161C;font-weight:600;padding:10px 0;">
      Your cart is empty. <a href="index.html" style="color:#C4161C;">&larr; Go back</a></p>`;
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
        <p class="checkout-item-name">${item.name}
          ${pickupOnly ? '<span class="pickup-tag">Pickup Only</span>' : ''}
        </p>
        <p class="checkout-item-price">&pound;${item.price.toFixed(2)} &times; ${item.quantity} = <strong>&pound;${(item.price * item.quantity).toFixed(2)}</strong></p>
        <div class="checkout-qty-controls">
          <button class="checkout-qty-btn" onclick="checkoutDecrease(${index})">&minus;</button>
          <span class="checkout-qty-display">${item.quantity}</span>
          <button class="checkout-qty-btn" onclick="checkoutIncrease(${index})">+</button>
        </div>
      </div>
      <button class="checkout-remove-btn" onclick="checkoutRemove(${index})" title="Remove">&times;</button>
    `;
    container.appendChild(div);
  });

  updateTotals();
  checkPickupEnforcement();
}

function checkoutIncrease(index) { cart[index].quantity++; saveCart(); renderOrderSummary(); }
function checkoutDecrease(index) {
  if (cart[index].quantity > 1) { cart[index].quantity--; } else { cart.splice(index, 1); }
  saveCart(); renderOrderSummary();
}
function checkoutRemove(index) { cart.splice(index, 1); saveCart(); renderOrderSummary(); }

// ===== PICKUP ENFORCEMENT =====
function checkPickupEnforcement() {
  const hasPickupOnly = cart.some(item => isPickupOnly(item.name));
  const deliveryRadio = document.getElementById("opt-delivery");
  const pickupRadio   = document.getElementById("opt-pickup");
  const warning       = document.getElementById("delivery-warning");
  if (hasPickupOnly) {
    deliveryRadio.disabled = true;
    pickupRadio.checked    = true;
    warning.style.display  = "block";
    toggleOrderType("pickup");
  } else {
    deliveryRadio.disabled = false;
    warning.style.display  = "none";
  }
}

// ===== ORDER TYPE TOGGLE =====
function toggleOrderType(type) {
  const deliveryFields = document.getElementById("delivery-fields");
  const pickupInfo     = document.getElementById("pickup-info-section");
  if (type === "pickup") {
    pickupInfo.style.display    = "block";
    deliveryFields.style.display = "none";
    deliveryFields.querySelectorAll("input, select").forEach(el => el.disabled = true);
  } else {
    pickupInfo.style.display    = "none";
    deliveryFields.style.display = "block";
    deliveryFields.querySelectorAll("input, select").forEach(el => el.disabled = false);
  }
  updateTotals();
}

// ===== SAVE ORDER TO LOCALSTORAGE (picked up by success page) =====
function saveOrderDetails(fullName, phone, email, orderType, address) {
  const subtotal    = getSubtotal();
  const deliveryFee = isDeliverySelected() ? getDeliveryFee() : 0;
  const total       = subtotal + deliveryFee;
  const order = {
    fullName, phone, email, orderType, address,
    items:       cart,
    subtotal:    subtotal.toFixed(2),
    deliveryFee: deliveryFee.toFixed(2),
    total:       total.toFixed(2),
    placedAt:    new Date().toLocaleString("en-GB")
  };
  localStorage.setItem("pendingOrder", JSON.stringify(order));
}

// ===== PLACE ORDER — validate then redirect to Stripe =====
document.getElementById("place-order").addEventListener("click", () => {
  const orderType = document.querySelector('input[name="orderType"]:checked').value;
  const fullName  = document.getElementById("full-name").value.trim();
  const phone     = document.getElementById("phone-number").value.trim();
  const email     = document.getElementById("customer-email").value.trim();

  if (!fullName || !phone) {
    alert("Please enter your full name and phone number.");
    return;
  }
  if (!email || !email.includes("@")) {
    alert("Please enter a valid email address for your order confirmation.");
    return;
  }
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  let address = "";
  if (orderType === "delivery") {
    const street    = document.getElementById("street").value.trim();
    const apartment = document.getElementById("apartment").value.trim();
    const city      = document.getElementById("city").value.trim();
    const postcode  = document.getElementById("postcode").value.trim();
    const areaEl    = document.getElementById("delivery-area");
    const area      = areaEl.options[areaEl.selectedIndex].text;
    if (!street || !city || !postcode) {
      alert("Please complete all required delivery address fields.");
      return;
    }
    address = [street, apartment, city, postcode, area].filter(Boolean).join(", ");
  }

  // Save order so success page can read it
  saveOrderDetails(fullName, phone, email, orderType, address);

  // Build Stripe URL — pass total in pence
  const subtotal    = getSubtotal();
  const deliveryFee = isDeliverySelected() ? getDeliveryFee() : 0;
  const totalPence  = Math.round((subtotal + deliveryFee) * 100);
 var stripeUrl = STRIPE_PAYMENT_LINK + "?prefilled_amount=" + totalPence + "&prefilled_email=" + encodeURIComponent(email);
  // Go to Stripe
  window.location.href = stripeUrl;
});

// ===== INIT =====
renderOrderSummary();
const initialType = document.querySelector('input[name="orderType"]:checked').value;
toggleOrderType(initialType);
document.querySelectorAll('input[name="orderType"]').forEach(radio => {
  radio.addEventListener("change", () => toggleOrderType(radio.value));
});
document.getElementById("delivery-area").addEventListener("change", updateTotals);
