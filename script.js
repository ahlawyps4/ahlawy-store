/* ============ AHLAWY STORE - CORE SCRIPT v1.02 ============ */

// 1. تعريف مصفوفة السلة واستعادة البيانات المحفوظة
let cart = JSON.parse(localStorage.getItem('ahlawy_cart')) || [];

async function loadGames() {
    try {
        const response = await fetch('../games.json'); 
        const games = await response.json();
        const container = document.getElementById('games-container');
        const currentPlatform = document.body.getAttribute('data-platform');

        if (!container) return;
        container.innerHTML = '';
        
        // تحديث الرقم في السلة فور تحميل الصفحة
        updateCartCount();

        const filteredGames = games.filter(game => game.platform === currentPlatform);

        filteredGames.forEach(game => {
            const card = `
                <div class="game-item">
                    <div class="game-media">
                        <img src="../${game.img}" alt="${game.title}" loading="lazy">
                    </div>
                    <div class="game-content">
                        <h3>${game.title}</h3>
                        <button class="add-to-cart-btn" onclick="addToCart('${game.title.replace(/'/g, "\\'")}')">إضافة للسلة</button>
                    </div>
                </div>`;
            container.innerHTML += card;
        });
    } catch (error) {
        console.error("خطأ في تحميل الألعاب:", error);
        document.getElementById('games-container').innerHTML = "<p>عذراً، فشل تحميل الألعاب.</p>";
    }
}

// 2. دالة إضافة اللعبة للسلة (بدون رسالة Alert)
function addToCart(title) {
    // إضافة اللعبة للمصفوفة
    cart.push(title);
    
    // حفظ السلة في ذاكرة المتصفح
    localStorage.setItem('ahlawy_cart', JSON.stringify(cart));
    
    // تحديث الرقم الظاهر في الصفحة
    updateCartCount();
}

// 3. دالة تحديث رقم عداد السلة
function updateCartCount() {
    // نبحث عن العنصر الذي يحتوي على رقم السلة (تأكد أن الـ id في HTML هو cart-count)
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.innerText = cart.length;
    }
}

// 4. دالة مسح السلة بالكامل (للاستخدام عند الحاجة)
function clearCart() {
    cart = [];
    localStorage.removeItem('ahlawy_cart');
    updateCartCount();
}

document.addEventListener('DOMContentLoaded', loadGames);