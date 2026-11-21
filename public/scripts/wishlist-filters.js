(function () {
  const $ = id => document.getElementById(id);
  let initialized = false;

  function getItems() {
    return Array.from(document.querySelectorAll("#wishlist-grid .wishlist-item"));
  }

  function buildOptions() {
    const source = Array.isArray(window.WISHLIST_ITEMS) ? window.WISHLIST_ITEMS : [];
    const user = new URLSearchParams(location.search).get("user");
    const items = user ? source.filter(item => item.user === user) : source;
    const bundles = [...new Set(items.map(item => String(item.bundle || "").trim()).filter(Boolean))].sort((a,b) => a.localeCompare(b));
    const tags = [...new Set(items.flatMap(item => Array.isArray(item.tags) ? item.tags : []).map(tag => String(tag).trim()).filter(Boolean))].sort((a,b) => a.localeCompare(b));
    $("filter-bundle").innerHTML = '<option value="">All bundles</option>' + bundles.map(v => `<option value="${escapeHtml(v.toLowerCase())}">${escapeHtml(v)}</option>`).join("");
    $("filter-tag-options").innerHTML = tags.length ? tags.map((tag,i) => `<label class="filter-tag-option"><input type="checkbox" value="${escapeHtml(tag.toLowerCase())}" id="filter-tag-${i}"><span>${escapeHtml(tag)}</span></label>`).join("") : '<span class="filter-muted">No tags available</span>';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }

  function sections() {
    const grid = $("wishlist-grid");
    const result = [];
    let current = { heading: null, cards: [] };
    Array.from(grid.children).forEach(node => {
      if (node.classList.contains("bundle-group-heading")) {
        if (current.heading || current.cards.length) result.push(current);
        current = { heading: node, cards: [] };
      } else if (node.classList.contains("wishlist-item")) current.cards.push(node);
    });
    if (current.heading || current.cards.length) result.push(current);
    return result;
  }

  window.openWishlistFilters = function () {
    const overlay = $("wishlist-filter-overlay");
    if (!overlay) return;
    if (!initialized) { buildOptions(); initialized = true; }
    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("filter-open");
  };
  window.closeWishlistFilters = function () {
    const overlay = $("wishlist-filter-overlay");
    if (!overlay) return;
    overlay.classList.remove("visible");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("filter-open");
  };
  window.resetWishlistFilters = function () {
    $("filter-bundle").value = "";
    $("filter-price-min").value = "";
    $("filter-price-max").value = "";
    $("filter-sort").value = "default";
    document.querySelectorAll("#filter-tag-options input").forEach(input => input.checked = false);
    window.applyWishlistFilters();
  };
  window.applyWishlistFilters = function () {
    const bundle = $("filter-bundle").value;
    const min = $("filter-price-min").value === "" ? null : Number($("filter-price-min").value);
    const max = $("filter-price-max").value === "" ? null : Number($("filter-price-max").value);
    const tags = Array.from(document.querySelectorAll("#filter-tag-options input:checked")).map(input => input.value);
    const sort = $("filter-sort").value;

    const groupedSections = sections();
    groupedSections.forEach(section => {
      section.cards.forEach(card => {
        const amount = card.dataset.amount === "unknown" ? null : Number(card.dataset.amount);
        const cardTags = JSON.parse(card.dataset.tags || "[]");
        const cardBundle = card.dataset.bundle || "";
        let show = (!bundle || cardBundle === bundle);
        if (tags.length && !tags.some(tag => cardTags.includes(tag))) show = false;
        if (min !== null && (amount === null || amount < min)) show = false;
        if (max !== null && (amount === null || amount > max)) show = false;
        card.hidden = !show;
      });
      if (section.heading) section.heading.hidden = !section.cards.some(card => !card.hidden);
      if (sort !== "default") {
        const sorted = [...section.cards].sort((a,b) => {
          if (sort.startsWith("price")) {
            const av = a.dataset.amount === "unknown" ? Infinity : Number(a.dataset.amount);
            const bv = b.dataset.amount === "unknown" ? Infinity : Number(b.dataset.amount);
            return sort === "price-asc" ? av-bv : bv-av;
          }
          const cmp = (a.dataset.name || "").localeCompare(b.dataset.name || "");
          return sort === "name-asc" ? cmp : -cmp;
        });
        section.cards = sorted;
      }
    });
    const ordered = document.createDocumentFragment();
    groupedSections.forEach(section => {
      if (section.heading) ordered.appendChild(section.heading);
      section.cards.forEach(card => ordered.appendChild(card));
    });
    $("wishlist-grid").appendChild(ordered);
    closeWishlistFilters();
  };

  document.addEventListener("keydown", event => { if (event.key === "Escape") closeWishlistFilters(); });
  document.addEventListener("DOMContentLoaded", () => {
    buildOptions(); initialized = true;
  });
})();
