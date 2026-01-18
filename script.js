async function loadGames() {
    try {
        // جلب البيانات من ملف الـ JSON
        const response = await fetch('../games.json'); 
        const games = await response.json();
        const container = document.getElementById('games-container');
        
        // تحديد القسم الحالي (هل نحن في صفحة PS4 أم PS5؟)
        const currentPlatform = document.body.getAttribute('data-platform');

        // تنظيف الحاوية قبل العرض لضمان عدم التكرار
        container.innerHTML = '';

        // تصفية الألعاب بناءً على المنصة المختارة
        const filteredGames = games.filter(game => game.platform === currentPlatform);

        filteredGames.forEach(game => {
            const card = `
                <div class="platform-card">
                    <div class="platform-media">
                        <img src="../${game.img}" alt="${game.title}" loading="lazy">
                    </div>
                    <div class="platform-content">
                        <span class="chip">${game.platform}</span>
                        <h3>${game.title}</h3>
                        <div class="btn">تحميل اللعبة</div>
                    </div>
                </div>`;
            container.innerHTML += card;
        });
    } catch (error) {
        console.error("Error loading games:", error);
        document.getElementById('games-container').innerHTML = "<p>عذراً، فشل تحميل الألعاب أوفلاين.</p>";
    }
}

// تشغيل الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadGames);