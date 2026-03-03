// ===== ELEMENTS =====
const cartCount = document.getElementById("cartCount");
const floatingCart = document.getElementById("floatingCart");
const cartItemsContainer = document.getElementById("cartItems");

// Items that cannot be delivered
const PICKUP_ONLY_KEYWORDS = ["spring rolls", "samosa", "chicken wings", "fruit salad"];

function isPickupOnly(name) {
  return PICKUP_ONLY_KEYWORDS.some(k => name.toLowerCase().includes(k));
}

function cartHasPickupOnlyItem() {
  return cart.some(item => isPickupOnly(item.name));
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ===== ITEM CATALOGUE (edit prices/quantities here) =====
const ITEM_CATALOGUE = {
  "plantain-chips": {
    name: "Plantain Chips",
    image: "Plantain.jpeg",
    pickupOnly: false,
    description: "Golden, crispy plantain chips made from fresh ripe plantains. Lightly seasoned and fried to perfection — a crowd-pleasing Nigerian favourite.",
    options: [
      { label: "Small (3pcs)", price: 8.19 },
      { label: "Medium (6pcs)", price: 14.99 },
      { label: "Large (12pcs)", price: 26.00 }
    ]
  },
  "chin-chin": {
    name: "Chin Chin",
    image: "chin chin.jpg",
    pickupOnly: false,
    description: "Crunchy, bite-sized fried dough snacks with a lightly sweet flavour. A timeless Nigerian treat, perfect for snacking or sharing at events.",
    options: [
      { label: "80g Bag (3 bags)", price: 6.00 },
      { label: "500g Bag", price: 9.49 },
      { label: "1kg Bag", price: 16.00 }
    ]
  },
  "fruit-salad": {
    name: "Fruit Salad",
    image: "salad.jpg",
    pickupOnly: true,
    description: "Fresh, colourful seasonal fruits dressed lightly for a refreshing and vibrant addition to your event spread. Collection only — best enjoyed fresh.",
    options: [
      { label: "Small Bowl", price: 8.19 },
      { label: "Medium Bowl", price: 14.00 },
      { label: "Large Platter", price: 22.00 }
    ]
  },
  "puff-puff": {
    name: "Puff Puff",
    image: "puff puff b.jpeg",
    pickupOnly: false,
    description: "Soft, pillowy fried dough balls — lightly sweet and irresistibly fluffy. One of Nigeria's most beloved street snacks, made fresh to order.",
    options: [
      { label: "6 pcs", price: 3.50 },
      { label: "14 pcs", price: 6.00 },
      { label: "30 pcs", price: 12.00 },
      { label: "50 pcs", price: 18.00 }
    ]
  },
  "samosa": {
    name: "Samosa",
    image: "image.png",
    pickupOnly: true,
    description: "Crispy golden pastry triangles filled with a savoury spiced vegetable or meat filling. Made by hand and fried to perfection. Collection only.",
    options: [
      { label: "10 pcs", price: 4.50 },
      { label: "20 pcs", price: 8.00 },
      { label: "50 pcs", price: 18.00 }
    ]
  },
  "spring-rolls": {
    name: "Spring Rolls",
    image: "spring rolls 2.jpeg",
    pickupOnly: true,
    description: "Crunchy, golden spring rolls packed with a flavourful savoury filling. A staple of Nigerian small chops platters. Collection only.",
    options: [
      { label: "10 pcs", price: 12.00 },
      { label: "20 pcs", price: 24.00 },
      { label: "50 pcs", price: 55.00 }
    ]
  },
  "chicken-wings": {
    name: "Chicken Wings",
    image: "wings.jpg",
    pickupOnly: true,
    description: "Juicy, well-seasoned chicken wings marinated in signature spices and cooked to golden perfection. A guaranteed crowd-pleaser. Collection only.",
    options: [
      { label: "10 pcs", price: 13.00 },
      { label: "20 pcs", price: 25.00 },
      { label: "50 pcs", price: 58.00 }
    ]
  },
  "meat-pie": {
    name: "Meat Pie",
    image: "meatpie.jpeg",
    pickupOnly: false,
    description: "Classic Nigerian meat pies with a buttery shortcrust pastry and a hearty savoury filling of minced meat, potatoes and carrots. Freshly baked.",
    options: [
      { label: "3 pcs", price: 8.00 },
      { label: "6 pcs", price: 14.50 },
      { label: "12 pcs", price: 26.00 }
    ]
  },
  "nigerian-buns": {
    name: "Nigerian Buns",
    image: "bonze.jpeg",
    pickupOnly: false,
    description: "Dense, crispy on the outside and soft inside — Nigerian buns are a beloved fried dough snack with a hint of sweetness. Perfect for any occasion.",
    options: [
      { label: "Small Bag", price: 5.00 },
      { label: "Standard Pack", price: 8.00 },
      { label: "Party Pack", price: 14.00 }
    ]
  }
};

// ===== MODAL STATE =====
let modalSelectedOption = null;
let modalCurrentItem = null;

function openItemModal(itemId) {
  const item = ITEM_CATALOGUE[itemId];
  if (!item) return;
  modalCurrentItem = item;
  modalSelectedOption = null;

  document.getElementById("modalImage").src = item.image;
  document.getElementById("modalImage").alt = item.name;
  document.getElementById("modalTitle").textContent = item.name;
  document.getElementById("modalDesc").textContent = item.description;
  document.getElementById("modalPickupBadge").style.display = item.pickupOnly ? "block" : "none";

  // Build options grid
  const grid = document.getElementById("modalOptionsGrid");
  grid.innerHTML = "";
  item.options.forEach((opt, i) => {
    const pill = document.createElement("div");
    pill.className = "modal-option-pill";
    pill.innerHTML = `<span class="pill-qty">${opt.label}</span><span class="pill-price">£${opt.price.toFixed(2)}</span>`;
    pill.addEventListener("click", () => selectModalOption(i, item));
    grid.appendChild(pill);
  });

  document.getElementById("modalSelectedInfo").style.display = "none";
  document.getElementById("modalAddBtn").disabled = true;

  const overlay = document.getElementById("itemModalOverlay");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function selectModalOption(index, item) {
  modalSelectedOption = item.options[index];
  // Update pill highlights
  document.querySelectorAll(".modal-option-pill").forEach((p, i) => {
    p.classList.toggle("selected", i === index);
  });
  // Show selected info
  const info = document.getElementById("modalSelectedInfo");
  info.style.display = "flex";
  document.getElementById("modalSelectedName").textContent = `${item.name} – ${modalSelectedOption.label}`;
  document.getElementById("modalSelectedPrice").textContent = `£${modalSelectedOption.price.toFixed(2)}`;
  document.getElementById("modalAddBtn").disabled = false;
}

function modalAddToCart() {
  if (!modalCurrentItem || !modalSelectedOption) return;
  const name = `${modalCurrentItem.name} (${modalSelectedOption.label})`;
  addToCart(name, modalSelectedOption.price, modalCurrentItem.image);
  closeItemModalBtn();

  // Show brief confirmation
  const btn = document.getElementById("modalAddBtn");
  btn.textContent = "✓ Added!";
  setTimeout(() => { btn.textContent = "Add to Cart"; }, 1200);
}

function closeItemModalBtn() {
  document.getElementById("itemModalOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

function closeItemModal(event) {
  if (event.target === document.getElementById("itemModalOverlay")) {
    closeItemModalBtn();
  }
}

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeItemModalBtn();
});



function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ADD TO CART
function addToCart(name, price, image) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ name, price, image, quantity: 1 });
  }
  saveCart();
  updateCartUI();

  floatingCart.classList.add("pop");
  setTimeout(() => floatingCart.classList.remove("pop"), 220);
}

