window.addEventListener("DOMContentLoaded", function () {
    const items = Array.isArray(window.WISHLIST_ITEMS) ? window.WISHLIST_ITEMS : [];
    const grid = document.getElementById("wishlist-grid");
    if (!grid) return;

    const userParam = new URLSearchParams(window.location.search).get("user");
    const visibleItems = userParam ? items.filter(item => item.user === userParam) : items;

    const unbundled = visibleItems.filter(item => !String(item.bundle || "").trim());
    unbundled.forEach(item => {
        additem(item.user, item.name, item.amount, item.bio, item.imgUrl, item.tags, "");
    });

    const bundles = new Map();
    visibleItems.filter(item => String(item.bundle || "").trim()).forEach(item => {
        const name = String(item.bundle).trim();
        if (!bundles.has(name)) bundles.set(name, []);
        bundles.get(name).push(item);
    });

    bundles.forEach((bundleItems, bundleName) => {
        const heading = document.createElement("div");
        heading.className = "bundle-group-heading";
        heading.textContent = bundleName;
        grid.appendChild(heading);

        bundleItems.forEach(item => {
            additem(item.user, item.name, item.amount, item.bio, item.imgUrl, item.tags, bundleName);
        });
    });

    if (typeof updateEmptyCategories === "function") updateEmptyCategories();
});
