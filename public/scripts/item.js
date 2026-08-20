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

    const sectionIds = [
        "item-0-25",
        "item-25-50",
        "item-50-75",
        "item-75-100",
        "item-100-500",
        "item-500",
        "item-unk"
    ];

    sectionIds.forEach(id => {

        const section = document.getElementById(id);

        if (!section) return;

        const table = section.querySelector("table");
        const emptyMsg = section.querySelector(".empty-msg");

        const hasItems =
            section.querySelector(".item-details-link") !== null;

        if (emptyMsg) {
            emptyMsg.style.display = hasItems ? "none" : "block";
        }
    });
}


// =========================================================
// CREATE ITEM
// =========================================================

function additem(user, name, amount, bio, imgUrl) {

    // Only show items belonging to the active user
    if (activeUser && user !== activeUser) return;


    // -----------------------------------------------------
    // FIND PRICE CATEGORY
    // -----------------------------------------------------

    let item;

    if (amount === "unk") {

        item = document.getElementById("item-unk");

    } else if (amount < 24.99) {

        item = document.getElementById("item-0-25");

    } else if (amount < 49.99) {

        item = document.getElementById("item-25-50");

    } else if (amount < 74.99) {

        item = document.getElementById("item-50-75");

    } else if (amount < 99.99) {

        item = document.getElementById("item-75-100");

    } else if (amount < 499.99) {

        item = document.getElementById("item-100-500");

    } else if (amount >= 500) {

        item = document.getElementById("item-500");

    } else {

        return;
    }


    if (!item) return;


    // =====================================================
    // CREATE INDIVIDUAL ITEM CARD
    // =====================================================

    const card = document.createElement("div");

    card.classList.add("wishlist-item");


    // -----------------------------------------------------
    // DETAILS LINK
    // -----------------------------------------------------

    const detailsLink = document.createElement("a");

    detailsLink.href =
        `item.html?user=${encodeURIComponent(activeUser)}&name=${encodeURIComponent(name)}`;

    detailsLink.classList.add("item-details-link");


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

    detailsLink.appendChild(h2);
    detailsLink.appendChild(bioText);
    detailsLink.appendChild(price);

    card.appendChild(detailsLink);

    item.appendChild(card);


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