// =========================================================
// GET ACTIVE USER
// =========================================================

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const activeUser = getQueryParam("user");


// =========================================================
// CHECK IF MOBILE
// =========================================================

function isMobile() {
    return window.innerWidth <= 768;
}


// =========================================================
// UPDATE EMPTY CATEGORIES
// =========================================================

function updateEmptyCategories() {
    const grid = document.getElementById("wishlist-grid");
    const emptyMsg = document.querySelector("#all-items .empty-msg");
    if (!grid || !emptyMsg) return;

    const hasItems = grid.querySelector(".wishlist-item") !== null;
    emptyMsg.style.display = hasItems ? "none" : "block";
}


// =========================================================
// CREATE ITEM
// =========================================================

function additem(user, name, amount, bio, imgUrl, tags = [], bundle = "") {

    // Only show items belonging to the active user
    if (activeUser && user !== activeUser) return;


    // -----------------------------------------------------
    // ALL ITEMS USE ONE SHARED COLLECTION
    // -----------------------------------------------------
    const itemGrid = document.getElementById("wishlist-grid");
    if (!itemGrid) return;

    // =====================================================
    // CREATE INDIVIDUAL ITEM CARD
    // =====================================================

    const card = document.createElement("div");

    card.classList.add("wishlist-item");
    card.dataset.amount = amount === "unk" ? "unknown" : String(Number(amount));
    card.dataset.name = String(name || "").toLowerCase();
    card.dataset.tags = JSON.stringify(Array.isArray(tags) ? tags.map(tag => String(tag).trim().toLowerCase()) : []);
    card.dataset.bundle = String(bundle || "").trim().toLowerCase();


    // -----------------------------------------------------
    // DETAILS LINK
    // -----------------------------------------------------

    const detailsLink = document.createElement("a");

    detailsLink.href =
        `item.html?user=${encodeURIComponent(activeUser)}&name=${encodeURIComponent(name)}`;

    detailsLink.classList.add("item-details-link");


    // -----------------------------------------------------
    // ITEM IMAGE
    // -----------------------------------------------------

    const imageWrap = document.createElement("div");
    imageWrap.classList.add("wishlist-item-image");
    const image = document.createElement("img");
    image.src = imgUrl && String(imgUrl).trim() ? imgUrl : "assets/images/placeholder.jpeg";
    image.alt = name;
    image.loading = "lazy";
    image.onerror = () => { image.src = "assets/images/placeholder.jpeg"; };
    imageWrap.appendChild(image);

    // -----------------------------------------------------
    // ITEM NAME
    // -----------------------------------------------------

    const h2 = document.createElement("h2");

    h2.classList.add("item-name");

    h2.innerText = name;


    // -----------------------------------------------------
    // ITEM DESCRIPTION
    // -----------------------------------------------------

    const bioText = document.createElement("p");

    bioText.classList.add("item-bio");

    bioText.innerText = bio;


    // -----------------------------------------------------
    // PRICE
    // -----------------------------------------------------

    const price = document.createElement("p");

    price.classList.add("item-price");

    if (amount === "unk") {

        price.innerText = "Price: Unknown";

    } else {

        price.innerText =
            `Price: $${Number(amount).toFixed(2)}`;
    }


    // -----------------------------------------------------
    // BUILD CARD
    // -----------------------------------------------------

    detailsLink.appendChild(imageWrap);
    detailsLink.appendChild(h2);
    detailsLink.appendChild(bioText);
    detailsLink.appendChild(price);

    if (Array.isArray(tags) && tags.length) {
        const tagList = document.createElement("div");
        tagList.className = "wishlist-item-tags";
        tags.forEach(tag => {
            const chip = document.createElement("span");
            chip.className = "wishlist-tag";
            chip.textContent = String(tag);
            tagList.appendChild(chip);
        });
        detailsLink.appendChild(tagList);
    }

    if (bundle) {
        card.dataset.bundle = bundle;
        const bundleLabel = document.createElement("span");
        bundleLabel.className = "wishlist-item-bundle";
        bundleLabel.textContent = bundle;
        detailsLink.appendChild(bundleLabel);
    }

    card.appendChild(detailsLink);

    itemGrid.appendChild(card);
    return card;


    // -----------------------------------------------------
    // UPDATE EMPTY CATEGORY
    // -----------------------------------------------------

    updateEmptyCategories();
}


// =========================================================
// INITIALIZE
// =========================================================

window.addEventListener(
    "DOMContentLoaded",
    updateEmptyCategories
);