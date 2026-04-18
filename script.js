let cart = JSON.parse(localStorage.getItem('cafeCart')) || [];
let orders = JSON.parse(localStorage.getItem('cafeOrders')) || [];

// ── Cart Functions ─────────────────────────────────
function addToBag(name, price) {
    cart.push({ name, price });
    localStorage.setItem('cafeCart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = cart.length;
}

function clearCart() {
    cart = [];
    localStorage.setItem('cafeCart', JSON.stringify(cart));
    updateCartUI();
    botMsg("🗑️ Your bag has been cleared.");
    setTimeout(() => botMsg(cartHTML()), 300);
}

function cartHTML() {
    if (cart.length === 0) {
        return "🛍️ Your bag is empty.<br><a href='menu.html'>Browse Menu →</a>";
    }

    let total = 0;

    const itemsHTML = cart.map(item => {
        total += item.price;
        return `• ${item.name} — ₹${item.price}`;
    }).join('<br>');

    return `
        <b>🛍️ Your Bag:</b><br><br>
        ${itemsHTML}
        <br><br>
        <b>Total: ₹${total}</b>
        <br><br>
        <a href="bag.html">Go to Bag →</a> |
        <span style="cursor:pointer;color:#ff8a80;" onclick="clearCart()">Clear Bag</span>
    `;
}

// ── BAG PAGE LOGIC ────────────────────────────────
function loadCartPage() {
    const cartContainer = document.getElementById('cart-items');
    const totalEl = document.getElementById('total-price');

    if (!cartContainer) return;

    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your bag is empty.</p>";
        totalEl.innerText = "0";
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        const div = document.createElement('div');
        div.style.marginBottom = "10px";

        div.innerHTML = `
            ${item.name} — ₹${item.price}
            <button onclick="removeItem(${index})">❌</button>
        `;

        cartContainer.appendChild(div);
    });

    totalEl.innerText = total;
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('cafeCart', JSON.stringify(cart));
    updateCartUI();
    loadCartPage();
}

// ── Chatbot ───────────────────────────────────────
let chatState = 'idle';
let pendingOrder = { items: [], name: '', address: '' };

function toggleChat() {
    const win = document.getElementById('floating-chat-window');
    const icon = document.getElementById('chat-fab');

    if (win.style.display === 'flex') {
        win.style.display = 'none';
        icon.innerHTML = '☕';
    } else {
        win.style.display = 'flex';
        icon.innerHTML = '✖';
        if (document.getElementById('floating-chat-messages').children.length === 0) {
            botMsg("👋 Welcome to <b>Café Aroma</b>!<br>Try: menu, order, bag");
        }
    }
}

function botMsg(text) {
    const box = document.getElementById('floating-chat-messages');
    const div = document.createElement('div');
    div.className = 'fchat-msg bot';
    div.innerHTML = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function userMsg(text) {
    const box = document.getElementById('floating-chat-messages');
    const div = document.createElement('div');
    div.className = 'fchat-msg user';
    div.innerText = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function sendChat() {
    const input = document.getElementById('floating-chat-input');
    const raw = input.value.trim();
    if (!raw) return;

    const text = raw.toLowerCase();
    input.value = '';
    userMsg(raw);

    setTimeout(() => handleChatInput(text, raw), 400);
}

const menuItems = [
    { name: 'Espresso', price: 120 },
    { name: 'Cappuccino', price: 150 },
    { name: 'Latte', price: 160 },
    { name: 'Cold Brew', price: 180 }
];

function menuHTML() {
    return `<b>☕ Menu:</b><br>` +
        menuItems.map(i => `• ${i.name} — ₹${i.price}`).join('<br>');
}

function handleChatInput(text, raw) {

    // 🛍️ BAG (FIXED)
    if (text.includes('bag') || text.includes('cart')) {
        botMsg(cartHTML());
        return;
    }

    // MENU
    if (text.includes('menu')) {
        botMsg(menuHTML());
        return;
    }

    // QUICK ORDER
    if (text.startsWith('order ')) {
        const found = menuItems.find(i => text.includes(i.name.toLowerCase()));
        if (found) {
            addToBag(found.name, found.price);
            botMsg(`✅ ${found.name} added!<br><a href="bag.html">View Bag →</a>`);
        } else {
            botMsg("Item not found.");
        }
        return;
    }

    // DEFAULT
    botMsg("💡 Try: menu, order latte, bag");
}

// ── INIT ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    updateCartUI();
    loadCartPage(); // 👈 IMPORTANT
});