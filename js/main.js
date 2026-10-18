/* =========================================
   STRIPOP main script
   ========================================= */
(() => {
  const CART_KEY = "stripop-cart";
  const $ = (sel, root = document) => root.querySelector(sel);

  const state = {
    category: "all",
    sort: "default",
    cart: [],
  };

  /* ---------- ユーティリティ ---------- */
  const yen = (n) => "¥" + n.toLocaleString("ja-JP");

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

  function mediaHtml(p) {
    if (p.image) {
      return `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">`;
    }
    const [c1, c2] = p.colors || [];
    const style = [c1 && `--c1:${c1}`, c2 && `--c2:${c2}`].filter(Boolean).join(";");
    return `<div class="placeholder" style="${style}"><div class="placeholder__case">STRIPOP</div></div>`;
  }

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-show"), 2200);
  }

  function lockScroll() {
    document.body.classList.toggle("is-locked", !!document.querySelector(".modal.is-open, .drawer.is-open"));
  }

  /* ---------- フィルター & 並び替え ---------- */
  function renderFilters() {
    $("#filters").innerHTML = CATEGORIES.map(
      (c) =>
        `<button class="filter${c.id === state.category ? " is-active" : ""}" data-cat="${c.id}" role="tab" aria-selected="${c.id === state.category}">${escapeHtml(c.label)}</button>`
    ).join("");
  }

  function visibleProducts() {
    let list = PRODUCTS.filter((p) => state.category === "all" || p.category === state.category);
    const sorters = {
      new: (a, b) => (b.date || "").localeCompare(a.date || ""),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
    };
    if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);
    return list;
  }

  /* ---------- 商品一覧 ---------- */
  function renderProducts() {
    const list = visibleProducts();
    const grid = $("#productGrid");

    if (!list.length) {
      grid.innerHTML = `<div class="empty"><p class="empty__title">COMING SOON</p><p>このカテゴリーの商品は準備中です。</p></div>`;
      return;
    }

    grid.innerHTML = list
      .map((p) => {
        const cat = CATEGORIES.find((c) => c.id === p.category);
        const badge = p.soldOut
          ? `<span class="card__badge card__badge--soldout">SOLD OUT</span>`
          : p.badge
          ? `<span class="card__badge">${escapeHtml(p.badge)}</span>`
          : "";
        return `
        <article class="card reveal${p.soldOut ? " card--soldout" : ""}" data-id="${p.id}" tabindex="0" aria-label="${escapeHtml(p.name)}">
          <div class="card__media">
            ${badge}
            ${mediaHtml(p)}
            <button class="card__quick" data-add="${p.id}" ${p.soldOut ? "disabled" : ""}>${p.soldOut ? "SOLD OUT" : "+ ADD TO CART"}</button>
          </div>
          <div class="card__body">
            <div>
              <p class="card__cat">${cat ? escapeHtml(cat.label) : ""}</p>
              <h3 class="card__name">${escapeHtml(p.name)}</h3>
            </div>
            <p class="card__price">${yen(p.price)}<small>税込</small></p>
          </div>
        </article>`;
      })
      .join("");

    observeReveal(grid.querySelectorAll(".reveal"));
  }

  /* ---------- 商品詳細モーダル ---------- */
  function openModal(id) {
    const p = findProduct(id);
    if (!p) return;
    const cat = CATEGORIES.find((c) => c.id === p.category);
    const specs = p.specs
      ? `<dl class="detail__specs">${Object.entries(p.specs)
          .map(([k, v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`)
          .join("")}</dl>`
      : "";

    $("#modalContent").innerHTML = `
      <div class="detail">
        <div class="detail__media">${mediaHtml(p)}</div>
        <div class="detail__info">
          <p class="card__cat">${cat ? escapeHtml(cat.label) : ""}</p>
          <h2 class="detail__name" id="modalTitle">${escapeHtml(p.name)}</h2>
          <p class="detail__price">${yen(p.price)}<small>税込</small></p>
          <p class="detail__desc">${escapeHtml(p.description || "")}</p>
          ${specs}
          <div class="detail__buy">
            <div class="qty">
              <button type="button" data-step="-1" aria-label="数量を減らす">−</button>
              <input type="number" id="detailQty" value="1" min="1" max="99" aria-label="数量">
              <button type="button" data-step="1" aria-label="数量を増やす">+</button>
            </div>
            <button class="btn btn--primary" id="detailAdd" ${p.soldOut ? "disabled" : ""}>${p.soldOut ? "SOLD OUT" : "カートに入れる"}</button>
          </div>
        </div>
      </div>`;

    const qty = $("#detailQty");
    $("#modalContent").querySelectorAll("[data-step]").forEach((b) =>
      b.addEventListener("click", () => {
        qty.value = Math.min(99, Math.max(1, (parseInt(qty.value, 10) || 1) + Number(b.dataset.step)));
      })
    );
    $("#detailAdd").addEventListener("click", () => {
      addToCart(p.id, parseInt(qty.value, 10) || 1);
      closeModal();
    });

    $("#modal").classList.add("is-open");
    $("#modal").setAttribute("aria-hidden", "false");
    lockScroll();
    $(".modal__close").focus();
  }

  function closeModal() {
    $("#modal").classList.remove("is-open");
    $("#modal").setAttribute("aria-hidden", "true");
    lockScroll();
  }

  /* ---------- カート ---------- */
  function loadCart() {
    try {
      const data = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(data) ? data.filter((i) => findProduct(i.id)) : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    } catch {
      /* 保存できない環境では無視 */
    }
  }

  function addToCart(id, qty = 1) {
    const p = findProduct(id);
    if (!p || p.soldOut) return;
    const item = state.cart.find((i) => i.id === id);
    if (item) item.qty = Math.min(99, item.qty + qty);
    else state.cart.push({ id, qty });
    saveCart();
    renderCart();
    toast(`カートに追加しました：${p.name}`);
  }

  function setQty(id, qty) {
    if (qty <= 0) state.cart = state.cart.filter((i) => i.id !== id);
    else {
      const item = state.cart.find((i) => i.id === id);
      if (item) item.qty = Math.min(99, qty);
    }
    saveCart();
    renderCart();
  }

  function renderCart() {
    const count = state.cart.reduce((s, i) => s + i.qty, 0);
    const total = state.cart.reduce((s, i) => s + findProduct(i.id).price * i.qty, 0);
    $("#cartCount").textContent = count;
    $("#cartTotal").textContent = yen(total);
    $("#checkout").disabled = count === 0;

    if (!state.cart.length) {
      $("#cartItems").innerHTML = `<div class="drawer__empty"><strong>EMPTY</strong>カートに商品がありません</div>`;
      return;
    }

    $("#cartItems").innerHTML = state.cart
      .map((i) => {
        const p = findProduct(i.id);
        return `
        <div class="cart-item" data-id="${p.id}">
          <div class="cart-item__thumb">${mediaHtml(p)}</div>
          <div>
            <p class="cart-item__name">${escapeHtml(p.name)}</p>
            <p class="cart-item__price">${yen(p.price)}</p>
            <div class="qty">
              <button type="button" data-cart-step="-1" aria-label="数量を減らす">−</button>
              <input type="number" value="${i.qty}" min="1" max="99" data-cart-qty aria-label="数量">
              <button type="button" data-cart-step="1" aria-label="数量を増やす">+</button>
            </div>
          </div>
          <button class="cart-item__remove" data-remove>削除</button>
        </div>`;
      })
      .join("");
  }

  function openCart() {
    $("#drawer").classList.add("is-open");
    $("#drawer").setAttribute("aria-hidden", "false");
    lockScroll();
  }

  function closeCart() {
    $("#drawer").classList.remove("is-open");
    $("#drawer").setAttribute("aria-hidden", "true");
    lockScroll();
  }

  /* ---------- スクロール表示アニメーション ---------- */
  const io =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add("is-visible");
                io.unobserve(e.target);
              }
            }),
          { threshold: 0.1 }
        )
      : null;

  function observeReveal(nodes) {
    nodes.forEach((n) => (io ? io.observe(n) : n.classList.add("is-visible")));
  }

  /* ---------- イベント ---------- */
  function bindEvents() {
    $("#filters").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      state.category = btn.dataset.cat;
      renderFilters();
      renderProducts();
    });

    $("#sort").addEventListener("change", (e) => {
      state.sort = e.target.value;
      renderProducts();
    });

    $("#productGrid").addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      if (add) {
        e.stopPropagation();
        addToCart(add.dataset.add);
        return;
      }
      const card = e.target.closest(".card");
      if (card) openModal(card.dataset.id);
    });

    $("#productGrid").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.classList.contains("card")) openModal(e.target.dataset.id);
    });

    document.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
    document.querySelectorAll("[data-close-cart]").forEach((el) => el.addEventListener("click", closeCart));
    $("#cartOpen").addEventListener("click", openCart);

    $("#cartItems").addEventListener("click", (e) => {
      const row = e.target.closest(".cart-item");
      if (!row) return;
      const item = state.cart.find((i) => i.id === row.dataset.id);
      if (e.target.closest("[data-remove]")) setQty(row.dataset.id, 0);
      const step = e.target.closest("[data-cart-step]");
      if (step && item) setQty(item.id, item.qty + Number(step.dataset.cartStep));
    });

    $("#cartItems").addEventListener("change", (e) => {
      if (!e.target.matches("[data-cart-qty]")) return;
      const id = e.target.closest(".cart-item").dataset.id;
      setQty(id, parseInt(e.target.value, 10) || 0);
    });

    $("#checkout").addEventListener("click", () => {
      // TODO: 決済サービス（Shopify / BASE / STORES / Stripe 等）と連携する
      toast("購入手続きは準備中です");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      closeModal();
      closeCart();
    });

    // モバイルメニュー
    const menuBtn = $("#menuBtn");
    const nav = $("#nav");
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open);
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });

    // ニュースレター
    $("#newsletter").addEventListener("submit", (e) => {
      e.preventDefault();
      // TODO: メール配信サービスと連携する
      $("#newsletterMsg").textContent = "ご登録ありがとうございます！（※現在はデモ表示です）";
      e.target.reset();
    });
  }

  /* ---------- 初期化 ---------- */
  $("#year").textContent = new Date().getFullYear();
  state.cart = loadCart();
  renderFilters();
  renderProducts();
  renderCart();
  bindEvents();
  const staticReveal = document.querySelectorAll(".feature, .faq__item, .concept__inner > *");
  staticReveal.forEach((n) => n.classList.add("reveal"));
  observeReveal(staticReveal);
})();
