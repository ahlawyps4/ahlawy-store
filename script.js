/* ============ AHLAWY STORE ENGINE - v2.3 (FIXED) ============ */

let cart = JSON.parse(localStorage.getItem('ahlawy_cart')) || [];

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

// إضافة للسلة بدون فتحها تلقائياً
function addToCart(gameTitle) {
    cart.push(gameTitle);
    saveAndRefresh();
    // تم إزالة سطر فتح السلة من هنا بناءً على طلبك
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('ahlawy_cart', JSON.stringify(cart));
    updateUI();
}

// دالة تحديث السلة والـ QR تلقائياً
function updateUI() {
    const count = document.getElementById('cart-count');
    const list = document.getElementById('cart-list');
    const qrContainer = document.getElementById('qr-container');
    
    if (count) count.innerText = cart.length;
    
    if (list) {
        list.innerHTML = cart.map((item, i) => `
            <li>
                <span>${item}</span>
                <button onclick="removeFromCart(${i})" class="remove-btn">حذف</button>
            </li>
        `).join('');
    }

    // إذا كانت السلة فارغة نخفي الـ QR، وإذا كان فيها ألعاب نجهزه
    if (cart.length > 0) {
        generateBasketQR();
    } else {
        if (qrContainer) qrContainer.style.display = "none";
    }
}

// دالة توليد الـ QR داخل السلة
function generateBasketQR() {
    const qrContainer = document.getElementById('qr-container');
    const qrcodeElement = document.getElementById("qrcode");
    
    if (!qrcodeElement) return;

    const msg = "طلب جديد من أهلاوي ستور 🦅:\n" + cart.map((t, i) => `${i+1}- ${t}`).join("\n");
    const whatsappUrl = `https://wa.me/201021424781?text=${encodeURIComponent(msg)}`;

    qrcodeElement.innerHTML = ""; // تنظيف القديم
    qrContainer.style.display = "block"; // إظهار القسم

    new QRCode(qrcodeElement, {
        text: whatsappUrl,
        width: 150, // حجم مناسب للسلة الجانبية
        height: 150,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.M
    });
}function toggleCart() {
    const cartSection = document.getElementById('cart-section');
    if (cartSection) cartSection.classList.toggle('open');
}

// إغلاق السلة عند الضغط في أي مكان خارجها (مع استثناء زر الحذف)
document.addEventListener('click', (event) => {
    const cartSection = document.getElementById('cart-section');
    const cartTrigger = document.querySelector('.cart-trigger');
    
    // التحقق إذا كانت السلة مفتوحة
    if (cartSection.classList.contains('open')) {
        // لو الضغطة بره السلة وبره زرار فتح السلة وبره زرار الحذف
        if (!cartSection.contains(event.target) && 
            !cartTrigger.contains(event.target) && 
            !event.target.classList.contains('remove-btn')) { 
            
            cartSection.classList.remove('open');
        }
    }
});
function sendWhatsApp() {
    if (cart.length === 0) {
        alert("السلة فارغة!");
        return;
    }
    const msg = "طلب جديد من أهلاوي ستور 🦅:\n" + cart.map((t, i) => `${i+1}- ${t}`).join("\n");
    // استخدام api.whatsapp لضمان فتح التطبيق أو الويب بشكل أفضل
    window.open(`https://api.whatsapp.com/send?phone=201021424781&text=${encodeURIComponent(msg)}`);
}

document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    updateUI();
});