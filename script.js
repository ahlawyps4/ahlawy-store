/* ============ AHLAWY STORE ENGINE - v8.0 (PS4 CACHE FIXED) ============ */

let cart = JSON.parse(localStorage.getItem('ahlawy_cart')) || [];
const STORE_PHONE = "201018251103";

// 1. تسجيل الـ Service Worker (للمتصفحات الحديثة والموبايل)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swUrl = window.location.hostname.includes('github.io') ? '/Ahlawy-Store/sw.js' : '/sw.js';
        navigator.serviceWorker.register(swUrl).then(reg => {
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data.type === 'CACHE_PROGRESS') updateProgressBar(event.data.progress);
            });
        }).catch(err => console.log('SW Error'));
    });
}

// 2. دعم الـ AppCache (المخصص لمتصفح PS4) - التعديل الجذري هنا
if (window.applicationCache) {
    const appCache = window.applicationCache;

    // عند بدء التحميل
    appCache.addEventListener('downloading', () => {
        updateProgressBar(1); // إظهار الشريط فوراً عند بدء السحب
    }, false);

    // متابعة التقدم
    appCache.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            updateProgressBar(progress);
        }
    }, false);

    // عند اكتمال التحميل بنجاح
    appCache.addEventListener('updateready', () => {
        if (appCache.status === appCache.UPDATEREADY) {
            appCache.swapCache();
            updateProgressBar(100);
            setTimeout(() => { location.reload(); }, 2000); // إعادة تحميل لتفعيل الكاش الجديد
        }
    }, false);

    // في حالة كان الملفات محملة مسبقاً
    appCache.addEventListener('noupdate', () => { console.log("الكاش محدث بالفعل."); }, false);
    appCache.addEventListener('cached', () => { updateProgressBar(100); }, false);
}

function updateProgressBar(progress) {
    const container = document.getElementById('cache-progress-container');
    const fill = document.getElementById('progress-bar-fill');
    const percent = document.getElementById('percent-val');
    const status = document.getElementById('status-msg');

    if (container && fill) {
        container.style.display = 'block';
        fill.style.width = progress + '%';
        if (percent) percent.innerText = progress;
        
        if (progress === 100) {
            if (status) status.innerHTML = "✅ تم حفظ المتجر! المتجر يعمل الآن بدون إنترنت. 🦅";
            setTimeout(() => { container.style.display = 'none'; }, 5000);
        }
    }
}

// 3. تحميل الألعاب (Batch Processing)
async function loadGames() {
    const isSubFolder = window.location.pathname.includes('/PS4/') || window.location.pathname.includes('/PS5/');
    const jsonPath = isSubFolder ? '../games.json' : './games.json';
    const baseAssetPath = isSubFolder ? '../' : './';

    try {
        const response = await fetch(jsonPath);
        const games = await response.json();
        const container = document.getElementById('games-container');
        const platform = document.body.getAttribute('data-platform');

        if (!container || !platform) return;

        const filteredGames = games.filter(g => g.platform === platform);
        let allGamesHTML = ''; 

        filteredGames.forEach(game => {
            const finalImgUrl = baseAssetPath + game.img;
            const isInCart = cart.includes(game.title);
            
            allGamesHTML += `
                <div class="game-item">
                    <div class="game-media">
                        <img src="${finalImgUrl}" alt="${game.title}" loading="lazy" onerror="this.src='${baseAssetPath}logo.png';">
                    </div>
                    <div class="game-content">
                        <h3>${game.title}</h3>
                        <button class="add-to-cart-btn ${isInCart ? 'already-added' : ''}" 
                                onclick="addToCart('${game.title.replace(/'/g, "\\'")}')" ${isInCart ? 'disabled' : ''}>
                            ${isInCart ? 'تمت الإضافة 🦅' : 'إضافة للسلة'}
                        </button>
                    </div>
                </div>`;
        });

        container.innerHTML = allGamesHTML;
    } catch (err) { console.error("Load Error", err); }
}

// 4. وظائف السلة (Cart)
function addToCart(gameTitle) {
    if (!cart.includes(gameTitle)) {
        cart.push(gameTitle);
        saveAndRefresh();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('ahlawy_cart', JSON.stringify(cart));
    updateUI();
    updateButtonsState();
}

function updateButtonsState() {
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    buttons.forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr) {
            const titleMatch = onclickAttr.match(/'([^']+)'/);
            if (titleMatch && cart.includes(titleMatch[1])) {
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
    if (count) count.innerText = cart.length;
    if (list) {
        list.innerHTML = cart.map((item, i) => `
            <li style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #333; color:white;">
                <span style="font-size:13px;">${item}</span>
                <button onclick="removeFromCart(${i})" class="remove-btn" style="color:#ff4d4d; background:none; border:none; cursor:pointer;">حذف</button>
            </li>
        `).join('');
    }
}

// 5. البحث السريع (Optimized)
function filterGames() {
    const searchTerm = document.getElementById('game-search').value.toLowerCase();
    const items = document.querySelectorAll('.game-item');
    items.forEach(item => {
        const title = item.querySelector('h3').innerText.toLowerCase();
        item.style.display = title.includes(searchTerm) ? "" : "none";
    });
}

function generateOrderQR() {
    if (cart.length === 0) return alert("السلة فارغة!");
    const msg = "Order Ahlawy Store:\n" + cart.map((t, i) => `${i+1}-${t}`).join("\n");
    const whatsappUrl = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(msg)}`;
    const qrcodeElement = document.getElementById("qrcode");
    
    if (qrcodeElement) {
        qrcodeElement.innerHTML = ""; 
        document.getElementById('qr-container').style.display = "block"; 
        new QRCode(qrcodeElement, { text: whatsappUrl, width: 250, height: 250 });
        window.currentWhatsappUrl = whatsappUrl;
    }
}

function toggleCart() { document.getElementById('cart-section')?.classList.toggle('open'); }

// التشغيل عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    updateUI();
    const searchInput = document.getElementById("game-search");
    if (searchInput) searchInput.addEventListener("input", filterGames);
});