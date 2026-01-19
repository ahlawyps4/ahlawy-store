/* ============ AHLAWY STORE ENGINE - v2.7 (SMART BUTTONS) ============ */

let cart = JSON.parse(localStorage.getItem('ahlawy_cart')) || [];
const STORE_PHONE = "201018251103";

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
            // فحص هل اللعبة في السلة فعلاً لتحديد شكل الزر عند التحميل
            const isInCart = cart.includes(game.title);
            
            container.innerHTML += `
                <div class="game-item">
                    <div class="game-media">
                        <img src="${imgUrl}" alt="${game.title}" onerror="this.src='${baseAssetPath}logo.png'">
                    </div>
                    <div class="game-content">
                        <h3>${game.title}</h3>
                        <button 
                            id="btn-${game.title.replace(/\s+/g, '-')}" 
                            class="add-to-cart-btn ${isInCart ? 'already-added' : ''}" 
                            onclick="addToCart('${game.title.replace(/'/g, "\\")}')"
                            ${isInCart ? 'disabled' : ''}>
                            ${isInCart ? 'تمت الإضافة 🦅' : 'إضافة للسلة'}
                        </button>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

function addToCart(gameTitle) {
    if (!cart.includes(gameTitle)) {
        cart.push(gameTitle);
        saveAndRefresh();
        // تحديث شكل الأزرار في الصفحة فوراً
        updateButtonsState();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveAndRefresh();
    // إعادة الأزرار لحالتها الطبيعية بعد الحذف
    updateButtonsState();
}

function saveAndRefresh() {
    localStorage.setItem('ahlawy_cart', JSON.stringify(cart));
    updateUI();
}

// دالة لتحديث حالة الأزرار في الصفحة (اللون والنص)
function updateButtonsState() {
    const allButtons = document.querySelectorAll('.add-to-cart-btn');
    allButtons.forEach(btn => {
        // نستخرج اسم اللعبة من الـ onclick الخاص بالزر
        const titleMatch = btn.getAttribute('onclick').match(/'([^']+)'/);
        if (titleMatch) {
            const gameTitle = titleMatch[1];
            if (cart.includes(gameTitle)) {
                btn.innerText = "تمت الإضافة 🦅";
                btn.classList.add('already-added');
                btn.disabled = true;
            } else {
                btn.innerText = "إضافة للسلة";
                btn.classList.remove('already-added');
                btn.disabled = false;
            }
        }
    });
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

// باقي الدوال (QR وتوليد الكود) كما هي
function generateOrderQR() {
    const qrContainer = document.getElementById('qr-container');
    const qrcodeElement = document.getElementById("qrcode");
    if (cart.length === 0) return alert("السلة فارغة!");
    if (!qrcodeElement || typeof QRCode === 'undefined') return alert("خطأ في المكتبة");

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

document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    updateUI();
});