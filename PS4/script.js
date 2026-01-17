document.addEventListener("DOMContentLoaded", () => {
  // ========= إعدادات =========
  const WHATSAPP_NUMBER = "201018251103"; // دولي بدون +

  // ========= عناصر الصفحة =========
  const gameItems = document.querySelectorAll(".game-item");
  const cartSection = document.getElementById("cart-section");
  const cartList = document.getElementById("cart-list");
  const cartCount = document.getElementById("cart-count");
  const searchInput = document.getElementById("search-input");
  const qrCodeContainer = document.getElementById("qr-code");

  const btnShowCart = document.getElementById("show-cart");
  const btnCloseCart = document.getElementById("close-cart");
  const btnClearCart = document.getElementById("clear-cart");
  const btnGenerateQR = document.getElementById("generate-qr");

  // لو عناصر أساسية ناقصة، وقف بهدوء
  if (!cartList || !cartCount) return;

  // ========= سلة (مع حفظ) =========
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!Array.isArray(cart)) cart = [];
  } catch {
    cart = [];
  }

  // ========= فتح/قفل السلة =========
  function openCart() {
    if (!cartSection) return;
    cartSection.classList.add("open");
  }

  function closeCart() {
    if (!cartSection) return;
    cartSection.classList.remove("open");
  }

  // ========= تحديث عرض السلة =========
  function updateCart() {
    cartList.innerHTML = "";

    cart.forEach((game) => {
      const li = document.createElement("li");

      // زر حذف
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "X";
      removeBtn.classList.add("remove-btn");
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // ✅ يمنع قفل السلة بسبب document click
        removeFromCart(game);
      });

      // اسم اللعبة (في النص)
      const nameSpan = document.createElement("span");
      nameSpan.textContent = game;

      li.appendChild(removeBtn);
      li.appendChild(nameSpan);
      cartList.appendChild(li);
    });

    cartCount.textContent = String(cart.length);
    localStorage.setItem("cart", JSON.stringify(cart));

    // امسح QR لو السلة فاضية
    if (cart.length === 0 && qrCodeContainer) {
      qrCodeContainer.innerHTML = "";
    }
  }

  function removeFromCart(gameName) {
    cart = cart.filter((g) => g !== gameName);
    updateCart();
  }

  // ========= إضافة للسلة =========
  // مهم: نستخدم event delegation عشان تفضل شغالة حتى لو الألعاب اتغيرت
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart");
    if (!btn) return;

    const gameCard = btn.closest(".game-item");
    const gameName = gameCard?.getAttribute("data-game");
    if (!gameName) return;

    // منع التكرار
    if (!cart.includes(gameName)) {
      cart.push(gameName);
      updateCart();
    }
  });

  // ========= فتح السلة =========
  if (btnShowCart) {
    btnShowCart.addEventListener("click", (e) => {
      e.preventDefault();
      openCart();
      updateCart();
    });
  }

  // ========= غلق السلة =========
  if (btnCloseCart) {
    btnCloseCart.addEventListener("click", (e) => {
      e.stopPropagation();
      closeCart();
    });
  }

  // ESC يقفل
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });

  // ✅ قفل السلة عند الضغط خارجها فقط
  document.addEventListener("click", (e) => {
    if (!cartSection || !cartSection.classList.contains("open")) return;

    if (cartSection.contains(e.target)) return;
    if (btnShowCart && btnShowCart.contains(e.target)) return;

    closeCart();
  });

  // ========= إفراغ السلة =========
  if (btnClearCart) {
    btnClearCart.addEventListener("click", (e) => {
      e.stopPropagation();
      cart = [];
      updateCart();
    });
  }

  // ========= البحث =========
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.trim().toLowerCase();

      gameItems.forEach((gameItem) => {
        const gameName = (gameItem.getAttribute("data-game") || "").toLowerCase();
        gameItem.style.display = gameName.includes(searchTerm) ? "" : "none";
      });
    });
  }

  // ========= توليد QR واتساب =========
  if (btnGenerateQR) {
    btnGenerateQR.addEventListener("click", (e) => {
      e.stopPropagation();

      if (cart.length === 0) {
        alert("سلة المشتريات فارغة!");
        return;
      }

      if (!window.QRCode) {
        alert("مكتبة QRCode غير موجودة. تأكد من qrcode.min.js");
        return;
      }

      const messageLines = [
        "طلب جديد من AHLAWY STORE:",
        "قسم: PS4",
        "",
        ...cart.map((g) => `- ${g}`),
      ];

      const text = encodeURIComponent(messageLines.join("\n"));
      const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

      if (!qrCodeContainer) return;
      qrCodeContainer.innerHTML = "";

      new QRCode(qrCodeContainer, {
        text: waLink,
        width: 180,
        height: 180,
        correctLevel: QRCode.CorrectLevel.H,
      });

      const btn = document.createElement("a");
      btn.href = waLink;
      btn.target = "_blank";
      btn.rel = "noopener";
      btn.textContent = "فتح واتساب لإرسال الطلب";
      btn.style.display = "inline-block";
      btn.style.marginTop = "10px";
      btn.style.padding = "10px 12px";
      btn.style.border = "1px solid rgba(255,255,255,0.18)";
      btn.style.borderRadius = "10px";
      btn.style.textDecoration = "none";
      btn.style.color = "#fff";
      btn.style.background = "rgba(45,212,191,0.18)";

      qrCodeContainer.appendChild(document.createElement("div"));
      qrCodeContainer.appendChild(btn);
    });
  }

  // ========= أول رندر =========
  updateCart();
});