// INCREASE
function increaseQuantity(index) {
  cart[index].quantity++;
  saveCart();
  updateCartUI();
}

// DECREASE
function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    cart.splice(index, 1);
  }
  saveCart();
  updateCartUI();
}

// REMOVE
function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
}

// CLEAR ALL
function clearCart() {
  if (!confirm("Clear your entire cart?")) return;
  cart = [];
  saveCart();
  updateCartUI();
}

// ===== UPDATE CART UI =====
function updateCartUI() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartCount.textContent = totalItems;
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
    document.getElementById("cartTotal").textContent = "0.00";
    return;
  }

  // Pickup-only notice banner inside cart
  if (cartHasPickupOnlyItem()) {
    const notice = document.createElement("div");
    notice.className = "cart-pickup-notice";
    notice.innerHTML = `🏪 <strong>Collection only</strong> — your order contains items that must be picked up.`;
    cartItemsContainer.appendChild(notice);
  }

  // Clear cart button
  const clearWrap = document.createElement("div");
  clearWrap.className = "clear-cart-wrap";
  clearWrap.innerHTML = `<button class="clear-cart-btn" onclick="clearCart()">Clear Cart</button>`;
  cartItemsContainer.appendChild(clearWrap);

  cart.forEach((item, index) => {
    const pickupFlag = isPickupOnly(item.name);
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}${pickupFlag ? ' <span class="cart-pickup-tag">Pickup</span>' : ''}</p>
        <p class="cart-item-price">£${item.price.toFixed(2)}</p>
        <div class="qty-controls">
          <button class="qty-btn" onclick="decreaseQuantity(${index})">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn" onclick="increaseQuantity(${index})">+</button>
        </div>
      </div>
      <button class="remove-item-btn" onclick="removeItem(${index})" title="Remove">✕</button>
    `;
    cartItemsContainer.appendChild(div);
  });

  document.getElementById("cartTotal").textContent = total.toFixed(2);
}

// ===== OPEN / CLOSE =====
document.getElementById("floatingCart").onclick = function () {
  document.getElementById("cartSidebar").classList.add("open");
};

document.getElementById("closeCart").onclick = function () {
  document.getElementById("cartSidebar").classList.remove("open");
};

document.getElementById("checkoutBtn").addEventListener("click", function () {
  window.location.href = "checkout.html";
});

// Init
updateCartUI();