/* ============ AHLAWY STORE ENGINE - v4.5 (PS4 ULTIMATE COMPATIBLE) ============ */

let cart = JSON.parse(localStorage.getItem('ahlawy_cart')) || [];
const STORE_PHONE = "201018251103";

// 1. تسجيل الـ Service Worker مع معالجة نطاق GitHub Pages والـ PS4
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const isGitHub = window.location.hostname.includes('github.io');
        const swUrl = isGitHub ? '/Ahlawy-Store/sw.js' : './sw.js';
        const scope = isGitHub ? '/Ahlawy-Store/' : './';

        navigator.serviceWorker.register(swUrl, { scope: scope })
            .then(reg => {
                console.log('تم التسجيل بنجاح في النطاق:', reg.scope);
                
                navigator.serviceWorker.addEventListener('message', event => {
                    if (event.data.type === 'CACHE_PROGRESS') {
                        updateProgressBar(event.data.progress);
                    }
                });
            })
            .catch(err => console.error('فشل تسجيل الكاش:', err));
    });
}

// 2. دالة تحديث شريط التحميل
function updateProgressBar(progress) {
    const container = document.getElementById('cache-progress-container');
    const fill = document.getElementById('progress-bar-fill');
    const percent = document.getElementById('percent-val');
    const status = document.getElementById('status-msg');

    if (container && fill && percent) {
        container.style.display = 'block';
        fill.style.width = progress + '%';
        percent.innerText = progress;

        if (progress === 100) {
            status.innerHTML = "✅ المتجر جاهز الآن للعمل بدون إنترنت (أوفلاين)";
            setTimeout(() => { container.style.display = 'none'; }, 5000);
        }
    }
}

// 3. تحميل الألعاب مع معالجة ذكية للصور (حل مشكلة WebP للـ PS4)
async function loadGames() {
    const isSubFolder = window.location.pathname.includes('/PS4/') || window.location.pathname.includes('/PS5/');
    const jsonPath = isSubFolder ? '../games.json' : './games.json';
    const baseAssetPath = isSubFolder ? '../' : './';

    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error("فشل تحميل البيانات");
        
        const games = await response.json();
        const container = document.getElementById('games-container');
        const platform = document.body.getAttribute('data-platform');

        if (!container || !platform) return;
        container.innerHTML = '';

        const filtered = games.filter(g => g.platform === platform);

        filtered.forEach(game => {
            // حل سحري للـ PS4: تحويل امتداد webp إلى jpg تلقائياً في الطلب
            const imgPath = game.img.replace('.webp', '.jpg');
            const finalImgUrl = baseAssetPath + imgPath;
            const isInCart = cart.includes(game.title);
            
            container.innerHTML += `
                <div class="game-item">
                    <div class="game-media">
                        <img src="${finalImgUrl}" 
                             alt="${game.title}" 
                             onerror="this.onerror=null; this.src='${baseAssetPath}logo.png';">
                    </div>
                    <div class="game-content">
                        <h3>${game.title}</h3>
                        <button 
                            class="add-to-cart-btn ${isInCart ? 'already-added' : ''}" 
                            onclick="addToCart('${game.title.replace(/'/g, "\\")}')"
                            ${isInCart ? 'disabled' : ''}>
                            ${isInCart ? 'تمت الإضافة 🦅' : 'إضافة للسلة'}
                        </button>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error("خطأ في تحميل الألعاب:", err);
    }
}

// --- باقي الدوال (Saves, Cart, UI) ---
function addToCart(gameTitle) {
    if (!cart.includes(gameTitle)) {
        cart.push(gameTitle);
        saveAndRefresh();
        updateButtonsState();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveAndRefresh();
    updateButtonsState();
}

function saveAndRefresh() {
    localStorage.setItem('ahlawy_cart', JSON.stringify(cart));
    updateUI();
}

function updateButtonsState() {
    const allButtons = document.querySelectorAll('.add-to-cart-btn');
    allButtons.forEach(btn => {
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
                <button onclick="removeFromCart(${i})" class="remove-btn" style="color:#ff4d4d; background:none; border:none;">حذف</button>
            </li>
        `).join('');
    }
    if (qrContainer) qrContainer.style.display = "none";
}

function generateOrderQR() {
    const qrContainer = document.getElementById('qr-container');
    const qrcodeElement = document.getElementById("qrcode");
    if (cart.length === 0) return alert("السلة فارغة!");
    
    const msg = "Order Ahlawy Store:\n" + cart.map((t, i) => `${i+1}-${t}`).join("\n");
    const whatsappUrl = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(msg)}`;

    qrcodeElement.innerHTML = ""; 
    qrContainer.style.display = "block"; 

    new QRCode(qrcodeElement, {
        text: whatsappUrl, width: 250, height: 250,
        colorDark : "#000000", colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.L
    });
    window.currentWhatsappUrl = whatsappUrl;
}

function sendWhatsAppDirect() {
    if (window.currentWhatsappUrl) window.open(window.currentWhatsappUrl, '_blank');
}

function toggleCart() {
    const cartSection = document.getElementById('cart-section');
    if (cartSection) cartSection.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    updateUI();
    const searchInput = document.getElementById('game-search');
    if (searchInput) searchInput.addEventListener('input', filterGames);
});

function filterGames() {
    const searchTerm = document.getElementById('game-search').value.toLowerCase();
    const gameItems = document.querySelectorAll('.game-item');
    gameItems.forEach(item => {
        const title = item.querySelector('h3').innerText.toLowerCase();
        item.style.display = title.includes(searchTerm) ? "block" : "none";
    });
}