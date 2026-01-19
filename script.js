/* ============ AHLAWY STORE ENGINE - v2.6 (UPDATED PHONE) ============ */

let cart = JSON.parse(localStorage.getItem('ahlawy_cart')) || [];
const STORE_PHONE = "201018251103"; // رقمك الجديد تم تحديثه هنا

async function loadGames() {
    const isSubFolder = window.location.pathname.includes('/PS4/') || window.location.pathname.includes('/PS5/');
    const jsonPath = isSubFolder ? '../games.json' : './games.json';
    const baseAssetPath = isSubFolder ? '../' : './';

    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error("بيانات الألعاب غير موجودة");
        
        const games = await response.json();
        const container = document.getElementById('games-container');
        const platform = document.body.getAttribute('data-platform');

        if (!container || !platform) return;
        container.innerHTML = '';

        const filtered = games.filter(g => g.platform === platform);

        if (filtered.length === 0) {
            container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>قريباً.. أحدث الألعاب</p>";
            return;
        }

        filtered.forEach(game => {
            const imgUrl = baseAssetPath + game.img;
            container.innerHTML += `
                <div class="game-item">
                    <div class="game-media">
                        <img src="${imgUrl}" alt="${game.title}" onerror="this.src='${baseAssetPath}logo.png'">
                    </div>
                    <div class="game-content">
                        <h3>${game.title}</h3>
                        <button class="add-to-cart-btn" onclick="addToCart('${game.title.replace(/'/g, "\\")}')">إضافة للسلة</button>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

function addToCart(gameTitle) {
    cart.push(gameTitle);
    saveAndRefresh();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('ahlawy_cart', JSON.stringify(cart));
    updateUI();
}

function updateUI() {
    const count = document.getElementById('cart-count');
    const list = document.getElementById('cart-list');
    const qrContainer = document.getElementById('qr-container');
    
    if (count) count.innerText = cart.length;
    
    if (list) {
        list.innerHTML = cart.map((item, i) => `
            <li style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #333; color:white;">
                <span style="font-size:13px; text-align:right;">${item}</span>
                <button onclick="removeFromCart(${i})" class="remove-btn" style="color:#ff4d4d; background:none; border:none; cursor:pointer;">حذف</button>
            </li>
        `).join('');
    }

    if (qrContainer) {
        qrContainer.style.display = "none";
    }
}

function generateOrderQR() {
    const qrContainer = document.getElementById('qr-container');
    const qrcodeElement = document.getElementById("qrcode");
    
    if (cart.length === 0) {
        alert("السلة فارغة يا بطل!");
        return;
    }

    if (!qrcodeElement || typeof QRCode === 'undefined') {
        alert("خطأ: مكتبة الـ QR غير محملة");
        return;
    }

    const msg = "طلب جديد من أهلاوي ستور 🦅:\n" + cart.map((t, i) => `${i+1}- ${t}`).join("\n");
    const whatsappUrl = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(msg)}`;

    qrcodeElement.innerHTML = ""; 
    qrContainer.style.display = "block"; 

    new QRCode(qrcodeElement, {
        text: whatsappUrl,
        width: 150,
        height: 150,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
    
    window.currentWhatsappUrl = whatsappUrl;
}

function sendWhatsAppDirect() {
    if (window.currentWhatsappUrl) {
        window.open(window.currentWhatsappUrl, '_blank');
    } else {
        const msg = "طلب جديد من أهلاوي ستور 🦅:\n" + cart.map((t, i) => `${i+1}- ${t}`).join("\n");
        window.open(`https://api.whatsapp.com/send?phone=${STORE_PHONE}&text=${encodeURIComponent(msg)}`);
    }
}

function toggleCart() {
    const cartSection = document.getElementById('cart-section');
    if (cartSection) cartSection.classList.toggle('open');
}

document.addEventListener('click', (event) => {
    const cartSection = document.getElementById('cart-section');
    const cartTrigger = document.querySelector('.cart-trigger');
    if (!cartSection || !cartTrigger) return;

    if (cartSection.classList.contains('open')) {
        if (!cartSection.contains(event.target) && 
            !cartTrigger.contains(event.target) && 
            !event.target.classList.contains('remove-btn')) { 
            cartSection.classList.remove('open');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    updateUI();
});