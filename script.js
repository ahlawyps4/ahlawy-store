/* ============ AHLAWY STORE - ALL-IN-ONE SCRIPT ============ */

// 1. تعريف السلة واستعادة البيانات
let cart = JSON.parse(localStorage.getItem('ahlawy_cart')) || [];

// 2. دالة جلب الألعاب وعرضها في الصفحة
async function loadGames() {
    try {
        const response = await fetch('../games.json'); 
        const games = await response.json();
        const container = document.getElementById('games-container');
        const currentPlatform = document.body.getAttribute('data-platform');

        if (!container) return;
        container.innerHTML = '';
        
        // تصفية الألعاب بناءً على المنصة
        const filteredGames = games.filter(game => game.platform === currentPlatform);

        filteredGames.forEach(game => {
            const card = `
                <div class="game-item">
                    <div class="game-media">
                        <img src="../${game.img}" alt="${game.title}" loading="lazy">
                    </div>
                    <div class="game-content">
                        <h3>${game.title}</h3>
                        <button class="add-to-cart-btn" onclick="addToCart('${game.title.replace(/'/g, "\\"')}')">إضافة للسلة</button>
                    </div>
                </div>`;
            container.innerHTML += card;
        });
    } catch (error) {
        console.error("خطأ في تحميل الألعاب:", error);
        if(document.getElementById('games-container')) {
            document.getElementById('games-container').innerHTML = "<p>عذراً، فشل تحميل الألعاب.</p>";
        }
    }
}

// 3. دالة فتح وإغلاق السلة
function toggleCart() {
    const cartSection = document.getElementById('cart-section');
    if (cartSection) {
        cartSection.classList.toggle('open');
    }
}

// 4. إضافة لعبة للسلة
function addToCart(title) {
    cart.push(title);
    localStorage.setItem('ahlawy_cart', JSON.stringify(cart));
    updateCartCount();
    updateCartList();
    
    // فتح السلة تلقائياً عند الإضافة لتنبيه المستخدم
    const cartSection = document.getElementById('cart-section');
    if (cartSection && !cartSection.classList.contains('open')) {
        cartSection.classList.add('open');
    }
}

// 5. تحديث العداد (الرقم اللي في الهيدر)
function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.innerText = cart.length;
    }
}

// 6. تحديث قائمة الأسماء داخل اللوحة الجانبية
function updateCartList() {
    const listElement = document.getElementById('cart-list');
    if (listElement) {
        if (cart.length === 0) {
            listElement.innerHTML = '<li style="color:#888; text-align:center;">السلة فارغة</li>';
        } else {
            listElement.innerHTML = cart.map((item, index) => `
                <li style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:#222; padding:10px; border-radius:5px;">
                    <span style="font-size:13px;">${item}</span>
                    <button onclick="removeFromCart(${index})" style="background:red; color:white; border:none; padding:2px 8px; border-radius:4px; cursor:pointer;">×</button>
                </li>
            `).join('');
        }
    }
}

// 7. حذف لعبة واحدة
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('ahlawy_cart', JSON.stringify(cart));
    updateCartCount();
    updateCartList();
}

// 8. مسح السلة بالكامل
function clearCart() {
    if(confirm("هل تريد مسح السلة؟")) {
        cart = [];
        localStorage.removeItem('ahlawy_cart');
        updateCartCount();
        updateCartList();
    }
}

// 9. إرسال الطلب عبر واتساب
function sendWhatsApp() {
    if (cart.length === 0) return alert("السلة فارغة!");
    
    let message = "طلبية جديدة من أهلاوي ستور 🦅:\n\n";
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item}\n`;
    });
    
    window.open(`https://wa.me/201021424781?text=${encodeURIComponent(message)}`);
}

// تشغيل الوظائف عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadGames(); // تحميل الألعاب
    updateCartCount(); // تحديث العداد
    updateCartList(); // تحديث القائمة
});